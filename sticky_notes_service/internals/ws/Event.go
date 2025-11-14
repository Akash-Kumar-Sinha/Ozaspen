package ws

import (
	"sticky_notes_service/internals/models"
)

type EventHandler func(client *Client, event BroadCastLineEvent, hub *Hub, room *Room) error

const (
	EventSaveStickyNote   = "save_sticky_note"
	EventUpdateStickyNote = "update_sticky_note"
)

type BroadCastBlocksEvent struct {
	Type string                 `json:"type"`
	Data SaveStickyNotesPayload `json:"data"`
}

type SaveStickyNotesPayload struct {
	StickyNoteID string        `json:"sticky_note_id" binding:"required"`
	Blocks       []models.Line `json:"blocks" binding:"required"`
}

type BroadCastLineEvent struct {
	Type string                `json:"type"`
	Data StickyNoteLinePayload `json:"data"`
}

type StickyNoteLinePayload struct {
	StickyNoteID string        `json:"sticky_note_id" binding:"required"`
	Blocks       []models.Line `json:"blocks" binding:"required"`
}

type LinePayload struct {
	Number      int           `gorm:"not null" json:"number"`
	LineContent []models.Line `gorm:"type:jsonb;not null" json:"lineContent"`
}
