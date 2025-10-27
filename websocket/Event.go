package websocket

import "gorm.io/datatypes"

type Event struct {
	Type string                 `json:"type"`
	Data SaveStickyNotesRequest `json:"data"`
}

type EventHandler func(event Event, client *Client) error

const (
	EventSaveStickyNote = "save_sticky_note"
)

type SaveStickyNotePayload struct {
	StickyNoteID string         `json:"sticky_note_id" binding:"required"`
	Blocks       datatypes.JSON `json:"blocks" binding:"required"`
}
