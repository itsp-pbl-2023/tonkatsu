package room

import (
	"fmt"
	"testing"
	"time"
	"tonkatsu-server/internal/model"
)


func TestCreateRoom(t *testing.T) {
	userId := model.UserID(1)
	roomId := CreateRoom(userId)
	room, exists := ra.getRoom(roomId)
	if !exists {
		t.Fatal("Failed to create room or to find the existing room.")
	}

	room.closer <- true
	// wait enough time
	time.Sleep(time.Second)

	if ra.existsRoom(roomId) {
		t.Fatal("Failed to delete room properly.")
	}
}

func TestEnterRoom(t *testing.T) {
	userId := model.UserID(1)
	name := "test"

	roomId := CreateRoom(userId)
	room, _ := ra.getRoom(roomId)
	defer func() {
		room.closer <- true
	}()
	t.Logf("clients in room: %v\n", room.clients)

	clientReceiver, ok := ra.clientEnterRoom(
		roomId,
		userId,
		name,
		nil,
	)
	if (!ok) {
		t.Fatal("Failed to enter room.")
	}

	client := newClient(
		userId,
		name,
		nil,
		nil,
		clientReceiver,
	)

	logger := make(chan *model.WSMessageToSend, 1)
	ticker := time.NewTicker(time.Second)
	go client.clientListenTest(logger, t)
	select {
	case m := <- logger:
		cmd := m.Command
		if cmd != model.WSCmdUpdateMembers {
			t.Fatalf("Failed to receive a proper message.")
		}
		names := m.Content.(model.UpdateMembers).UserNames
		if names[0] != "test" {
			t.Fatalf("Failed to receive a proper message.\nnames: %v\n", names)
		}
	case <- ticker.C:
		t.Fatal("Failed to receive messages.")
	}
	client.left.Store(true)
}

// 複数のクライアントが正しく入室できるかどうかをテストする．
// "test0"のチャンネルを見て正しい返答が得られているかを確認する．
func TestEnterRoomMultiple(t *testing.T) {
	roomId := CreateRoom(model.UserID(0))
	room, _ := ra.getRoom(roomId)
	defer func() {
		room.closer <- true
	}()

	numClients := 5
	clients := make([]client, 0, numClients)
	var logger <-chan *model.WSMessageToSend
	for i := 0; i < numClients; i++ {
		userId := model.UserID(i)
		name := fmt.Sprintf("test%d", i)
		clientReceiver, ok := ra.clientEnterRoom(
			roomId,
			userId,
			name,
			nil,
		)
		if (!ok) {
			t.Fatal("Failed to enter room.")
		}
	
		clients = append(clients, newClient(
			userId,
			name,
			nil,
			nil,
			clientReceiver,
		))
		_logger := make(chan *model.WSMessageToSend, numClients)
		go clients[i].clientListenTest(_logger, t)
		if i == 0 {
			logger = _logger
		}
		time.Sleep(time.Millisecond)
	}

	for i := 0; i < numClients; i++ {
		ticker := time.NewTicker(time.Second)
		select {
		case m := <-logger:
			cmd := m.Command
			if cmd != model.WSCmdUpdateMembers {
				t.Fatalf("Failed to receive a proper message\ni: %d\n", i)
			}
			names := m.Content.(model.UpdateMembers).UserNames
			if len(names) != i+1 {
				t.Fatalf("Failed to receive a proper message: %v", names)
			}
			for j := 0; j < i; j++ {
				if !contains(names, fmt.Sprintf("test%d", j)) {
					t.Fatalf("Invalid message: not exist test%d\n", j)
				}
			}
			t.Logf("test0 receive user names: %v", names)
		case <- ticker.C:
			t.Fatal("Failed to receive a proper message.")
		}
	}

	for _, client := range clients {
		client.left.Store(true)
	}
}

func (client *client) clientListenTest(logger chan<- *model.WSMessageToSend, t *testing.T) {
	for {
		if client.left.Load() {
			return
		}
		select {
		case m := <-client.receiver: 
			switch m.Command {
			case CmdUsersInRoom:
				userNames := m.Content.(UsersInRoom)
				t.Logf("userNames: %v\n", userNames)
				logger <- &model.WSMessageToSend{
					Command: model.WSCmdUpdateMembers,
					Content: model.UpdateMembers{UserNames: userNames},
				}
			default:
				return
			}
		default:
		}
	}
}

func contains[T comparable](xs []T, x T) bool {
	for _, xi := range xs {
		if x == xi {
			return true
		}
	}
	return false
}
