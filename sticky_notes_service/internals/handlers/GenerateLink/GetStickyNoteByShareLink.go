package generatelink

import (
	"errors"
	"net/http"
	"sticky_notes_service/internals/database"
	"sticky_notes_service/internals/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func GetStickyNoteByShareLink(c *gin.Context) {
	token := c.Param("token")

	profileIDStr, exists := c.Get("profileID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Login required"})
		return
	}

	var profileUUID uuid.UUID
	switch v := profileIDStr.(type) {
	case uuid.UUID:
		profileUUID = v
	case string:
		id, err := uuid.Parse(v)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid profile ID format"})
			return
		}
		profileUUID = id
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid profile ID type"})
		return
	}

	tx := database.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	var link models.ShareLink
	err := tx.Where("token = ? AND revoked = FALSE", token).First(&link).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Invalid or revoked share link"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	var note models.StickyNote
	err = tx.Preload("Content").Preload("ShareLink").
		Where("share_link_id = ?", link.ID).
		First(&note).Error
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Sticky note not found for this link"})
		return
	}

	userRole := models.RoleViewer
	canEdit := false

	if note.OwnerID == profileUUID {
		userRole = models.RoleOwner
		canEdit = true
	} else {
		var collab models.Collaborator
		err := tx.Where("sticky_note_id = ? AND profile_id = ?", note.ID, profileUUID).First(&collab).Error
		if err == nil {
			userRole = collab.Role
			canEdit = (collab.Role == models.RoleEditor)
		} else if link.Access != models.PublicAccess {
			c.JSON(http.StatusForbidden, gin.H{"error": "You do not have permission to view this note"})
			return
		}
	}

	tx.Commit()

	c.JSON(http.StatusOK, gin.H{
		"Note":    note,
		"Role":    userRole,
		"CanEdit": canEdit,
	})
}
