package api

import (
	"fmt"
	"net/http"
	"tonkatsu-server/internal/room"
	"tonkatsu-server/internal/session"

	"github.com/gin-gonic/gin"
)

type ResponseRoomID struct {
	RoomID room.RoomID `json:"roomId"`
}

func CreateRoom(ctx *gin.Context) {
	var response ResponseRoomID

	userID, ok := session.GetUserId(ctx)

	if !ok {
		fmt.Printf("GetUserId FAILED")
		ctx.Status(http.StatusBadRequest)
		return
	}
	response.RoomID = room.CreateRoom(userID)
	ctx.JSON(http.StatusOK, response)
}
