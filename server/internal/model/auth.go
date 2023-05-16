package model

type Auth struct {
	ID       string `json:"id"`
	Password string `json:"password"`
}

// ユーザー登録
func Account(userId, password string) (bool, error) {
	var auth Auth
	err := db.Select("id")
	// 既に同じ名前が使われている場合
}
