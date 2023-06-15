package room

import (
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type client struct {
	id userID
	name string
	conn *websocket.Conn
	sender chan<- ClientMessage
	receiver <-chan RoomMessage
	close bool
}

func newClient(
	id userID,
	name string,
	conn *websocket.Conn,
	sender chan<- ClientMessage,
	receiver <-chan RoomMessage,
) client {
	return client {
		id: id,
		name: name,
		conn: conn,
		sender: sender,
		receiver: receiver,
		close: false,
	}
}

func (client *client) listenWS(wg *sync.WaitGroup) {
	// TODO
	// for {
	// 	messageType, message, err := client.conn.ReadMessage()
	// 	if err != nil {
	// 		client.close = true
	// 		return
	// 	}
	// 	if messageType != websocket.TextMessage {
	// 		continue
	// 	}
	// }
	
	time.Sleep(time.Second * 5)
	wg.Done()
}

func (client *client) listenRoom(wg *sync.WaitGroup) {
	// TODO
	// for {
	// 	select {
	// 	case m := <-client.receiver:
	// 		switch m.Command {
	// 		case CmdClose:
	// 			client.close = true
	// 			return
	// 		}
	// 	}
	// }

	time.Sleep(time.Second * 5)
	wg.Done()
}
