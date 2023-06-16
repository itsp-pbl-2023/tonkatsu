package model

type WSMessageToReceive struct {
	Command string `json:"command"`
	Content any `json:"content,omitempty"`
}

const (
	WSCmdLeave = "leave"
)
