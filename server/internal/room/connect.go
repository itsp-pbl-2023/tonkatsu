package room

import (
	"fmt"
	"net/http"
	"os"
	"sync"
	"time"
	"tonkatsu-server/internal/model"
	"tonkatsu-server/internal/session"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type userID = model.UserID

var upgrader = websocket.Upgrader{CheckOrigin: func(r *http.Request) bool {
	// may be dangerous
	return true
}}

func ConnectWS(ctx *gin.Context) {
	roomId := RoomID(ctx.Query("roomid"))
	if roomId == "" {
		ctx.Status(http.StatusBadRequest)
		return
	}
	userId, ok := session.GetUserId(ctx)
	if !ok {
		ctx.Status(http.StatusInternalServerError)
		return
	}
	userName, err := model.GetUserName(model.UserID(userId))
	if err != nil {
		ctx.Status(http.StatusInternalServerError)
		return
	}
	clientSender := make(chan *ClientMessage, 1)
	clientReceiver, ok := ra.clientEnterRoom(
		roomId,
		userId,
		userName,
		clientSender,
	)
	if !ok {
		ctx.Status(http.StatusBadRequest)
		return
	}

	var userNames RoomUsers
	// maxWait * waitMiliSec ms だけRoomからの応答を待つ.
	// 応答がなければRoomが閉じたと判断し終了.
wait:
	for t, maxWait, waitMiliSec := 0, 10, 100*time.Millisecond; true; t += 1 {
		select {
		case m := <-clientReceiver:
			if m.Command != CmdRoomUsersInRoom {
				ctx.Status(http.StatusInternalServerError)
				return
			}
			userNames = m.Content.(RoomUsers)
			break wait
		default:
		}
		if t == maxWait {
			ctx.Status(http.StatusBadRequest)
			return
		}
		time.Sleep(waitMiliSec)
	}

	// websocket開始
	conn, err := upgrader.Upgrade(ctx.Writer, ctx.Request, nil)
	if err != nil {
		ctx.Status(http.StatusInternalServerError)
		fmt.Fprintln(os.Stderr, err)
		return
	}
	defer conn.Close()
	err = conn.WriteJSON(model.WSMessageToSend{
		Command: model.WSCmdSendUpdateMembers,
		Content: model.UpdateMembers{UserNames: userNames},
	})
	if err != nil {
		fmt.Fprintln(os.Stderr, err)
		return
	}
	fmt.Fprintf(os.Stderr, "[LOG] Send WebSocket Message.   Command: \"update_members\".   UserName: %s\n", userName)

	client := newClient(
		userId,
		userName,
		conn,
		clientSender,
		clientReceiver,
	)
	fmt.Fprintln(os.Stderr, "[LOG] Success to connect via WebSocket!")
	wg := sync.WaitGroup{}
	wg.Add(2)
	go client.listenWS(&wg)
	go client.listenRoom(&wg)
	wg.Wait()
	fmt.Fprintln(os.Stderr, "[LOG] Disconnect WebSocket")
}
