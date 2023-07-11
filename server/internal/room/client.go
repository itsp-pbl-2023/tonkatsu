package room

import (
	"fmt"
	"os"
	"sync"
	"sync/atomic"
	"time"
	"tonkatsu-server/internal/model"

	"github.com/gorilla/websocket"
)

type client struct {
	id       userID
	name     string
	conn     *websocket.Conn
	sender   chan<- *ClientMessage
	receiver <-chan *RoomMessage
	left     atomic.Bool
}

func newClient(
	id userID,
	name string,
	conn *websocket.Conn,
	sender chan<- *ClientMessage,
	receiver <-chan *RoomMessage,
) client {
	new := client{
		id:       id,
		name:     name,
		conn:     conn,
		sender:   sender,
		receiver: receiver,
		left:     atomic.Bool{},
	}
	new.left.Store(false)
	return new
}

func (client *client) listenWS(wg *sync.WaitGroup) {
	// TODO
	defer wg.Done()
	defer func() {
		client.sender <- &ClientMessage{
			Command: CmdClientLeaveRoom,
			Content: nil,
		}
		client.left.Store(true)
	}()

	for {
		if client.left.Load() {
			return
		}
		deadline := time.Now().Add(time.Minute * 10)
		client.conn.SetReadDeadline(deadline)
		messageType, m, err := client.conn.ReadMessage()
		if err != nil {
			return
		}
		if messageType != websocket.TextMessage {
			continue
		}
		message, err := model.UnMarshalJSON(m)
		if err != nil {
			return
		}

		client.LogReceivedMessage(&message)

		switch message.Command {
		case model.WSCmdLeave:
			return
		case model.WSCmdCloseRoom:
			client.sender <- &ClientMessage{
				Command: CmdClientCloseRoom,
				Content: nil,
			}
		case model.WSCmdStartGame:
			content := message.Content.(model.WSContentGameMode)
			client.sender <- &ClientMessage{
				Command: CmdClientStartGame,
				Content: ClientMsgGameMode(content.GameMode),
			}
		case model.WSCmdQuestionerQuestion:
			content := message.Content.(model.WSContentQuestionerQuestion)
			client.sender <- &ClientMessage{
				Command: CmdClientQuestion,
				Content: ClientMsgQuestion{
					topic:    content.Topic,
					question: content.Question,
				},
			}
		case model.WSCmdAnswererAnswer:
			content := message.Content.(model.WSContentAnswererAnswer)
			client.sender <- &ClientMessage{
				Command: CmdClientAnswer,
				Content: ClientMsgAnswer(content.Answer),
			}
		case model.WSCmdQuestionerCheck:
			content := message.Content.(model.WSContentCorrectUserList)
			client.sender <- &ClientMessage{
				Command: CmdClientCorrectUsers,
				Content: ClientMsgCorrectUsers(content.CorrectUsersList),
			}
		case model.WSCmdNextDescription:
			client.sender <- &ClientMessage{
				Command: CmdClientNextGame,
				Content: nil,
			}
		case model.WSCmdQuestionerDone:
			client.sender <- &ClientMessage{
				Command: CmdClientDoneQuestion,
				Content: nil,
			}
		case model.WSCmdNextGame:
			client.sender <- &ClientMessage{
				Command: CmdClientNextGame,
				Content: nil,
			}
		case model.WSCmdFinishGame:
			client.sender <- &ClientMessage{
				Command: CmdClientFinishGame,
				Content: nil,
			}
		}
	}
}

func (client *client) listenRoom(wg *sync.WaitGroup) {
	defer wg.Done()
	defer func() {
		client.left.Store(true)
	}()

	for {
		if client.left.Load() {
			return
		}
		select {
		case m := <-client.receiver:
			switch m.Command {
			case CmdRoomClose:
				client.writeJSONWithLog(&model.WSMessageToSend{
					Command: model.WSCmdCloseRoom,
					Content: nil,
				})
				return
			case CmdRoomUsersInRoom:
				userNames := m.Content.(RoomUsers)
				err := client.writeJSONWithLog(&model.WSMessageToSend{
					Command: model.WSCmdSendUpdateMembers,
					Content: model.UpdateMembers{UserNames: userNames},
				})
				if err != nil {
					return
				}
			case CmdRoomStartGame:
				err := client.writeJSONWithLog(&model.WSMessageToSend{
					Command: model.WSCmdSendStartGame,
					Content: nil,
				})
				if err != nil {
					return
				}
			case CmdRoomQuestioner:
				questioner := m.Content.(RoomQuestioner)
				isQuestioner := client.id == model.UserID(questioner)
				err := client.writeJSONWithLog(&model.WSMessageToSend{
					Command: model.WSCmdSendRole,
					Content: model.SendRole{IsQuestioner: isQuestioner},
				})
				if err != nil {
					return
				}
			case CmdRoomDescription:
				description := m.Content.(RoomDescription)
				err := client.writeJSONWithLog(&model.WSMessageToSend{
					Command: model.WSCmdSendDescription,
					Content: model.SendDescription{
						Description: description.Description,
						Index:       description.Index,
					},
				})
				if err != nil {
					return
				}
			case CmdRoomAnswer:
				answer := m.Content.(RoomAnswer)
				err := client.writeJSONWithLog(&model.WSMessageToSend{
					Command: model.WSCmdSendAnswer,
					Content: model.SendAnswer{
						UserName: answer.userName,
						Answer:   answer.answer,
					},
				})
				if err != nil {
					return
				}
			case CmdRoomCorrectUsers:
				correctUsers := m.Content.(RoomCorrectUsers)
				err := client.writeJSONWithLog(&model.WSMessageToSend{
					Command: model.WSCmdSendCorrectUsers,
					Content: model.SendCorrectUsers{
						CorrectUserList: correctUsers,
					},
				})
				if err != nil {
					return
				}
			case CmdRoomResult:
				results := m.Content.(RoomResults)
				sendResults := make([]model.SendResult, len(results.result))
				for i, result := range results.result {
					sendResults[i] = model.SendResult{
						UserName: result.userName,
						Score:    result.score,
					}
				}
				err := client.writeJSONWithLog(&model.WSMessageToSend{
					Command: model.WSCmdSendResults,
					Content: model.SendResults{
						Result:     sendResults,
						Question:   results.question,
						Questioner: results.questioner,
					},
				})
				if err != nil {
					return
				}
			case CmdRoomFinalResult:
				results := m.Content.([]RoomFinalResult)
				sendResults := make([]model.SendResult, len(results))
				for i, result := range results {
					sendResults[i] = model.SendResult{
						UserName: result.userName,
						Score:    result.score,
					}
				}
				err := client.writeJSONWithLog(&model.WSMessageToSend{
					Command: model.WSCmdSendFinalResults,
					Content: model.SendFinalResults{
						Result: sendResults,
					},
				})
				if err != nil {
					return
				}
			default:
				fmt.Fprintf(os.Stderr, "[ERR]Client (id:%d) received an undefined message: %v", client.id, m)
			}
		default:
		}
	}
}

func (client *client) LogReceivedMessage(message *model.WSMessageToReceive) {
	fmt.Fprintf(os.Stderr, "[LOG] Receive WebSocket Message.   Command: \"%v\".   UserName: %s.\n", message.Command, client.name)
}

func (client *client) writeJSONWithLog(message *model.WSMessageToSend) error {
	fmt.Fprintf(os.Stderr, "[LOG] Send WebSocket Message.   Command: \"%v\".   UserName: %s.\n", message.Command, client.name)
	return client.conn.WriteJSON(message)
}
