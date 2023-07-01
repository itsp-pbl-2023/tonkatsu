package game

import (
	"tonkatsu-server/internal/model"
)

type Context struct {
	phase        phase
	// 何個目のお題に答えているか
	// zero-based index
	turn         uint           
	participants []model.UserID // 参加者
	// あるお題に対して何個目の説明を表示しているか.
	// zero-based index
	index        uint           
	questioner   model.UserID   // 質問者
	question     string         // お題
	descriptions []string       // お題に対しchatGPTから得られた説明
	// 正解したユーザのリスト
	//   correctUsers[turn][i]
	correctUsers [][]model.UserID
}

func NewContext() *Context {
	new := &Context {
		phase: phaseWaiting,
		turn: 0,
		participants: make([]model.UserID, 0),
		index: 0,
		questioner: 0,
		question: "",
		descriptions: make([]string, 0),
		correctUsers: make([][]model.UserID, 0),
	}
	return new
}

func (ctx *Context) selectQuestioner() model.UserID {
	return ctx.participants[ctx.turn]
}
