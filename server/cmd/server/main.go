package main

import (
	"fmt"
	"os"
	"strconv"

	_ "github.com/go-sql-driver/mysql"

	"tonkatsu-server/internal/model"
	"tonkatsu-server/internal/routers"
)

func main() {
	router := routers.InitRouter()
	port_str := os.Getenv("SERVER_PORT")
	port, err := strconv.Atoi(port_str)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Invalid port: %s", port_str)
	}
	model.Setup()
	router.Run(fmt.Sprintf(":%d", port))
}
