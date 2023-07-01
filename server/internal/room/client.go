package room

import (
	"sync"
	"sync/atomic"
	"time"
	"tonkatsu-server/internal/model"

	"github.com/goccy/go-json"
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
		case model.WSCmdStartGame:
			client.sender <- &ClientMessage{
				Command: CmdClientStartGame,
				Content: nil,
			}
			return
		case model.WSCmdQuestionerQuestion:
			client.sender <- &ClientMessage{
				Command: CmdClientQuestion,
				Content: message.Content.(ClientMsgQuestion),
			}
			return
		case model.WSCmdAnswererAnswer:
			client.sender <- &ClientMessage{
				Command: CmdClientAnswer,
				Content: message.Content.(ClientMsgAnswer),
			}
			return
		case model.WSCmdQuestionerCheck:
			client.sender <- &ClientMessage{
				Command: CmdClientCheck,
				Content: message.Content.(ClientMsgCorrectUsers),
			}
			return
	}
}

func (client *client) listenRoom(wg *sync.WaitGroup) {
	// TODO
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
					Command: model.WSCmdUpdateMembers,
					Content: model.UpdateMembers{UserNames: userNames},
				})
				if err != nil {
					return
				}
			}
		default:
		}
	}
}
