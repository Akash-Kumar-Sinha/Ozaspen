package helpers

import (
	"strings"

	"github.com/gin-gonic/gin"
)

func BindingErrors(c *gin.Context, err error) {
	c.JSON(400, gin.H{
		"error": err.Error(),
	})
}

func SplitName(fullName string) (string, *string, string) {
	var firstName, middleName, lastName string
	nameParts := strings.Fields(fullName)

	if len(nameParts) == 1 {
		firstName = nameParts[0]
	} else if len(nameParts) == 2 {
		firstName = nameParts[0]
		lastName = nameParts[1]
	} else if len(nameParts) > 2 {
		firstName = nameParts[0]
		lastName = nameParts[len(nameParts)-1]
		middle := strings.Join(nameParts[1:len(nameParts)-1], " ")
		middleName = middle
	}

	if middleName == "" {
		return firstName, nil, lastName
	}
	return firstName, &middleName, lastName
}
