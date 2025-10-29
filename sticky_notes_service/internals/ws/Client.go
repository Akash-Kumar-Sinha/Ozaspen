package ws

import (
	"encoding/json"
	"log"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

type ClientLists map[*Client]bool

type Client struct {
	hub       *Hub
	conn      *websocket.Conn
	profileID uuid.UUID
}

func NewClient(hub *Hub, conn *websocket.Conn, profileID uuid.UUID) *Client {
	return &Client{
		hub:       hub,
		conn:      conn,
		profileID: profileID,
	}
}

func (client *Client) ReadPump() {
	defer func() {
		client.hub.RemoveClient(client)
	}()

	for {
		messageType, payload, err := client.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("Error reading message: %v\n", err)
			}
			break
		}

		var req Event
		if messageType == websocket.TextMessage {
			if err := json.Unmarshal(payload, &req); err != nil {
				log.Printf("Error unmarshaling message: %v\n", err)
				continue
			}

			if err := client.hub.routeEvent(req, client); err != nil {
				log.Printf("Error handling event: %v\n", err)
			}
		}
	}

}
