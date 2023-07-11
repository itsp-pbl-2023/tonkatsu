package room

import (
	"fmt"
	"tonkatsu-server/internal/chatgpt"
	"tonkatsu-server/internal/game"
	. "tonkatsu-server/internal/model"
)

type RoomID string

// 部屋を表す構造体.
// 部屋の状態の保持, クライアント間のやり取りの仲介
type Room struct {
	id         RoomID
	host       UserID
	subscriber chan *enteredClient
	clients    map[UserID]roomClient
	context    *game.Context
	closer     chan bool
}

// Roomからみたクライアント
type roomClient struct {
	name     string
	sender   chan<- *RoomMessage
	receiver <-chan *ClientMessage
}

// Roomへ送る, 入室したいクライアントの情報
type enteredClient struct {
	id       userID
	name     string
	receiver <-chan *ClientMessage
	sender   chan<- *RoomMessage
}

// NewRoomはユーザがいない部屋を作成する
func NewRoom(roomId RoomID, userId UserID) Room {
	return Room{
		id:         roomId,
		host:       userId,
		subscriber: make(chan *enteredClient, 1),
		clients:    map[UserID]roomClient{},
		context:    game.NewContext(),
		closer:     make(chan bool, 1),
	}
}

func (r *Room) run() {
	defer r.close()
	shouldClose := r.handleMessagesInWaiting()
	if shouldClose {
		return
	}
	r.broadCast(&RoomMessage{Command: CmdRoomStartGame, Content: nil}) // クライアントにゲーム開始を伝える
	r.setParticipants()                                                // ゲームの参加者IDを設定

	for {
		select {
		case <-r.closer:
			return
		default:
		}
		r.tellRoles()                          // クライアントにQuestionerのIDを伝える
		r.context.SetPhase(game.PhaseQuestion) // 状態をQuestionerの回答待ちにする
		r.handleMessagesFromQuestioner()       // questionerの回答を待つ
		r.getDescriptions()                    // ChatGPTにQuestionを投げる
		for i := 0; i < 5; i++ {
			r.sendDescription(i)
			r.handleMessagesFromAnswerer()            //Answererの回答を待つ→出題者に逐次送る or 採点を待つ→スコアを回答者に送る
			done := r.handleMessagesNextDescription() //game_next_description/game_questioner_doneを待つ
			if done {
				break
			}
		}
		r.showResult()                  //game_show_resultを送る
		is_finish := r.handleNextGame() //game_next_game/game_finish_gameを待つ, 出題者変更
		if is_finish {
			break
		}
	}
	r.showAllResults()
	r.finish()
}

// 待機中に送られてくるメッセージを処理する
func (r *Room) handleMessagesInWaiting() bool {
	for {
		select {
		case c := <-r.subscriber:
			r.subscribe(c.id, c.name, c.receiver, c.sender)
		case <-r.closer:
			return true
		default:
		}
		// クライアントからのメッセージを処理
		for userId, client := range r.clients {
			select {
			case m := <-client.receiver:
				switch m.Command {
				case CmdClientLeaveRoom:
					r.cancelSubscribe(userId)
					names := r.userNames()
					r.broadCast(&RoomMessage{
						Command: CmdRoomUsersInRoom,
						Content: names,
					})
				case CmdClientCloseRoom:
					r.broadCast(&RoomMessage{
						Command: CmdRoomClose,
						Content: nil,
					})
					r.finish()
					return true
				case CmdClientStartGame:
					r.context.GameMode = string(m.Content.(ClientMsgGameMode))
					return false
				default:
				}
			default:
			}
		}
	}
}

func (r *Room) setParticipants() {
	var userIDs []UserID
	for id := range r.clients {
		userIDs = append(userIDs, id)
	}
	r.context.Participants = userIDs
}

func (r *Room) tellRoles() {
	var questionerID userID
	questionerID = r.context.SelectQuestioner()
	r.broadCast(&RoomMessage{Command: CmdRoomQuestioner, Content: RoomQuestioner(questionerID)})
}

func (r *Room) handleMessagesFromQuestioner() {
	for {
		for userId, client := range r.clients {
			// questionerからのメッセージを処理
			select {
			case message := <-client.receiver:
				switch message.Command {
				case CmdClientQuestion:
					question := message.Content.(ClientMsgQuestion)
					if userId == r.context.Questioner {
						topic := question.topic
						question := question.question
						r.context.SetTopic(topic)
						r.context.SetQuestion(question)
						return
					}
				default:
				}
			default:
			}
		}
	}
}

func (r *Room) getDescriptions() {
	r.context.Descriptions = chatgpt.AskChatGPT(r.context.Question, r.context.GameMode)
}

func (r *Room) sendDescription(index int) {
	r.context.StartAnswering(index)
	message := RoomMessage{Command: CmdRoomDescription, Content: RoomDescription{Description: r.context.Descriptions[index], Index: index}}
	r.broadCast(&message)
}

// Answererの回答を待つ→出題者に逐次送る
func (r *Room) handleMessagesFromAnswerer() {
	for {
		for _, participant := range r.context.Participants {
			select {
			case m := <-r.clients[participant].receiver:
				switch m.Command {
				case CmdClientAnswer:
					// Answerを出すのは回答者のみ
					if participant == r.context.Questioner {
						continue
					}
					// userNameの取得
					userName := r.clients[participant].name
					// answerの取得
					answer := m.Content.(ClientMsgAnswer)
					r.broadCast(&RoomMessage{
						Command: CmdRoomAnswer,
						Content: RoomAnswer{
							userName: userName,
							answer:   string(answer),
						},
					})
				// 回答者の回答を出題者が採点する時
				// 回答者が自身の正誤を確認した時
				case CmdClientCorrectUsers:
					if participant != r.context.Questioner {
						continue
					}
					correctUsers := m.Content.(ClientMsgCorrectUsers)
					r.context.AddCorrectUsers(r.mapUserNamesToUserIds(correctUsers))
					r.broadCast(&RoomMessage{
						Command: CmdRoomCorrectUsers,
						Content: RoomCorrectUsers(correctUsers),
					})
					return
				default:
				}
			default:
			}
		}
	}
}

// game_next_description/game_questioner_doneを待つ
// game_questioner_doneならtrueを返す
func (r *Room) handleMessagesNextDescription() bool {

	for {
		for userId, client := range r.clients {
			// questionerからのメッセージを処理
			select {
			case message := <-client.receiver:
				switch message.Command {
				case CmdClientNextQuestion:
					if userId == r.context.Questioner {
						return false
					}
				case CmdClientDoneQuestion:
					if userId == r.context.Questioner {
						return true
					}
				default:
					return false
				}
			default:
			}
		}
	}
}

func (r *Room) showResult() {
	results := r.context.CalculateScore(r.context.CurrentTurn())
	roomResults := make([]RoomResult, 0, len(results))
	for userId, score := range results {
		roomResults = append(roomResults, RoomResult{
			userName: r.clients[userId].name,
			score:    score,
		})
	}
	r.broadCast(&RoomMessage{
		Command: CmdRoomResult,
		Content: RoomResults{
			result:     roomResults,
			question:   r.context.Question,
			questioner: r.clients[r.context.Questioner].name,
		},
	})
}

// game_next_game/game_finish_gameを待つ, 出題者変更
// game_finish_gameなら trueを返す
func (r *Room) handleNextGame() bool {
	for {
		for userId, client := range r.clients {
			select {
			case m := <-client.receiver:
				switch m.Command {
				case CmdClientNextGame:
					if userId != r.context.Questioner {
						break
					}
					r.context.NextTurn()
					return false
				case CmdClientFinishGame:

					return true
				default:
				}
			default:
			}
		}
	}
}

func (r *Room) showAllResults() {
	names := r.userNames()
	results := make([]RoomFinalResult, 0, len(names))

	scores := r.context.CalculateFinalScore()
	for userId, score := range scores {
		name, err := GetUserName(userId)
		if err != nil {
			fmt.Printf(err.Error())
		}
		result := RoomFinalResult{userName: name, score: score}
		results = append(results, result)
	}
	message := RoomMessage{Command: CmdRoomFinalResult, Content: results}
	r.broadCast(&message)
}

func (r *Room) finish() {
	idList := make([]UserID, 0, len(r.clients))
	for id := range r.clients {
		idList = append(idList, id)
	}
	for _, id := range idList {
		r.cancelSubscribe(id)
	}
}

func (r *Room) close() {
	for _, client := range r.clients {
		client.sender <- &RoomMessage{
			Command: CmdRoomClose,
			Content: nil,
		}
	}
	ra.deleteRoom(r.id)
}

// 部屋にクライアントを登録する
// r.Run GoRoutine内で呼ぶべし
func (r *Room) subscribe(
	id UserID,
	name string,
	receiver <-chan *ClientMessage,
	sender chan<- *RoomMessage,
) {
	client := roomClient{
		name:     name,
		receiver: receiver,
		sender:   sender,
	}
	r.clients[id] = client
	names := r.userNames()
	r.broadCast(&RoomMessage{
		Command: CmdRoomUsersInRoom,
		Content: names,
	})
}

func (r *Room) cancelSubscribe(id UserID) {
	delete(r.clients, id)
}

func (r *Room) broadCast(m *RoomMessage) {
	for _, client := range r.clients {
		client.sender <- m
	}
}

func (r *Room) userNames() RoomUsers {
	names := make([]string, 0, len(r.clients))
	for _, client := range r.clients {
		names = append(names, client.name)
	}
	return names
}

func (r *Room) mapUserNamesToUserIds(userNames []string) []UserID {
	nameToUserId := make(map[string]UserID, len(r.clients))
	userIds := make([]UserID, 0, len(userNames))
	for userId, client := range r.clients {
		nameToUserId[client.name] = userId
	}
	for _, userName := range userNames {
		userIds = append(userIds, nameToUserId[userName])
	}
	return userIds
}
