package model

import (
	"log"

	_ "github.com/go-sql-driver/mysql"
	"github.com/jmoiron/sqlx"
)

var db *sqlx.DB

func Setup() {
	var err error
	db, err = sqlx.Open("mysql", "root/sample")
	if err != nil {
		log.Fatal("module.Setup err: %v", err)
	}
}

func CloseDB() {
	defer db.Close()
}
