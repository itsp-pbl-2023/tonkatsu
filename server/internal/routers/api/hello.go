package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetHelloWorld(ctx *gin.Context) {
	ctx.JSON(http.StatusOK, "Hello, World!")
}
