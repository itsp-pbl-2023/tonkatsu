package model

import "encoding/json"

type WSMessageToReceive struct {
	Command string `json:"command"`
	Content any    `json:"content,omitempty"`
}

const (
	WSCmdLeave = "leave"
)

// TODO
func UnMarshalJSON(m []byte) (WSMessageToReceive, error) {
	var message WSMessageToReceive
	err := json.Unmarshal(m, &message)
	return message, err
}
