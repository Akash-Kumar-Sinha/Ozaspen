package ws

import "encoding/json"

type Event struct {
	Type string                 `json:"type"`
	Data SaveStickyNotesPayload `json:"data"`
}

type EventHandler func(client *Client, event Event, hub *Hub) error

const (
	EventSaveStickyNote   = "save_sticky_note"
	EventUpdateStickyNote = "update_sticky_note"
)

type SaveStickyNotesPayload struct {
	StickyNoteID string          `json:"sticky_note_id" binding:"required"`
	Blocks       json.RawMessage `json:"blocks" binding:"required"`
}
