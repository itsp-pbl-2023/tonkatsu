package model

import (
	"encoding/json"
)

type WSMessageToReceive struct {
	Command string      `json:"command"`
	Content interface{} `json:"content"`
}

type WSContentGameMode struct {
	GameMode string `json:"game_mode"`
}

type WSContentQuestionerQuestion struct {
	Topic    string `json:"topic"`
	Question string `json:"question"`
}

type WSContentAnswererAnswer struct {
	Answer string `json:"answer"`
}

type WSContentCorrectUserList struct {
	CorrectUsersList []string `json:"correctUserList"`
}

const (
	WSCmdLeave              = "leave"
	WSCmdCloseRoom          = "close_room"
	WSCmdStartGame          = "start_game"
	WSCmdQuestionerQuestion = "game_questioner_question"
	WSCmdAnswererAnswer     = "game_answerer_answer"
	WSCmdQuestionerCheck    = "game_questioner_check"
	WSCmdNextDescription    = "game_next_description"
	WSCmdQuestionerDone     = "game_questioner_done"
	WSCmdNextGame           = "game_next_game"
	WSCmdFinishGame         = "game_finish_game"
)

// TODO
func UnMarshalJSON(m []byte) (WSMessageToReceive, error) {
	var message json.RawMessage
	messageRceive := WSMessageToReceive{
		Content: &message,
	}
	if err := json.Unmarshal(m, &messageRceive); err != nil {
		return messageRceive, err
	}
	switch messageRceive.Command {
	case WSCmdStartGame:
		var content WSContentGameMode
		if err := json.Unmarshal(message, &content); err != nil {
			return messageRceive, err
		}
		messageRceive.Content = content
	case WSCmdQuestionerQuestion:
		var content WSContentQuestionerQuestion
		if err := json.Unmarshal(message, &content); err != nil {
			return messageRceive, err
		}
		messageRceive.Content = content
	case WSCmdAnswererAnswer:
		var content WSContentAnswererAnswer
		if err := json.Unmarshal(message, &content); err != nil {
			return messageRceive, err
		}
		messageRceive.Content = content
	case WSCmdQuestionerCheck:
		var content WSContentCorrectUserList
		if err := json.Unmarshal(message, &content); err != nil {
			return messageRceive, err
		}
		messageRceive.Content = content
	}
	return messageRceive, nil
}
