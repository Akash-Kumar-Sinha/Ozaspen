package helpers

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"
	"sticky_notes_service/internals/database"
	"sticky_notes_service/internals/models"

	"gorm.io/gorm"
)

func generateToken() (string, error) {
	b := make([]byte, 16)
	_, err := rand.Read(b)
	if err != nil {
		return "", fmt.Errorf("failed to generate random bytes: %w", err)
	}

	token := base64.RawURLEncoding.EncodeToString(b)
	return token, nil
}

func GenerateLink() (string, error) {
	for {
		token, err := generateToken()
		if err != nil {
			return "", err
		}

		var existingLink models.ShareLink
		result := database.DB.Where("token = ?", token).First(&existingLink)
		if result.Error != nil && result.Error != gorm.ErrRecordNotFound {
			return "", fmt.Errorf("failed to check existing tokens: %w", result.Error)
		}

		if result.RowsAffected == 0 {
			return token, nil
		}
	}

}
