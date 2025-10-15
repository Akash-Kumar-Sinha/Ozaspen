package helpers

import (
	"fmt"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

func RefreshAccessToken(refreshToken string) (string, int, string, error) {
	resp, err := http.PostForm("https://oauth2.googleapis.com/token", map[string][]string{
		"client_id":     {os.Getenv("GOOGLE_CLIENT_ID")},
		"client_secret": {os.Getenv("GOOGLE_CLIENT_SECRET")},
		"refresh_token": {refreshToken},
		"grant_type":    {"refresh_token"},
	})
	if err != nil {
		return "", 0, "", fmt.Errorf("failed to refresh access token: %v", err)
	}
	defer resp.Body.Close()

	var data struct {
		AccessToken  string `json:"access_token"`
		RefreshToken string `json:"refresh_token"`
		ExpiresIn    int    `json:"expires_in"`
	}

	return data.AccessToken, data.ExpiresIn, data.RefreshToken, nil
}

func VerifySession(accessToken string, c *gin.Context) bool {
	if accessToken == "" {
		fmt.Println("No access token cookie found")
		return false
	}

	resp, err := http.Get("https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=" + accessToken)
	if err != nil || resp.StatusCode != http.StatusOK {
		refreshToken, rErr := c.Cookie("refresh_token")
		if rErr != nil || refreshToken == "" {
			return false
		}

		newAccessToken, expiresIn, newRefreshToken, refreshErr := RefreshAccessToken(refreshToken)
		if refreshErr != nil {
			return false
		}
		backendDomain := os.Getenv("BACKEND_DOMAIN")

		c.SetCookie(
			"refresh_token", // cookie name
			newRefreshToken, // cookie value
			7*24*3600,       // max age in seconds (1 week)
			"/",             // path
			backendDomain,   // domain
			false,           // secure: false on localhost
			true,            // httpOnly: true
		)

		c.SetCookie(
			"access_token", // cookie name
			newAccessToken, // cookie value
			expiresIn,      // max age in seconds (1 hour)
			"/",            // path
			backendDomain,  // domain
			false,          // secure: false on localhost
			true,           // httpOnly: true
		)

		accessToken = newAccessToken
	}

	return true
}
