package api

import (
	"fmt"
	"net/http"
	"tonkatsu-server/internal/session"

	"github.com/gin-gonic/gin"
)

func GetHelloWorld(ctx *gin.Context) {
	id, ok := session.GetUserId(ctx)
	if !ok {
		ctx.Status(http.StatusUnauthorized)
	} else {
		ctx.JSON(http.StatusOK, fmt.Sprintf("id: %d", id))
	}
}
