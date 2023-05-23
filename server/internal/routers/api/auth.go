package api

import (
	"fmt"
	"net/http"
	"os"
	"tonkatsu-server/internal/model"
	"tonkatsu-server/internal/session"

	"github.com/gin-gonic/gin"
)

type Auth struct {
	UserName       string `json:"userName"`
	Password string `json:"password"`
}

// ユーザー登録
func Account(ctx *gin.Context) {
	var auth Auth
	err := ctx.BindJSON(&auth)
	if err != nil {
		ctx.Status(http.StatusBadRequest)
	}

	userID, err := model.AddAccount(auth.UserName, auth.Password)
	if err != nil {
		fmt.Fprintf(os.Stderr, "error: %v\n", err)
		ctx.Status(http.StatusBadRequest)
		return
	}

	session.CreateSesison(ctx, userID)

	ctx.Status(http.StatusOK)
}
