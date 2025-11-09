package models

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
)

type Props map[string]interface{}

type Blocks []Block

type Block struct {
	ID       string        `json:"id"`
	Type     string        `json:"type"`
	Props    Props         `json:"props"`
	Content  InlineContent `json:"content"`
	Children Blocks        `json:"children,omitempty"`
}

type Link struct {
	Type    string       `json:"type"`
	Content []StyledText `json:"content"`
	Href    string       `json:"href"`
}

type StyledText struct {
	Type   string `json:"type"`
	Text   string `json:"text"`
	Styles Props  `json:"styles"`
}

type CustomInlineContent struct {
	Type    string       `json:"type"`
	Content []StyledText `json:"content"`
	Props   Props        `json:"props"`
}

type InlineContent interface {
	isInlineContent()
}

func (p Props) Value() (driver.Value, error) {
	if p == nil {
		return "{}", nil
	}
	b, err := json.Marshal(p)
	if err != nil {
		return nil, err
	}
	return string(b), nil
}

func (p *Props) Scan(value interface{}) error {
	if value == nil {
		*p = make(Props)
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return fmt.Errorf("failed to scan Props: %v", value)
	}
	return json.Unmarshal(bytes, p)
}

func (b Blocks) Value() (driver.Value, error) {
	if b == nil {
		return "[]", nil
	}
	return json.Marshal(b)
}

func (b *Blocks) Scan(value interface{}) error {
	if value == nil {
		*b = []Block{}
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return fmt.Errorf("failed to scan Blocks: %v", value)
	}
	return json.Unmarshal(bytes, b)
}
