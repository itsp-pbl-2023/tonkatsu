package game

import (
	"tonkatsu-server/internal/model"
)

type Context struct {
	phase phase
	// 何個目のお題に答えているか
	// zero-based index
	turn         uint
	Participants []model.UserID // 参加者
	// あるお題に対して何個目の説明を表示しているか.
	// zero-based index
	index        uint
	topic        string       // 問題「好きな食べ物は？」など
	Questioner   model.UserID // 質問者
	Question     string       // お題
	Descriptions []string     // お題に対しchatGPTから得られた説明
	// 正解したユーザのリスト
	//   correctUsers[turn][index][i]
	correctUsers [][][]model.UserID
}

func NewContext() *Context {
	new := &Context{
		phase:        PhaseWaiting,
		turn:         0,
		Participants: make([]model.UserID, 0),
		index:        0,
		Questioner:   0,
		Question:     "",
		Descriptions: make([]string, 0),
		correctUsers: make([][][]model.UserID, 0),
	}
	return new
}

func (ctx *Context) SelectQuestioner() model.UserID {
	return ctx.Participants[ctx.turn]
}

func (ctx *Context) SetPhase(p phase) {
	ctx.phase = p
	return
}

func (ctx *Context) SetQuestioner(questionerID model.UserID) {
	ctx.Questioner = questionerID
	return
}

func (ctx *Context) SetTopic(topic string) {
	ctx.topic = topic
	return
}

func (ctx *Context) SetQuestion(question string) {
	ctx.question = question
	return

}
