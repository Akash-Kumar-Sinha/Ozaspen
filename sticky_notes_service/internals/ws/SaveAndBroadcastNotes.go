package ws

import (
	"log"
)

func SaveAndBroadcastNotes(client *Client, event BroadCastLineEvent, hub *Hub, room *Room) error {

	profileID := client.profileID

	room.Ot(event)
	if err := SaveLinesToDb(
		event.Data.StickyNoteID,
		event.Data.Blocks,
		profileID,
	); err != nil {
		log.Printf("Error saving lines to database: %v", err)
		return err
	}

	select {
	case hub.broadcastChan <- BroadcastRequest{
		StickyNoteID: event.Data.StickyNoteID,
		Sender:       client,
		Payload:      event.Data,
	}:
		log.Printf("Successfully broadcasted line update for sticky note %s", event.Data.StickyNoteID)
	default:
		log.Printf("Broadcast queue full — dropping event for %s", event.Data.StickyNoteID)
	}

	return nil
}
