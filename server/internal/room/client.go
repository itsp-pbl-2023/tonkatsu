package room

import (
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
	close    atomic.Bool
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
		close:    atomic.Bool{},
	}
	new.close.Store(false)
	return new
}

func (client *client) listenWS(wg *sync.WaitGroup) {
	// TODO
	defer wg.Done()
	defer func() {
		client.sender <- &ClientMessage{
			Command: CmdLeaveRoom,
			Content: nil,
		}
		client.close.Store(true)
	}()

	for {
		if client.close.Load() {
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
		
		switch message.Command{
		case model.WSCmdLeave:
			return
		}
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
		client.close.Store(true)
	}()

	for {
		if client.close.Load() {
			return
		}
		select {
		case m := <-client.receiver:
			switch m.Command {
			case CmdClose:
				return
			case CmdUsersInRoom:
				userNames := m.Content.(UsersInRoom)
				err := client.conn.WriteJSON(model.WSMessageToSend{
					Command: model.WSCmdUpdateMembers,
					Content: model.UpdateMembers{UserNames: userNames},
				})
				if err != nil {
					return
				}
			}
		}
	}
}