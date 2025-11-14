package models

import (
	authmodels "sticky_notes_service/internals/models/auth_users.models"

	"github.com/google/uuid"
	"gorm.io/datatypes"
)

type Line struct {
	authmodels.GormModel
	BlocksContentID uuid.UUID      `gorm:"type:uuid;not null;index"`
	Number          int            `gorm:"not null" json:"number"`
	LineContent     datatypes.JSON `gorm:"type:jsonb;not null" json:"lineContent"`
}
