package api

import (
	"tonkatsu-server/internal/room"

	"github.com/gin-gonic/gin"
)

func WebSocket(ctx *gin.Context) {
	room.ConnectWS(ctx)
}
