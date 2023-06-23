package room

import (
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
	clientSender := make(chan *ClientMessage, 1)

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
		clientSender,
	)
	if (!ok) {
		t.Fatal("Failed to enter room.")
	}

	client := newClient(
		userId,
		name,
		nil,
		clientSender,
		clientReceiver,
	)

	logger := make(chan model.WSMessageToSend, 1)
	ticker := time.NewTicker(time.Second)
	go client.clientListenTest(logger, t)
	select {
	case m := <- logger:
		cmd := m.Command
		names := m.Content.(model.UpdateMembers).UserNames
		if cmd != model.WSCmdUpdateMembers {
			t.Fatalf("Failed to receive a proper message.")
		}
		if names[0] != "test" {
			t.Fatalf("Failed to receive a proper message.\nnames: %v\n", names)
		}
	case <- ticker.C:
		t.Fatal("Failed to receive messages.")
	}
	client.left.Store(true)
}

func (client *client) clientListenTest(logger chan<- model.WSMessageToSend, t *testing.T) {
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
				logger <- model.WSMessageToSend{
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
