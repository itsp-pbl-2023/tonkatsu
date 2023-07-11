package room

import "tonkatsu-server/internal/model"

// Roomが送信するメッセージ
type RoomMessage struct {
	Command RoomMsgCommand
	Content any
}

// Roomが送信するメッセージのコマンド
type RoomMsgCommand int

const (
	// 部屋にいるユーザー
	// Content: RoomUsers
	CmdRoomUsersInRoom = RoomMsgCommand(iota)
	// 部屋を閉じる
	// Content: nil
	CmdRoomClose
	// ゲーム開始
	// Content: nil
	CmdRoomStartGame
	// 回答者
	// Content: RoomQuestioner
	CmdRoomQuestioner
	// chatGPTの説明
	// Content: RoomDescription
	CmdRoomDescription
	// 回答
	// Content: RoomAnswer
	CmdRoomAnswer
	// 正解者
	// Content: RoomCorrectUsers
	CmdRoomCorrectUsers
	// リザルト
	// Content: RoomResults
	CmdRoomResult
	// 全体のリザルト
	// Content: []RoomFinalResult
	CmdRoomFinalResult
)

// 部屋にいるユーザ名のリスト
type RoomUsers []string

type RoomQuestioner model.UserID

type RoomDescription struct {
	Description string
	Index       int
}

type RoomAnswer struct {
	userName string
	answer   string
}

type RoomCorrectUsers []string

type RoomResult struct {
	userName string
	score    int
}

type RoomResults struct {
	result     []RoomResult
	question   string
	questioner string
}

type RoomFinalResult struct {
	userName string
	score    int
}

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
	CmdClientLeaveRoom = ClientMsgCommand(iota)
	// 部屋を閉じる
	// Content: nil
	CmdClientCloseRoom
	// ゲーム開始
	// Content: ClientMsgGameMode
	CmdClientStartGame
	// 出題者が問題に答えた
	// Content: ClientMsgQuestion
	CmdClientQuestion
	// 回答
	// Content: ClientMsgAnswer
	CmdClientAnswer
	// 正解者
	// Content: ClientMsgCorrectUsers
	CmdClientCorrectUsers
	//次の問題へ
	// Content:nil
	CmdClientNextQuestion
	// 問題一つ終了
	// Content: nil
	CmdClientDoneQuestion
	// 次の問題
	// Content: nil
	CmdClientNextGame
	// ゲーム終了
	// Content: nil
	CmdClientFinishGame
)

type ClientMsgGameMode string

type ClientMsgQuestion struct {
	topic    string
	question string
}

type ClientMsgAnswer string

type ClientMsgCorrectUsers []string
