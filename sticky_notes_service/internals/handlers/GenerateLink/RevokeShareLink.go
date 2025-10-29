package generatelink

import (
	"net/http"
	"sticky_notes_service/internals/database"
	"sticky_notes_service/internals/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func RevokeShareLink(c *gin.Context) {
	profileIDStr, exists := c.Get("profileID")
	if !exists {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Profile ID not found in context"})
		return
	}

	profileID, err := uuid.Parse(profileIDStr.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid profile ID format"})
		return
	}

	noteUUID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid note ID format"})
		return
	}

	var stickyNote models.StickyNote
	if err := database.DB.Where("id = ? AND owner_id = ?", noteUUID, profileID).First(&stickyNote).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Sticky note not found or not owned by user"})
		return
	}

	if stickyNote.ShareLinkID == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No share link to revoke for this sticky note"})
		return
	}

	tx := database.DB.Begin()

	var shareLink models.ShareLink
	if err := tx.First(&shareLink, "id = ?", *stickyNote.ShareLinkID).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve share link"})
		return
	}

	shareLink.Revoked = !shareLink.Revoked
	if err := tx.Save(&shareLink).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update share link"})
		return
	}

	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"revoked": shareLink.Revoked,
	})
}
