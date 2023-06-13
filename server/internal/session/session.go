package session

import (
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// SessionTable はセッションIDをキーとしてセッション情報を値とするmap.
// セッションIDはUUID.
type sessionTable map[string]sessionInfo

var (
	s     = sessionTable{}
	slock sync.RWMutex
)

const (
	sAgeSec = 3600
	// gin.Contextにセッション情報を保存する際のキー
	skey = "sessionKey"
	// セッションのCookieのname属性
	sCookieName = "session"
)

// CreateSession はユーザIDをもとにセッションのためのCookieを生成する.
func CreateSesison(ctx *gin.Context, id int64) error {
	sUUID, err := uuid.NewRandom()
	if err != nil {
		return err
	}
	sid := sUUID.String()
	now := time.Now()
	slock.Lock()
	s[sid] = sessionInfo{accessed_at: now, userID: id}
	slock.Unlock()
	ctx.SetCookie(sCookieName, sid, sAgeSec, "/", "", false, true)
	return nil
}

// ConfirmSession は, Cookieを見てセッションが確立しているかを確認する.
// `ctx`に`userID`を保存する. 
func ConfirmSession(ctx *gin.Context) bool {
	sid, err := ctx.Cookie(sCookieName)
	if err != nil {
		return false
	}

	slock.RLock()
	sinfo, ok := s[sid]
	slock.RUnlock()
	if !ok {
		return false
	}

	ctx.Set(skey, sinfo.userID)

	return true
}

// ユーザIDを取得する
// ConfirmSessionした後に用いる
func GetUserId(ctx *gin.Context) (int64, bool) {
	id, ok := ctx.Get(skey)
	return id.(int64), ok
}


func UpdateSession(ctx *gin.Context) error {
	sessionID, err := ctx.Cookie(sCookieName)
	userID, ok := GetUserId(ctx)
	if err != nil || !ok {
		// This must not occur
		return err
	}
	slock.Lock()
	s[sessionID] = sessionInfo{time.Now(), userID}
	slock.Unlock()
	ctx.SetCookie(sCookieName, sessionID, sAgeSec, "/", "", false, true)
	return nil
}

func BreakSession(ctx *gin.Context) error {
	return nil
}
