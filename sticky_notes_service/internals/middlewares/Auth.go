package middlewares

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sticky_notes_service/communication"

	"github.com/gin-gonic/gin"
)

type AuthResponse struct {
	Authenticated bool   `json:"authenticated"`
	ProfileID     string `json:"profileID"`
}

func Auth() gin.HandlerFunc {
	return func(c *gin.Context) {

		path := "/auth/session"

		accessToken, err := c.Cookie("access_token")
		if err != nil || accessToken == "" {
			fmt.Printf("not present")
			c.JSON(http.StatusUnauthorized, gin.H{"error": "No access token provided"})
			c.Abort()
			return
		}

		body, resp, readErr := communication.AuthCommunication(c, path)

		var response AuthResponse
		if readErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read response"})
			c.Abort()
			return
		}

		if resp.StatusCode != http.StatusOK {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}

		if err := json.Unmarshal(body, &response); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse response"})
			c.Abort()
			return
		}

		if !response.Authenticated {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}

		c.Set("profileID", response.ProfileID)

		c.Next()
	}
}
