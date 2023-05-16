package session

import (
	"time"
)

// sessionInfo は個々のセッション情報を表す構造体.
type sessionInfo struct {
	// ログインまたはセッションを持つリクエストが最後に行われ時間.
	// 一定時間経ったらセッション情報を消す
	accessed_at time.Time

	// ユーザID
	userID int64
}
