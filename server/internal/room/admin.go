package room

import (
	"math"
	"math/rand"
	"strconv"
	"sync"
	. "tonkatsu-server/internal/model"
)

type RoomAdmin struct {
	mu    sync.RWMutex
	rooms map[RoomID]*Room
}

var ra = RoomAdmin{
	mu:    sync.RWMutex{},
	rooms: map[RoomID]*Room{},
}

// 部屋を作成し走らせる
func CreateRoom(userId UserID) RoomID {
	roomID := ra.generateRoomId()
	room := NewRoom(roomID, userId)
	ra.mu.Lock()
	ra.rooms[roomID] = &room
	ra.mu.Unlock()
	go room.run()
	return roomID
}

func (ra *RoomAdmin) deleteRoom(id RoomID) {
	ra.mu.Lock()
	delete(ra.rooms, id)
	ra.mu.Unlock()
}

func (ra *RoomAdmin) existsRoom(id RoomID) bool {
	ra.mu.RLock()
	_, ok := ra.rooms[id]
	ra.mu.RUnlock()
	return ok
}

func (ra *RoomAdmin) getRoom(id RoomID) (*Room, bool) {
	ra.mu.RLock()
	room, ok := ra.rooms[id]
	ra.mu.RUnlock()
	return room, ok
}

// Roomへクライアントを入室させるメッセージを送る.
// Room->Client　のchannelを返す.
func (ra *RoomAdmin) clientEnterRoom(
	roomId RoomID,
	userId UserID,
	userName string,
	receiver <-chan *ClientMessage,
) (<-chan *RoomMessage, bool) {
	ra.mu.RLock()
	room, ok := ra.rooms[roomId]
	ra.mu.RUnlock()
	if !ok {
		return nil, false
	}
	sender := make(chan *RoomMessage, 1)
	room.subscriber <- &enteredClient{
		id:       userId,
		name:     userName,
		receiver: receiver,
		sender:   sender,
	}
	return sender, true
}

// RoomIDをランダム生成に生成する
// すでにあるRoomIDは使わない
func (ra *RoomAdmin) generateRoomId() RoomID {
	n := 6
	max := int32(math.Pow10(n) - 1)
	min := int32(math.Pow10(n - 1))
	for {
		id := RoomID(strconv.Itoa(int(min + rand.Int31n(max-min+1))))
		if !ra.existsRoom(id) {
			return id
		}
	}
}
