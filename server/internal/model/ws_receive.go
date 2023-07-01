package model

import (
	"encoding/json"
)

type WSMessageToReceive struct {
	Command string
	Content interface{}
}

const (
	WSCmdLeave              = "leave"
	WSCmdStartGame          = "start_game"
	WSCmdQuestionerQuestion = "game_questioner_question"
)

// TODO
func UnMarshalJSON(m []byte) (WSMessageToReceive, error) {
	var message WSMessageToReceive
	err := json.Unmarshal(m, &message)
	return message, err
}
