package room

// Roomが送信するメッセージ
type RoomMessage struct {
	Command RoomMsgCommand
	Content any
}

// Roomが送信するメッセージのコマンド
type RoomMsgCommand int

const (
	// 部屋にいるユーザー
	// Content: UsersInRoom
	CmdUsersInRoom = RoomMsgCommand(iota)
	// 部屋を閉じる
	// Content: nil
	CmdClose
)

// 部屋にいるユーザ名のリスト
type UsersInRoom []string

// Clientが送信するメッセージ
type ClientMessage struct {
	Command ClientMsgCommand
	Content any
}

// Clientが送信するメッセージのコマンド
type ClientMsgCommand int

const (
	// 退室
	// Content: nil
	CmdLeaveRoom = ClientMsgCommand(iota)
	// ゲーム開始
	CmdStartGame
)
