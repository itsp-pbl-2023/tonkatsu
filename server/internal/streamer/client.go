package streamer

import (
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

//             |       server      |
// frontend <-> client <-> streamer

// client <-> streamer
type reciveData struct {
	id uuid.UUID
	roomID string
	payload []byte
}

type client struct {
	id uuid.UUID
	roomID string
	// frontend <-> client
	conn *websocket.Conn
	// client -> streamer
	receiver chan reciveData
	// client <- streamer
	sender chan string
	// connectionが切れた時とかにclientを削除する
	closer chan bool
}

func newClient(roomID string, conn *websocket.Conn, recever chan reciveData) *client {
	return &client {
		id: uuid.Must(uuid.New(), nil),
		roomID: roomID,
		conn: conn,
		receiver: recever,
		sender: make(chan string),
		closer: make(chan bool),
	}
}

// frontend -> client 間のlisten
func (c *client) listen() {
	for {
		messageType, message, err := c.conn.ReadMessage()
		if err != nil {
			c.closer <- true
			return
		}
		if messageType != websocket.TextMessage {
			continue
		}
		c.receiver <- reciveData {
			id: c.id,
			roomID: c.roomID,
			payload: message,
		}
	}
}

// frontend <- client 間の送信
func (c *client) send() {
	for {
		message := <- c.sender
		err := c.conn.WriteMessage(websocket.TextMessage, []byte(message))
		if err != nil {
			c.closer <- true
			return
		}
	}
}
