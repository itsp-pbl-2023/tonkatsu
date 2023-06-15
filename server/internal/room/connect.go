package room

import (
	"net/http"
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
	roomId := roomID(ctx.Query("room"))
	if roomId == "" {
		ctx.Status(http.StatusBadRequest)
		return
	}
	userId, ok := session.GetUserId(ctx)
	if !ok  {
		ctx.Status(http.StatusInternalServerError)
		return
	}
	userName, err := model.GetUserName(model.UserID(userId))
	if err != nil {
		ctx.Status(http.StatusInternalServerError)
	}

	clientSender := make(chan ClientMessage, 1)
	clientReceiver, ok := ra.clientEnterRoom(
		roomId,
		userId,
		userName,
		clientSender,
	)
	var userNames UsersInRoom
	// maxWait * waitMiliSec ms だけRoomからの応答を待つ.
	// 応答がなければRoomが閉じたと判断し終了.
	for t, maxWait, waitMiliSec := 0, 10, time.Duration(100); true; t += 1 {
		select {
		case m := <-clientReceiver:
			// m should CmdUsers message.
			userNames = m.Content.(UsersInRoom)
			break
		}
		if t == maxWait {
			ctx.Status(http.StatusBadRequest)
			return
		}
		time.Sleep(waitMiliSec * time.Millisecond)
	}

	// websocket開始
	conn, err := upgrader.Upgrade(ctx.Writer, ctx.Request, nil)
	conn.WriteJSON(model.WSMessageForSend{
		Command: model.WSCmdUpdateMembers,
		Content: model.UpdateMembers{UserNames: userNames},
	})

	client := newClient(
		userId,
		userName,
		conn,
		clientSender,
		clientReceiver,
	)

	wg := sync.WaitGroup{}
	wg.Add(2)
	go client.listenWS(&wg)
	go client.listenRoom(&wg)
	wg.Wait()
	conn.Close()
}
