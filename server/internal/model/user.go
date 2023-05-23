package model

import (


	// "github.com/jmoiron/sqlx"
)

type User struct {
	UserId int64 `db:"user_id"`
	UserName string `db:"user_name"`
	Password string `db:"user_password"`
}
