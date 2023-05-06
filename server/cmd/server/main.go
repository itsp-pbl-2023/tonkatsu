package main

import (
	"fmt"
	"os"
	"strconv"

	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"

	"tonkatsu-server/internal/api"
)

func main() {
	port_str := os.Getenv("SERVER_PORT")
	port, err := strconv.Atoi(port_str)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Invalid port: %s", port_str)
	}

	engine := gin.Default()

	engine.GET("/hello_world", api.GetHelloWorld)

	engine.Run(fmt.Sprintf(":%d", port))
}
