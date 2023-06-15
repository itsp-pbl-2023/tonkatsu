package model

type WSMessageForReceive struct {
	Command string `json:"command"`
	Content any `json:"content,omitempty"`
}

const (
	WSCmdLeave = "leave"
)
