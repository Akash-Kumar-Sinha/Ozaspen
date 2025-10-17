package communication

import (
	"io"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

func AuthCommunication(c *gin.Context, path string) ([]byte, *http.Response, error) {
	authDomain := os.Getenv("BACKEND_AUTH_DOMAIN")

	if authDomain == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Auth service not configured"})
		c.Abort()
		return nil, nil, nil
	}

	authUrl := authDomain + path
	req, err := http.NewRequest("GET", authUrl, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create request"})
		c.Abort()
		return nil, nil, err
	}

	for key, values := range c.Request.Header {
		for _, value := range values {
			req.Header.Add(key, value)
		}
	}

	client := &http.Client{}

	resp, err := client.Do(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to verify session"})
		c.Abort()
		return nil, nil, err
	}
	defer resp.Body.Close()

	body, readErr := io.ReadAll(resp.Body)

	return body, resp, readErr
}
