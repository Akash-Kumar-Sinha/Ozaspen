package ws

import (
	"fmt"
	"log"
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type Hub struct {
	clients ClientLists
	sync.RWMutex

	handlers map[string]EventHandler
}

func NewHub() *Hub {
	h := &Hub{
		clients:  make(ClientLists),
		handlers: make(map[string]EventHandler),
	}
	h.setUpEventHandlers()
	return h
}
func (h *Hub) setUpEventHandlers() {
	h.handlers[EventSaveStickyNote] = SaveNotes
}

func (m *Hub) routeEvent(event Event, client *Client) error {
	if handler, ok := m.handlers[event.Type]; ok {
		return handler(client, event)
	}
	return fmt.Errorf("no handler for event type: %s", event.Type)
}

func (h *Hub) ServerWs(c *gin.Context) {
	profileIDStr, exists := c.Get("profileID")
	if !exists {
		log.Printf("Profile ID not found in context")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Profile ID not found"})
		return
	}

	profileID, err := uuid.Parse(profileIDStr.(string))
	if err != nil {
		log.Printf("Invalid profile ID format: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid profile ID format"})
		return
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("Unable to establish a connection: %v", err)
		return
	}

	client := NewClient(h, conn, profileID)

	h.AddClient(client)

	go client.ReadPump()
}

func (h *Hub) AddClient(client *Client) {
	h.Lock()
	defer h.Unlock()
	log.Printf("Adding new client")
	h.clients[client] = true
}

func (h *Hub) RemoveClient(client *Client) {
	h.Lock()
	defer h.Unlock()
	log.Printf("Removing client")
	if _, ok := h.clients[client]; !ok {
		client.conn.Close()
		delete(h.clients, client)
	}
}

// Event Function
func SaveNotes(client *Client, event Event) error {
	profileID := client.profileID
	saveRequest := SaveStickyNotesRequest{
		StickyNoteID: event.Data.StickyNoteID,
		Blocks:       event.Data.Blocks,
	}

	if err := SaveStickyNotesToDB(saveRequest, profileID); err != nil {
		log.Printf("Error saving to database: %v", err)
		return err
	}

	log.Printf("Successfully saved sticky note for user: %s", profileID.String())
	return nil
}
