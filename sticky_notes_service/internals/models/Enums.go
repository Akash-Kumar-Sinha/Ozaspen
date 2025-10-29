package models

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
)

type Change struct {
	WhoID   uuid.UUID `json:"who_id"`
	WhoName string    `json:"who_name"`
	What    string    `json:"what"`
	When    time.Time `json:"when"`
}

type Role string
type Access string

type ChangesList []Change

const (
	RoleOwner  Role = "owner"
	RoleEditor Role = "editor"
	RoleViewer Role = "viewer"
)

const (
	PrivateAccess Access = "private"
	PublicAccess  Access = "public"
)

func (r Role) CanEdit() bool {
	return r == RoleEditor || r == RoleOwner
}
func (r Role) CanView() bool {
	return true
}

func (cl ChangesList) Value() (driver.Value, error) {
	if cl == nil {
		return "[]", nil
	}

	data, err := json.Marshal(cl)

	if err != nil {
		return nil, fmt.Errorf("failed to marshal ChangesList: %w", err)
	}

	return data, nil
}

func (cl *ChangesList) Scan(value interface{}) error {
	if value == nil {
		*cl = make(ChangesList, 0)
		return nil
	}

	var bytes []byte
	switch v := value.(type) {
	case []byte:
		bytes = v
	case string:
		bytes = []byte(v)
	default:
		return fmt.Errorf("cannot scan %T into ChangesList", value)
	}

	if len(bytes) == 0 {
		*cl = make(ChangesList, 0)
		return nil
	}

	if err := json.Unmarshal(bytes, cl); err != nil {
		return fmt.Errorf("failed to unmarshal ChangesList: %w", err)
	}

	return nil
}
