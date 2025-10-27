package ws

import (
	"encoding/json"
	"fmt"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

type ClientLists map[*Client]bool

type Client struct {
	hub       *Hub
	conn      *websocket.Conn
	profileID uuid.UUID // Add profileID to store user identity
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
				fmt.Printf("Error reading message: %v\n", err)
			}
			break
		}

		var req Event
		if messageType == websocket.TextMessage {
			if err := json.Unmarshal(payload, &req); err != nil {
				fmt.Printf("Error unmarshaling message: %v\n", err)
				continue
			}
			fmt.Printf("\nThe parsed data is %v\n", req)

			if err := client.hub.routeEvent(req, client); err != nil {
				fmt.Printf("Error handling event: %v\n", err)
			}
		}
	}

}
