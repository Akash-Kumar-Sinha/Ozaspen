package collaborator

import (
	"sticky_notes_service/internals/database"
	"sticky_notes_service/internals/helpers"
	"sticky_notes_service/internals/models"

	"github.com/gin-gonic/gin"
)

type CollaboratorResponse struct {
	Username string      `json:"Username"`
	Avatar   string      `json:"Avatar"`
	Role     models.Role `json:"Role"`
}

func GetCollaborator(c *gin.Context) {

	noteId := c.Param("id")
	profileID := helpers.GetProfileID(c)

	noteUUID, err := helpers.ParseUuid(noteId)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid note ID"})
		return
	}

	var collaborators []CollaboratorResponse
	if err := database.DB.Model(&models.Collaborator{}).
		Where("sticky_note_id = ?", noteUUID).
		Joins("JOIN profiles ON profiles.id = collaborators.profile_id").
		Where("profiles.id != ?", profileID).
		Select("profiles.username as Username, profiles.avatar as Avatar, collaborators.role as Role").
		Scan(&collaborators).Error; err != nil {
		c.JSON(500, gin.H{"error": "Failed to fetch collaborators"})
		return
	}

	c.JSON(200, gin.H{"Collaborators": collaborators})
}
