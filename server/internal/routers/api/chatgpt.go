package api

import (
	"fmt"
	"net/http"
	"tonkatsu-server/internal/chatgpt"

	"github.com/gin-gonic/gin"
)

type POSTChatGPT struct {
	Message string `json:"message"`
}

type response struct {
	Messages []string `json:"message"`
}

func ChatGPT(ctx *gin.Context) {
	var request POSTChatGPT
	var response response
	err := ctx.Bind(&request)
	if err != nil {
		ctx.Status(http.StatusBadRequest)
	}
	fmt.Printf("request:%v\n", request)
	response.Messages = chatgpt.AskChatGPT(request.Message, "normal")

	ctx.JSON(http.StatusOK, response)
}
