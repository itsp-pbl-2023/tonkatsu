package model

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
)

func AddAccount(userName, password string) (UserID, error) {
	var exists []int8
	err := db.Select(
		&exists,
		`SELECT EXISTS (
			SELECT * FROM users
			WHERE user_name=?
		)`,
		userName,
	)
	if err != nil {
		return 0, err
	}

	if exists[0] == 1 {
		return 0, fmt.Errorf("User name %s is already used.", userName)
	}

	hashedPassBytes := sha256.Sum256([]byte(password))
	hashedPassword := hex.EncodeToString(hashedPassBytes[:])
	res, err := db.Exec(
		`INSERT INTO users (user_name, user_password) VALUES (?, ?)`,
		userName,
		hashedPassword,
	)

	user_id, err := res.LastInsertId()
	if err != nil {
		return 0, err
	}

	return UserID(user_id), err
}

func Login(userName, password string) (UserID, error) {
	var exists []int8
	err := db.Select(
		&exists,
		`SELECT EXISTS (
			SELECT * FROM users
			WHERE user_name=?
		)`,
		userName,
	)
	if err != nil {
		return 0, err
	}

	if exists[0] == 0 {
		return 0, fmt.Errorf("User name %s is not found.", userName)
	}

	hashedPassBytes := sha256.Sum256([]byte(password))
	hashedPassword := hex.EncodeToString(hashedPassBytes[:])
	var user_id int64
	err = db.Get(
		&user_id,
		`SELECT user_id FROM users
		WHERE user_name=? AND user_password=?`,
		userName,
		hashedPassword,
	)
	if err != nil {
		return 0, err
	}

	return UserID(user_id), err
}
