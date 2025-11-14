package ws

import "fmt"

func (room *Room) Ot(event BroadCastLineEvent) error {

	lineNumber := event.Data.Blocks[0].Number
	lineContent := event.Data.Blocks[0].LineContent
	fmt.Printf("line number %v\n", lineNumber)
	fmt.Printf("line content %v\n", lineContent)

	return nil
}
