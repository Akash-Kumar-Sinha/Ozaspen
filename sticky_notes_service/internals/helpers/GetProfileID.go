package helpers

import (
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func GetProfileID(c *gin.Context) uuid.UUID {
	profileIDStr, exists := c.Get("profileID")
	if !exists {
		c.JSON(401, gin.H{"error": "Unauthorized"})
		return uuid.Nil
	}

	var profileID uuid.UUID
	switch v := profileIDStr.(type) {
	case uuid.UUID:
		profileID = v
	case string:
		id, err := uuid.Parse(v)
		if err != nil {
			c.JSON(400, gin.H{"error": "Invalid profile ID format"})
			return uuid.Nil
		}
		profileID = id
	default:
		c.JSON(400, gin.H{"error": "Invalid profile ID type"})
		return uuid.Nil
	}

	return profileID
}
