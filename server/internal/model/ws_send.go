package model

type WSMessageToSend struct {
	Command string `json:"command"`
	Content any    `json:"content,omitempty"`
}

const (
	// Content: UpdateMembers
	WSCmdSendUpdateMembers = "update_members"
	// Content: nil
	WSCmdSendCloseRoom = "close_room"
	// Content: nil
	WSCmdSendStartGame = "start_game"
	// Content: SendRole
	WSCmdSendRole = "role"
	// Content: SendDescription
	WSCmdSendDescription = "game_description"
	// Content: SendAnswer
	WSCmdSendAnswer = "game_questioner_recieve" //typo
	// Content: SendCorrectUsers
	WSCmdSendCorrectUsers = "game_answerer_checked"
	// Content: SendResults
	WSCmdSendResults = "game_show_result"
	// Content: SendFinalResults
	WSCmdSendFinalResults = "game_show_all_result"
	// Content: nil
	WSCmdSendDisconnect = "game_disconnect"
)

type UpdateMembers struct {
	UserNames []string `json:"user_name"`
}

type SendRole struct {
	IsQuestioner bool `json:"isQuestioner"`
}

type SendDescription struct {
	Description string `json:"description"`
	Index       int    `json:"index"`
}

type SendAnswer struct {
	UserName string `json:"user"`
	Answer   string `json:"answer"`
}

type SendCorrectUsers struct {
	CorrectUserList []string `json:"correctUserList"`
}

type SendResults struct {
	Result     []SendResult `json:"result"`
	Question   string       `json:"answer"`
	Questioner string       `json:"questioner"`
}

type SendResult struct {
	UserName string `json:"userName"`
	Score    int    `json:"score"`
}

type SendFinalResults struct {
	Result []SendResult `json:"result"`
}
