package routers

import (
	"time"
	"tonkatsu-server/internal/routers/api"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func InitRouter() *gin.Engine {
	r := gin.Default()

	// CORS
	r.Use(cors.New(cors.Config{
    AllowOrigins:     []string{"http://localhost:5173"},
    AllowMethods:     []string{"OPTIONS", "GET", "POST", "PUT", "DELETE"},
    AllowHeaders:     []string{
			"Origin",
			"Content-type",
			"Content-length",
			"Accept",
			"Accept-Language",
		},
    AllowCredentials: true,
    AllowOriginFunc: func(origin string) bool {
      return origin == "https://github.com"
    },
		AllowWebSockets: true,
    MaxAge: 12 * time.Hour,
  }))

	r.GET("/hello_world", api.GetHelloWorld)
	r.POST("/account", api.Account)

	return r
}
 