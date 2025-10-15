package middlewares

import (
	"auth_service/internals/helpers"
	"net/http"

	"github.com/gin-gonic/gin"
)

func AuthSession() gin.HandlerFunc {
	return func(c *gin.Context) {
		accessToken, err := c.Cookie("access_token")
		if err != nil || accessToken == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"authenticated": false})
			return
		}

		valid := helpers.VerifySession(accessToken, c)
		if !valid {
			c.JSON(http.StatusUnauthorized, gin.H{"authenticated": false})
			return
		}

		userInfo, err := helpers.GetUserInfoFromGoogle(accessToken)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user info", "details": err.Error()})
			return
		}

		c.Set("userEmail", userInfo.Email)

		c.Next()
	}
}
