package models

import (
	authmodels "sticky_notes_service/internals/models/auth_users.models"

	"github.com/google/uuid"
)

type StickyNote struct {
	authmodels.GormModel

	OwnerID uuid.UUID          `gorm:"type:uuid;not null;index"`
	Owner   authmodels.Profile `gorm:"foreignKey:OwnerID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`

	Title      string `gorm:"default:'Untitled Sticky Note';not null"`
	NoteColors string `gorm:"not null"`

	BlocksContentID *uuid.UUID     `gorm:"type:uuid;uniqueIndex"`
	BlocksContent   *BlocksContent `gorm:"foreignKey:BlocksContentID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`

	ShareLinkID *uuid.UUID `gorm:"type:uuid;index"`
	ShareLink   *ShareLink `gorm:"foreignKey:ShareLinkID;constraint:OnUpdate:CASCADE,OnDelete:SET NULL;"`
}

type ShareLink struct {
	authmodels.GormModel
	Token   string `gorm:"uniqueIndex;not null"`
	Access  Access `gorm:"type:text;not null;default:'private'"`
	Revoked bool   `gorm:"not null;default:false"`
}

type Collaborator struct {
	authmodels.GormModel

	StickyNoteID uuid.UUID  `gorm:"type:uuid;not null;index:idx_note_user,unique"`
	StickyNote   StickyNote `gorm:"foreignKey:StickyNoteID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`

	ProfileID uuid.UUID          `gorm:"type:uuid;not null;index:idx_note_user,unique"`
	Profile   authmodels.Profile `gorm:"foreignKey:ProfileID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`

	Role Role `gorm:"type:text;not null;default:'viewer'"`
}

type BlocksContent struct {
	authmodels.GormModel
	Blocks []Line `gorm:"foreignKey:BlocksContentID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`
}
