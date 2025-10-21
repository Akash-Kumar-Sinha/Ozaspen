package models

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"time"
)

type Change struct {
	Who  string    `json:"who"`
	What string    `json:"what"`
	When time.Time `json:"when"`
}

type Role string
type ChangesList []Change

const (
	RoleOwner  Role = "owner"
	RoleEditor Role = "editor"
	RoleViewer Role = "viewer"
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
	return json.Marshal(cl)
}

func (cl *ChangesList) Scan(value interface{}) error {
	if value == nil {
		*cl = ChangesList{}
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

	return json.Unmarshal(bytes, cl)
}
