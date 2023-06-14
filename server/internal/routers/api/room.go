package api

import (
	"net/http"
	"tonkatsu-server/internal/room"
	"tonkatsu-server/internal/session"

	"github.com/gin-gonic/gin"
)

type roomID string

type ResponseRoomID struct {
	roomID roomID `json:"roomId"`
}

func CreateRoom(ctx *gin.Context) {
	var response ResponseRoomID
	userID, ok := session.GetUserId(ctx)

	if !ok {
		ctx.Status(http.StatusBadRequest)
		return
	}
	response.roomID = roomID(room.RoomAdminCreateRoom(userID))

	ctx.JSON(http.StatusOK, response)
}
