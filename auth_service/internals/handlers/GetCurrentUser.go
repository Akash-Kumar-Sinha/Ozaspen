package handlers

import (
	"auth_service/internals/database"
	"auth_service/internals/models"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

func GetCurrentUser(c *gin.Context) {

	userEmail, exists := c.Get("userEmail")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User email not found in context"})
		return
	}

	var profile models.Profile
	err := database.DB.Where("email = ?", userEmail).First(&profile).Error
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found or token invalid"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"user": gin.H{
			"id":     profile.ID,
			"email":  profile.Email,
			"name":   profile.FirstName + " " + profile.LastName,
			"avatar": profile.Avatar,
		},
	})
}

func Logout(c *gin.Context) {
	userEmail, exists := c.Get("userEmail")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User email not found in context"})
		return
	}
	var profile models.Profile
	err := database.DB.Where("email = ?", userEmail).First(&profile).Error
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found or already logged out"})
		return
	}

	accessToken, err := c.Cookie("access_token")
	if err != nil || accessToken == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"authenticated": false})
		return
	}

	backendDomain := os.Getenv("BACKEND_DOMAIN")
	c.SetCookie(
		"access_token",
		"",
		-1,
		"/",
		backendDomain,
		false,
		true,
	)

	c.SetCookie(
		"refresh_token",
		"",
		-1,
		"/",
		backendDomain,
		false,
		true,
	)

	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})

	revokeURL := "https://oauth2.googleapis.com/revoke?token=" + accessToken
	resp, err := http.Post(revokeURL, "application/x-www-form-urlencoded", nil)
	if err == nil {
		resp.Body.Close()
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Logged out successfully",
	})
}
