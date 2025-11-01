package savestickynotes

import (
	"fmt"
	"sticky_notes_service/internals/database"
	"sticky_notes_service/internals/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

func CheckPermission(stickyNoteID uuid.UUID, profileID uuid.UUID) (bool, bool, error) {
	var collaborator models.Collaborator
	if err := database.DB.Where("sticky_note_id = ? AND profile_id = ?", stickyNoteID, profileID).First(&collaborator).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return false, false, nil
		}
		return false, false, fmt.Errorf("error checking collaborator permissions: %v", err)
	}

	if collaborator.Role == models.RoleEditor || collaborator.Role == models.RoleOwner {
		return true, true, nil
	}

	var shareLinkAccess models.StickyNote
	if err := database.DB.Where("id = ?", stickyNoteID).Preload("ShareLink").First(&shareLinkAccess).Error; err != nil {
		return false, false, fmt.Errorf("error checking share link permissions: %v", err)
	}

	if shareLinkAccess.ShareLink.Access == models.PublicAccess {
		return false, true, nil
	}

	return false, false, nil
}
