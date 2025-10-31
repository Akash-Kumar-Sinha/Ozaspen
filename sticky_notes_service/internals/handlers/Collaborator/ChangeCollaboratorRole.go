package collaborator

import (
	"sticky_notes_service/internals/database"
	"sticky_notes_service/internals/helpers"
	"sticky_notes_service/internals/models"
	authmodels "sticky_notes_service/internals/models/auth_users.models"

	"github.com/gin-gonic/gin"
)

type ChangeCollaboratorRoleRequest struct {
	StickyNoteID string `json:"sticky_note_id" binding:"required"`
	Username     string `json:"username" binding:"required"`
	NewRole      string `json:"new_role" binding:"required"`
}

func ChangeCollaboratorRole(c *gin.Context) {
	profileID := helpers.GetProfileID(c)

	var req ChangeCollaboratorRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(400, gin.H{"error": err.Error()})
		return
	}

	noteUUID, err := helpers.ParseUuid(req.StickyNoteID)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid sticky note ID"})
		return
	}
	var noteStickyNote models.StickyNote
	if err := database.DB.Where("id = ? AND owner_id = ?", noteUUID, profileID).First(&noteStickyNote).Error; err != nil {
		c.JSON(403, gin.H{"error": "Only owner can change collaborator roles"})
		return
	}

	var collaboratorUUID authmodels.Profile
	if err := database.DB.Model(&authmodels.Profile{}).Where("username = ?", req.Username).First(&collaboratorUUID).Error; err != nil {
		c.JSON(404, gin.H{"error": "User not found"})
		return
	}

	var collaborator models.Collaborator
	if err := database.DB.Where("sticky_note_id = ? AND  profile_id = ?", noteUUID, collaboratorUUID.ID).First(&collaborator).Error; err != nil {
		c.JSON(404, gin.H{"error": "Collaborator not found"})
		return
	}

	collaborator.Role = models.Role(req.NewRole)

	if err := database.DB.Save(&collaborator).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to update collaborator role"})
		return
	}

	c.JSON(200, gin.H{
		"message": "Collaborator role updated successfully",
		"Role":    collaborator.Role,
	})
}
