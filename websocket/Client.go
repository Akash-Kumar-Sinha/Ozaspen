package websocket

import (
	"encoding/json"
	"fmt"

	"github.com/gorilla/websocket"
)

type ClientList map[*Client]bool

type Client struct {
	manager *Manager
	conn    *websocket.Conn

	egress chan Event
}

func NewClient(manager *Manager, conn *websocket.Conn) *Client {
	return &Client{
		manager: manager,
		conn:    conn,
		egress:  make(chan Event),
	}
}

func (c *Client) ReadPump() {
	defer func() {
		c.manager.RemoveClient(c)
	}()
	for {
		messageType, payload, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				fmt.Printf("Error reading message: %v\n", err)
			}
			break
		}

		var request Event
		if messageType == websocket.TextMessage {
			if err := json.Unmarshal(payload, &request); err != nil {
				fmt.Printf("Error unmarshaling message: %v\n", err)
				continue
			}

			if err := c.manager.routeEvent(request, c); err != nil {
				fmt.Printf("Error handling event: %v\n", err)
			}
		}
	}
}

func (c *Client) WritePump() {
	defer func() {
		c.manager.RemoveClient(c)
	}()
	for {
		select {
		case message, ok := <-c.egress:
			if !ok {
				if err := c.conn.WriteMessage(websocket.CloseMessage, []byte{}); err != nil {
					fmt.Printf("Error writing close message: %v\n", err)
				}
				return
			}

			if err := c.conn.WriteMessage(websocket.TextMessage, message); err != nil {
				fmt.Printf("Error writing message: %v\n", err)
				return
			}
		}
	}
}
