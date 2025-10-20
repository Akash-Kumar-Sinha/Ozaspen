package models

import (
	authmodels "sticky_notes_service/internals/models/auth_users.models"
	"time"

	"github.com/google/uuid"
)

type StickyNote struct {
	authmodels.GormModel

	OwnerID uuid.UUID          `gorm:"type:uuid;not null;index"`
	Owner   authmodels.Profile `gorm:"foreignKey:OwnerID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`

	NoteColors string `gorm:"not null"`

	ContentID *uuid.UUID `gorm:"type:uuid;uniqueIndex"`
	Content   *Content   `gorm:"foreignKey:ContentID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`

	ShareLinkID *uuid.UUID `gorm:"type:uuid;index"`
	ShareLink   *ShareLink `gorm:"foreignKey:ShareLinkID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
}

type ShareLink struct {
	authmodels.GormModel
	Token     string `gorm:"uniqueIndex;not null"`
	ExpiresAt *time.Time
	Role      Role `gorm:"type:text;not null;default:'viewer'"`
	Revoked   bool `gorm:"not null;default:false"`
}

type Collaborator struct {
	authmodels.GormModel

	StickyNoteID uuid.UUID  `gorm:"type:uuid;not null;index"`
	StickyNote   StickyNote `gorm:"foreignKey:StickyNoteID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`

	ProfileID uuid.UUID          `gorm:"type:uuid;not null;index"`
	Profile   authmodels.Profile `gorm:"foreignKey:ProfileID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`

	Role Role `gorm:"type:text;not null;default:'viewer'"`
}

type Content struct {
	authmodels.GormModel
	Changes ChangesList `gorm:"type:jsonb;not null;default:'[]'" json:"changes"`

	BlocksID uuid.UUID `gorm:"type:uuid;not null;uniqueIndex"`
	Blocks   Blocks    `gorm:"foreignKey:BlocksID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}

type Change struct {
	Who  string    `json:"who"`
	What string    `json:"what"`
	When time.Time `json:"when"`
}

type Blocks struct {
	authmodels.GormModel
}
