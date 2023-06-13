package model

import (


	// "github.com/jmoiron/sqlx"
)

type UserID int64

type User struct {
	UserId UserID `db:"user_id"`
	UserName string `db:"user_name"`
	Password string `db:"user_password"`
}
