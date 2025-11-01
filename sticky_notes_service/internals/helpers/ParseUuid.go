package helpers

import (
	"log"

	"github.com/google/uuid"
)

func ParseUuid(idStr string) (uuid.UUID, error) {
	noteUUID, err := uuid.Parse(idStr)
	if err != nil {
		log.Printf("Unable to Parse UUID: %v", err)
		return uuid.Nil, err
	}
	return noteUUID, nil
}
