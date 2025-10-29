package generatelink

import (
	"sticky_notes_service/internals/database"
	"sticky_notes_service/internals/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func ChangeAccess(c *gin.Context) {
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
	var shareLink models.ShareLink
	if err := database.DB.Where("id = ?", *note.ShareLinkID).First(&shareLink).Error; err != nil {
		c.JSON(404, gin.H{"error": "Share link not found"})
		return
	}

	if shareLink.Access == models.PrivateAccess {
		shareLink.Access = models.PublicAccess
	} else {
		shareLink.Access = models.PrivateAccess
	}

	if err := database.DB.Save(&shareLink).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to update share link access"})
		return
	}

	c.JSON(200, gin.H{
		"Message": "Share link access updated successfully",
		"Success": true,
		"Access":  shareLink.Access,
	})
}
