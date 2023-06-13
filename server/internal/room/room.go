package room

type roomID string

// 部屋を表す構造体.
// 部屋の状態の保持, クライアント間のやり取りの仲介
type Room struct {
	id      roomID
	host    userID
	subscriber chan enteredClient
	clients map[userID]roomClient
}

// Roomからみたクライアント
type roomClient struct {
	name     string
	sender   chan<- RoomMessage
	receiver <-chan ClientMessage
}

// 入室したユーザ
type enteredClient struct {
	id userID
	name string
	receiver <-chan ClientMessage
}

// NewRoomはユーザがいない部屋を作成する
func NewRoom(roomid roomID, userid userID) Room {
	return Room{
		id:      roomid,
		host:    userid,
		clients: map[userID]roomClient{},
	}
}

func (r *Room) run() {
	defer r.close()
	for {
		select {
		case c := <- r.subscriber:
			r.subscribe(c.id, c.name, c.receiver)
			names := r.userNames()
			r.broadCast(RoomMessage{
				Command: CmdUsers,
				Content: names,
			})
		}
		// クライアントからのメッセージを処理
		for _, client := range r.clients {
			select {
			case m := <-client.receiver:
				switch m.Command {
				case CmdLeaveRoom:
					user := m.Content.(userID)
					r.cancelSubscribe(user)
					names := r.userNames()
					r.broadCast(RoomMessage{
						Command: CmdUsers,
						Content: names,
					})
				default:
					// todo
				}
			}
		}
	}
}

func (r *Room) close() {
	ra.deleteRoom(r.id)
}

// 部屋にクライアントを登録する
// r.Run GoRoutine内で呼ぶべし
func (r *Room) subscribe(
	id userID,
	name string,
	receiver <-chan ClientMessage,
) <-chan RoomMessage {
	sender := make(chan RoomMessage, 1)
	client := roomClient{
		name:     name,
		receiver: receiver,
		sender:   sender,
	}
	r.clients[id] = client
	return sender
}

func (r *Room) cancelSubscribe(id userID) {
	delete(r.clients, id)
}

func (r *Room) broadCast(m RoomMessage) {
	for _, client := range r.clients {
		client.sender <- m
	}
}

func (r *Room) userNames() []string {
	names := make([]string, len(r.clients))
	for _, client := range r.clients {
		names = append(names, client.name)
	}
	return names
}
