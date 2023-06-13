package game

import (
	"tonkatsu-server/internal/model"

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


