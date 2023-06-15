package streamer

import (
	"fmt"
	"log"

	"github.com/goccy/go-json"
	"github.com/google/uuid"
)

type Streamer struct {
	clients map[uuid.UUID]*client
	// client -> streamer
	reciver chan reciveData
}

var streamer *Streamer

func NewStreamer()  {
	streamer = &Streamer {
		clients: make(map[uuid.UUID]*client),
		reciver: make(chan reciveData),
	}
}

func GetStreamer() *Streamer {
	return streamer
}

func (s *Streamer) Listen() {
	for {
		mes := <-s.reciver

		go func() {
			err := s.handlerWebSocket(mes)
			if err != nil {
				log.Printf(`failed to handle message: %s`, err.Error())
			}
		}()
	}
}

type payload struct {
	Method string                 `json"method,omitempty"`
	Args   map[string]interface{} `json"args,omitempty"`
}

func (s *Streamer) handlerWebSocket(mes reciveData) error {
	var request payload
	err := json.Unmarshal(mes.payload, &request)
	if err != nil {
		log.Printf(`failed to unmarshal message: %s`, err.Error())
		return err
	}

	switch request.Method {
	case "changeRoom":
		// { "method": "changeRoom", "args": { "roomID": "room1" } }
		// roomIDを変更する
		roomID, ok := request.Args["roomID"].(string)
		if !ok {
			return fmt.Errorf(`failed to assert roomID`)
		}
		s.changeRoom(mes.id, roomID)
	default:
		return fmt.Errorf(`unknown method`)
	}

	return nil
}

func (s *Streamer) changeRoom(id uuid.UUID, roomID string) {
	s.clients[id].roomID = roomID
	// roomIDを変更したら同じroomIDのclientにユーザーリストを通知
	userList := []string{}
	for _, c := range s.clients {
		if c.roomID == roomID {
			userList = append(userList, c.id.String())
		}
	}
	// { "method": "userList", "args": { "users": [ "user1", "user2", ... ] } }
	// userListをjsonに変換
	userListJSON, err := json.Marshal(payload{
		Method: "userList",
		Args: map[string]interface{}{
			"users": userList,
		},
	})
	if err != nil {
		log.Printf(`failed to marshal userList: %s`, err.Error())
		return
	}
	s.sendToRoom(roomID, string(userListJSON))
}

func (s *Streamer) sendToRoom(roomID string, mes string) {
	for _, c := range s.clients {
		if c.roomID == roomID {
			c.sender <- mes
		}
	}
}
