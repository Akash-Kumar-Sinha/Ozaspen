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

type Room struct {
	clients ClientLists
	sync.RWMutex
}

type Hub struct {
	rooms    map[string]*Room
	handlers map[string]EventHandler
	sync.RWMutex
}

func NewHub() *Hub {
	h := &Hub{
		rooms:    make(map[string]*Room),
		handlers: make(map[string]EventHandler),
	}
	h.setUpEventHandlers()
	return h
}

func NewRoom() *Room {
	return &Room{
		clients: make(ClientLists),
	}
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
	stickyNoteID := c.Param("stickyNoteID")
	if stickyNoteID == "" {
		log.Printf("Sticky Note ID is required")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Sticky Note ID is required"})
		return
	}
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

	h.AddClient(stickyNoteID, client)

	go client.ReadPump(stickyNoteID)
}

func (h *Hub) AddClient(stickyNoteID string, client *Client) {
	h.Lock()
	defer h.Unlock()
	log.Printf("Adding new client")
	room, exists := h.rooms[stickyNoteID]
	if !exists {
		room = NewRoom()
		h.rooms[stickyNoteID] = room
	}
	room.Lock()
	defer room.Unlock()
	room.clients[client] = true
	client.rooms[stickyNoteID] = room

}

func (h *Hub) RemoveClient(stickyNoteID string, client *Client) {
	h.Lock()
	defer h.Unlock()
	log.Printf("Removing client")
	room, exists := h.rooms[stickyNoteID]
	if exists {
		room.Lock()
		defer room.Unlock()
		if _, ok := room.clients[client]; ok {
			delete(room.clients, client)
			delete(client.rooms, stickyNoteID)
			if len(room.clients) == 0 {
				delete(h.rooms, stickyNoteID)
			}
		}
	}
}

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
