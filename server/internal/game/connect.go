package game

import (
	"net/http"
	"tonkatsu-server/internal/model"
	"tonkatsu-server/internal/session"

	"github.com/gin-gonic/gin"
)

type userID = model.UserID

func ConnectWS(ctx *gin.Context) {
	roomID := ctx.Query("room")
	userID, ok := session.GetUserID(ctx)
	if !ok  {
		ctx.Status(http.StatusInternalServerError)
		return
	}
	userName, err := model.GetUserName(model.UserID(userID))
	if err != nil {
		// TODO: ちゃんとエラーハンドリングする
		ctx.Status(http.StatusBadRequest)
	}
	clientSender := make(chan ClientMessage, 1)
	ra.clientEnterRoom()
}