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
	rooms     map[string]*Room
}

func NewClient(hub *Hub, conn *websocket.Conn, profileID uuid.UUID) *Client {
	return &Client{
		hub:       hub,
		conn:      conn,
		profileID: profileID,
		rooms:     make(map[string]*Room),
	}
}

func (client *Client) ReadPump(stickyNoteID string, hub *Hub) {
	defer func() {
		client.hub.RemoveClient(stickyNoteID, client)
	}()

	for {
		messageType, payload, err := client.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("Error reading message: %v\n", err)
			}
			break
		}

		var req BroadCastLineEvent
		if messageType == websocket.TextMessage {
			if err := json.Unmarshal(payload, &req); err != nil {
				log.Printf("Error unmarshaling message: %v\n", err)
				continue
			}

			room, exists := client.rooms[req.Data.StickyNoteID]
			if !exists {
				log.Printf("Room not found for sticky note ID: %s\n", req.Data.StickyNoteID)
				continue
			}

			if err := client.hub.routeEvent(req, client, hub, room); err != nil {
				log.Printf("Error handling event: %v\n", err)
			}
		}
	}

}
