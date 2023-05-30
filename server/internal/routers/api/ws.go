package api

import (
	"tonkatsu-server/internal/streamer"

	"github.com/gin-gonic/gin"
)

func WebSocket(ctx *gin.Context) {
	st := streamer.GetStreamer()
	st.ConnectWS(ctx)
}
