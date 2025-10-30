package handlers

import (
	"sticky_notes_service/internals/database"
	"sticky_notes_service/internals/helpers"

	"github.com/gin-gonic/gin"
)

type SearchUsernameResponse struct {
	ProfileID string `json:"ProfileID"`
	Username  string `json:"Username"`
	Avatar    string `json:"Avatar"`
}

func SearchUsername(c *gin.Context) {
	userName := c.Param("username")

	profileID := helpers.GetProfileID(c)

	// This query is not working properly with GORM as id is of uuid type and i am returning it as a string
	// var profiles []SearchUsernameResponse
	// if err := database.DB.Model(&authmodels.Profile{}).
	// 	Where("username ILIKE ? AND id != ?", "%"+userName+"%", profileID).
	// 	Limit(10).
	// 	Select("id as ProfileID, username as Username, avatar as Avatar").
	// 	Scan(&profiles).Error; err != nil {
	// 	c.JSON(500, gin.H{"error": "failed to search usernames"})
	// 	return
	// }

	var profiles []SearchUsernameResponse
	if err := database.DB.Raw(`
		SELECT id::text as profile_id, username, avatar 
		FROM profiles 
		WHERE username ILIKE ? AND id != ? 
		LIMIT 10
	`, "%"+userName+"%", profileID).Scan(&profiles).Error; err != nil {
		c.JSON(500, gin.H{"error": "failed to search usernames"})
		return
	}

	c.JSON(200, gin.H{"Profiles": profiles})

}
