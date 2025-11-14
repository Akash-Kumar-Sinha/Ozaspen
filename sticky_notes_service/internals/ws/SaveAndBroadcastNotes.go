package ws

import (
	"log"
)

func SaveAndBroadcastNotes(client *Client, event Event, hub *Hub) error {
	// profileID := client.profileID
	saveRequest := SaveStickyNotesPayload{
		StickyNoteID: event.Data.StickyNoteID,
		Blocks:       event.Data.Blocks,
	}
	// if err := savestickynotes.SaveStickyNotesToDB(savestickynotes.SaveStickyNotesRequest{
	// 	StickyNoteID: saveRequest.StickyNoteID,
	// 	Blocks:       saveRequest.Blocks,
	// }, profileID); err != nil {
	// 	log.Printf("Error saving to database: %v", err)
	// 	return err
	// }

	select {
	case hub.broadcastChan <- BroadcastRequest{
		StickyNoteID: saveRequest.StickyNoteID,
		Sender:       client,
		Payload:      saveRequest,
	}:
	default:
		log.Printf("Broadcast queue full — dropping event for %s", saveRequest.StickyNoteID)
	}

	return nil
}
