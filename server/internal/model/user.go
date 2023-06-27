package model

type UserID int64

type User struct {
	UserId   UserID `db:"user_id"`
	UserName string `db:"user_name"`
	Password string `db:"user_password"`
}

// GetUserName はデータベースからユーザ名を取得する関数
// if err != nil then parameter `userId` is wrong.
func GetUserName(userId UserID) (string, error) {
	var userName string
	err := db.Get(
		&userName,
		`SELECT user_name FROM users
		WHERE user_id=?`,
		userId,
	)
	return userName, err
}
