package generatelink

import (
	"sticky_notes_service/internals/database"
	"sticky_notes_service/internals/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func DeleteStickyNoteLink(c *gin.Context) {
	profileIDStr, exists := c.Get("profileID")
	if !exists {
		c.JSON(401, gin.H{"error": "Unauthorized"})
		return
	}

	var profileID uuid.UUID
	switch v := profileIDStr.(type) {
	case uuid.UUID:
		profileID = v
	case string:
		id, err := uuid.Parse(v)
		if err != nil {
			c.JSON(400, gin.H{"error": "Invalid profile ID format"})
			return
		}
		profileID = id
	default:
		c.JSON(400, gin.H{"error": "Invalid profile ID type"})
		return
	}

	noteID := c.Param("id")
	noteUUID, err := uuid.Parse(noteID)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid note ID format"})
		return
	}

	var note models.StickyNote
	if err := database.DB.Where("id = ? AND owner_id = ?", noteUUID, profileID).First(&note).Error; err != nil {
		c.JSON(404, gin.H{"error": "Sticky note not found or not owned by user"})
		return
	}

	if note.ShareLinkID == nil {
		c.JSON(400, gin.H{"error": "No share link associated with this sticky note"})
		return
	}
	
	tx := database.DB.Begin()

	var shareLink models.ShareLink
	if err := tx.Where("id = ?", *note.ShareLinkID).First(&shareLink).Error; err != nil {
		tx.Rollback()
		c.JSON(404, gin.H{"error": "Share link not found"})
		return
	}

	if err := tx.Delete(&shareLink).Error; err != nil {
		tx.Rollback()
		c.JSON(500, gin.H{"error": "Failed to delete share link"})
		return
	}

	note.ShareLinkID = nil
	if err := tx.Save(&note).Error; err != nil {
		tx.Rollback()
		c.JSON(500, gin.H{"error": "Failed to dissociate share link from sticky note"})
		return
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to commit transaction"})
		return
	}

	c.JSON(200, gin.H{
		"Success": true,
	})
}
