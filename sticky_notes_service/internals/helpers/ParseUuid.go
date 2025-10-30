package helpers

import (
	"log"

	"github.com/google/uuid"
)

func ParseUuid(idStr string) (string, error) {
	noteUUID, err := uuid.Parse(idStr)
	if err != nil {
		log.Printf("Unable to Parse UUID: %v", err)
		return "", err
	}
	return noteUUID.String(), nil
}
