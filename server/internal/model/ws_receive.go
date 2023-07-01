package model

import (
	"encoding/json"
)

type WSMessageToReceive struct {
	Command string
	Content interface{}
}

type WSContentQuestionerQuestion struct {
	Topic    string
	Question string
}

const (
	WSCmdLeave              = "leave"
	WSCmdStartGame          = "start_game"
	WSCmdQuestionerQuestion = "game_questioner_question"
	WSCmdAnswererAnswer     = "game_answerer_answer"
)

// TODO
func UnMarshalJSON(m []byte) (WSMessageToReceive, error) {
	var message json.RawMessage
	messageRceive := WSMessageToReceive {
		Content: &message,
	}
	if err := json.Unmarshal(m, &messageRceive); err != nil {
		return messageRceive, err
	}
	switch messageRceive.Command {
	case WSCmdQuestionerQuestion:
		var content WSContentQuestionerQuestion
		if err := json.Unmarshal(message, &content); err != nil {
			return messageRceive, err
		}
		messageRceive.Content = content
	}
	return messageRceive, nil
}
