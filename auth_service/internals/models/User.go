package models

import (
	"time"

	"github.com/google/uuid"
)

type GormModel struct {
	ID        uuid.UUID  `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	CreatedAt time.Time  `gorm:"type:timestamp;default:now()"`
	UpdatedAt time.Time  `gorm:"type:timestamp;default:now()"`
	DeletedAt *time.Time `gorm:"type:timestamp;index"`
}

type Profile struct {
	GormModel
	Email      string `gorm:"unique;uniqueIndex;not null"`
	FirstName  string `gorm:"not null"`
	MiddleName string
	LastName   string
	Avatar     string `gorm:"not null"`
}

type User struct {
	GormModel
	ProfileID        uuid.UUID `gorm:"type:uuid;not null;uniqueIndex"`
	Profile          Profile   `gorm:"foreignKey:ProfileID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
	Provider         string    `gorm:"not null"`
	ProviderClientID string    `gorm:"not null"`
	AccessToken      string    `gorm:"type:text"`
	RefreshToken     string    `gorm:"type:text"`

	LastLogin time.Time `gorm:"type:timestamp;default:now()"`
}
