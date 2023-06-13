package room

import (
	"math/rand"
	"sync"
)

type RoomAdmin struct {
	mu    sync.RWMutex
	rooms map[roomID]Room
}

var ra = RoomAdmin{}

// 部屋を作成し走らせる
func (ra *RoomAdmin) CreateRoom(userID userID) roomID {
	roomID := ra.generateRoomId()
	room := NewRoom(roomID, userID)
	ra.mu.Lock()
	ra.rooms[roomID] = room
	ra.mu.Unlock()
	go room.run()
	return roomID
}

func (ra *RoomAdmin) deleteRoom(id roomID) {
	ra.mu.Lock()
	delete(ra.rooms, id)
	ra.mu.Unlock()
}

func (ra *RoomAdmin) existsRoom(id roomID) bool {
	ra.mu.RLock()
	_, ok := ra.rooms[id]
	ra.mu.RUnlock()
	return ok
}

func (ra *RoomAdmin) clientEnterRoom (
	roomID roomID,
	userID userID,
	userName string,
	receiver <-chan ClientMessage,
) bool {
	ra.mu.RLock()
	room, ok := ra.rooms[roomID]
	ra.mu.RUnlock()
	if !ok {
		return false
	}
	room.subscriber <- enteredClient{
		id: userID,
		name: userName,
		receiver: receiver,
	}
	return true
}

func (ra *RoomAdmin) generateRoomId() roomID {
	n := 6
	s := make([]byte, n, n)
	const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	for {
		for i := range s {
			s[i] = letters[rand.Intn(len(letters))]
		}
		id := roomID(s)
		if !ra.existsRoom(id) {
			return id
		}
	}
}
