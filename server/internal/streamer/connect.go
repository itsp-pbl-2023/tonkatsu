package streamer

import (
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{}

func (s *Streamer) ConnectWS(ctx *gin.Context) error {
	roomID := ctx.Query("room")
	if roomID == "" {
		fmt.Println("roomIDがないよ")
		return ctx.Error(nil)
	}
	conn, err := upgrader.Upgrade(ctx.Writer, ctx.Request, nil)
	if err != nil {
		fmt.Println("http connectionをWebScoketへアップレードできなかったよ")
		// errを表示
		fmt.Println(err)
		return ctx.Error(err)
	}
	// defer conn.Close()
	client := newClient(roomID, conn, s.reciver)

	s.clients[client.id] = client
	go client.listen()
	go client.send()

	<-client.closer

	delete(s.clients, client.id)

	// nocontextでStatusOKを返す
	return ctx.Error(nil)
}
