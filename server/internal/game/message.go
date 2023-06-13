package game

// Roomが送信するメッセージ
type RoomMessage struct {
	Command RoomMCommand
	Content any // Goには列挙型がない!
}

// Roomが送信するメッセージのコマンド
type RoomMCommand int

const (
	// 部屋にいるユーザー
	CmdUsers = RoomMCommand(iota)
	// 部屋を閉じる
	CmdClose
)

// 部屋にいるユーザ名のリスト
type UsersInRoom []string


// Clientが送信するメッセージ
type ClientMessage struct {
	Command ClientMCommand
	Content any
}

// Clientが送信するメッセージのコマンド
type ClientMCommand int

const (
	// 退室
	CmdLeaveRoom = ClientMCommand(iota)
)

// 退室したユーザのユーザid
type LeftUser userID
