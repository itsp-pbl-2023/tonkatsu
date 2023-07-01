package game

// ゲームの内どの段階なのか
type phase uint

const (
	phaseWaiting   = phase(iota) // 参加者の入室を待機
	phaseQuestion                // 質問者が問題に答えている
	phaseAnswer                  // 回答者が答えている
	phaseResult                  // リザルトを表示している
	phaseAllResult               // 最終のリザルトを表示している
)
