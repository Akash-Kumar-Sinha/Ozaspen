package ws

import "gorm.io/datatypes"

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
	StickyNoteID string         `json:"sticky_note_id" binding:"required"`
	Blocks       datatypes.JSON `json:"blocks" binding:"required"`
}
