package middlewares

import (
	"auth_service/internals/database"
	"auth_service/internals/helpers"
	"auth_service/internals/models"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

func SessionHandler(c *gin.Context) {
	accessToken, err := c.Cookie("access_token")
	if err != nil || accessToken == "" {
		fmt.Println("No access token cookie found")
		c.JSON(http.StatusUnauthorized, gin.H{"authenticated": false})
		return
	}

	valid := helpers.VerifySession(accessToken, c)
	if !valid {
		c.JSON(http.StatusOK, gin.H{"authenticated": valid})
		return
	}

	userInfo, err := helpers.GetUserInfoFromGoogle(accessToken)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"authenticated": false})
		return
	}

	var profile models.Profile
	err = database.DB.Where("email = ?", userInfo.Email).First(&profile).Error
	if err != nil {

		c.JSON(http.StatusOK, gin.H{"authenticated": false})
		return
	}

	c.JSON(http.StatusOK, gin.H{"authenticated": valid})

}
