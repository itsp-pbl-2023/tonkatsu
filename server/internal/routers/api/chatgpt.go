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
	Message string `json:"message"`
}

func ChatGPT(ctx *gin.Context) {
	var request POSTChatGPT
	var response response
	err := ctx.Bind(&request)
	if err != nil {
		ctx.Status(http.StatusBadRequest)
	}
	fmt.Printf("request:%v", request)
	response.Message = chatgpt.CallChatGPT(request.Message)

	ctx.JSON(http.StatusOK, response)
}
