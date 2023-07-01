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

		switch message.Command {
		case model.WSCmdLeave:
			return
		}
	}
}

func (client *client) listenRoom(wg *sync.WaitGroup) {
	defer wg.Done()
	defer func() {
		client.conn.WriteJSON(model.WSMessageToSend{
			Command: model.WSCmdLeave,
			Content: nil,
		})
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
				return
			case CmdRoomUsersInRoom:
				userNames := m.Content.(RoomUsers)
				err := client.conn.WriteJSON(model.WSMessageToSend{
					Command: model.WSCmdSendUpdateMembers,
					Content: model.UpdateMembers{UserNames: userNames},
				})
				if err != nil {
					return
				}
			case CmdRoomStartGame:
				err := client.conn.WriteJSON(model.WSMessageToSend{
					Command: model.WSCmdSendStartGame,
					Content: nil,
				})
				if err != nil {
					return
				}
			case CmdRoomQuestioner:
				questioner := m.Content.(RoomQuestioner)
				isQuestioner := client.id == model.UserID(questioner)
				err := client.conn.WriteJSON(model.WSMessageToSend{
					Command: model.WSCmdSendRole,
					Content: model.SendRole{IsQuestioner: isQuestioner},
				})
				if err != nil {
					return
				}
			case CmdRoomDescription:
				description := m.Content.(RoomDescription)
				err := client.conn.WriteJSON(model.WSMessageToSend{
					Command: model.WSCmdSendDescription,
					Content: model.SendDescription{
						Description: description.description,
						Index:       description.index,
					},
				})
				if err != nil {
					return
				}
			case CmdRoomAnswer:
				answer := m.Content.(RoomAnswer)
				err := client.conn.WriteJSON(model.WSMessageToSend{
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
				err := client.conn.WriteJSON(model.WSMessageToSend{
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
				err := client.conn.WriteJSON(model.WSMessageToSend{
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
				err := client.conn.WriteJSON(model.WSMessageToSend{
					Command: model.WSCmdSendResults,
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
