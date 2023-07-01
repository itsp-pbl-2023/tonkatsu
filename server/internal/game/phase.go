package game

// ゲームの内どの段階なのか
type phase uint

const (
	PhaseWaiting   = phase(iota) // 参加者の入室を待機
	PhaseQuestion                // 質問者が問題に答えている
	PhaseAnswer                  // 回答者が答えている
	PhaseResult                  // リザルトを表示している
	PhaseAllResult               // 最終のリザルトを表示している
)
