package routers

import (
	"tonkatsu-server/internal/routers/api"

	"github.com/gin-gonic/gin"
)

func InitRouter() *gin.Engine {
	r := gin.Default()
	r.GET("/hello_world", api.GetHelloWorld)
	r.POST("/account", api.Account)

	return r
}
 