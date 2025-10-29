package generatelink

import (
	"fmt"
	"os"
	"sticky_notes_service/internals/database"
	"sticky_notes_service/internals/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func GenerateShareLink(c *gin.Context) {
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

	tx := database.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	if note.ShareLinkID != nil {
		var existingLink models.ShareLink
		if err := tx.Where("id = ?", *note.ShareLinkID).First(&existingLink).Error; err == nil {
			frontendURL := os.Getenv("FRONTEND_URL")
			if frontendURL == "" {
				c.JSON(500, gin.H{"error": "FRONTEND_URL not set in environment"})
				return
			}
			link := fmt.Sprintf("%s/workspace/sticky-notes/shared/%s", frontendURL, existingLink.Token)
			c.JSON(200, gin.H{
				"Link":    link,
				"Access":  existingLink.Access,
				"Revoked": existingLink.Revoked,
				"Success": true,
			})
			return
		}
	}

	token, err := generateLink()
	if err != nil {
		tx.Rollback()
		c.JSON(500, gin.H{"error": "Failed to generate link"})
		return
	}

	shareLink := models.ShareLink{
		Token:  token,
		Access: models.PublicAccess,
	}

	if err := tx.Create(&shareLink).Error; err != nil {
		tx.Rollback()
		c.JSON(500, gin.H{"error": "Failed to create share link"})
		return
	}

	if err := tx.Model(&models.StickyNote{}).
		Where("id = ?", noteUUID).
		Update("share_link_id", shareLink.ID).Error; err != nil {
		tx.Rollback()
		c.JSON(500, gin.H{"error": "Failed to update sticky note with share link"})
		return
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to save share link"})
		return
	}

	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		c.JSON(500, gin.H{"error": "FRONTEND_URL not set in environment"})
		return
	}

	link := fmt.Sprintf("%s/workspace/sticky-notes/shared/%s", frontendURL, token)
	c.JSON(200, gin.H{
		"Link":    link,
		"Access":  shareLink.Access,
		"Revoked": shareLink.Revoked,
		"Success": true,
	})
}
