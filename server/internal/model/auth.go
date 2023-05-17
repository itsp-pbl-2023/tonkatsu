package model

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
)

func AddAccount(userName, password string) error {
	var exists int8
	err := db.Select(
		&exists, 
		`SELECT EXISTS (
			SELECT * FROM users
			WHERE user_name=?
		)`,
		userName,
	)
	if err != nil {
		return nil
	}

	if exists == 1 {
		return fmt.Errorf("User name %s is already used.", userName)
	}

	hashedPassBytes := sha256.Sum256([]byte(password))
	hashedPassword := hex.EncodeToString(hashedPassBytes[:])
	res, err := db.Exec(
		`INSERT INTO users (user_name, user_password) VALUES (?, ?)`,
		userName,
		hashedPassword,
	)

	_ = res
	// user_id := res.LastInsertId()

	return err
}
