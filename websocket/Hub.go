package websocket

import (
	"fmt"
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type Manager struct {
	clients ClientList
	sync.RWMutex

	handlers map[string]EventHandler
}

func NewManager() *Manager {
	m := &Manager{
		clients:  make(ClientList),
		handlers: make(map[string]EventHandler),
	}

	m.setUpEventHandlers()
	return m
}

func (m *Manager) setUpEventHandlers() {
	m.handlers[EventSaveStickyNote] = SendMessages
}

func SendMessages(event Event, client *Client) error {
	fmt.Printf("Broadcasting message to clients\n")
	return nil
	// for client := range clients {
	// 	if client.egress != nil {
	// 		client.egress <- message
	// 	}
	// }
}

func (m *Manager) routeEvent(event Event, client *Client) error {
	if handler, ok := m.handlers[event.Type]; ok {
		return handler(event, client)
	}
	return fmt.Errorf("no handler for event type: %s", event.Type)
}

func (m *Manager) ServerWs(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		fmt.Printf("Error upgrading connection: %v\n", err)
		return
	}
	client := NewClient(m, conn)

	m.AddClient(client)

	go client.ReadPump()
	go client.WritePump()
}

func (m *Manager) AddClient(client *Client) {
	m.Lock()
	defer m.Unlock()
	m.clients[client] = true
}

func (m *Manager) RemoveClient(client *Client) {
	m.Lock()
	defer m.Unlock()
	if _, ok := m.clients[client]; ok {
		client.conn.Close()
		delete(m.clients, client)
	}
}
