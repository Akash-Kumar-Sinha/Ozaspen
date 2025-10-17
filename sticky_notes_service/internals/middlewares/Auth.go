package middlewares

import (
	"encoding/json"
	"net/http"
	"sticky_notes_service/communication"

	"github.com/gin-gonic/gin"
)

type AuthResponse struct {
	Authenticated bool `json:"authenticated"`
}

func Auth() gin.HandlerFunc {
	return func(c *gin.Context) {

		path := "/auth/session"

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

		c.Next()
	}
}
