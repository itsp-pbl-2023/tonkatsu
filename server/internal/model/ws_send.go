package model

type WSMessageForSend struct {
	Command string `json:"command"`
	Content any `json:"content,omitempty"`
}

const (
	WSCmdUpdateMembers = "update_members"
)

type UpdateMembers struct {
	UserNames []string `json:"user_name"`
}
