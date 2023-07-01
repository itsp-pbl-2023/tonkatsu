package game

import (
	"tonkatsu-server/internal/model"
)

type Context struct {
	phase phase
	// 何個目のお題に答えているか
	// zero-based index
	turn         uint
	participants []model.UserID // 参加者
	// あるお題に対して何個目の説明を表示しているか.
	// zero-based index
	index        uint
	Questioner   model.UserID // 質問者
	question     string       // お題
	descriptions []string     // お題に対しchatGPTから得られた説明
	// 正解したユーザのリスト
	//   correctUsers[turn][index][i]
	correctUsers [][][]model.UserID
}

func NewContext() *Context {
	new := &Context{
		phase:        PhaseWaiting,
		turn:         0,
		participants: make([]model.UserID, 0),
		index:        0,
		Questioner:   0,
		question:     "",
		descriptions: make([]string, 0),
		correctUsers: make([][][]model.UserID, 0),
	}
	return new
}

func (ctx *Context) SelectQuestioner() model.UserID {
	return ctx.participants[ctx.turn]
}

func (ctx *Context) SetPhase(p phase) {
	ctx.phase = p
	return
}

func (ctx *Context) SetQuestioner(questionerID model.UserID) {
	ctx.Questioner = questionerID
	return
}

func (ctx *Context) SetQuestion(question string) {
	ctx.question = question
	return
}
