import { useRef, useCallback, useEffect } from "react";
import {
  BlockNoteEditor,
  DefaultBlockSchema,
  DefaultInlineContentSchema,
  DefaultStyleSchema,
  Block,
} from "@blocknote/core";
import { getSocket } from "@/app/lib/features/socketSlice";
import { useAppSelector } from "@/app/lib/hooks";
import { RootState } from "@/app/lib/store";

export function useStickyNoteSocketListener({
  stickyNoteId,
  editor,
  setBlocks,
}: {
  stickyNoteId: string | undefined;
  editor: BlockNoteEditor<
    DefaultBlockSchema,
    DefaultInlineContentSchema,
    DefaultStyleSchema
  > | null;
  setBlocks?: (blocks: Block[]) => void;
}) {
  const isReceivingUpdate = useRef(false);
  const lastSavedBlocks = useRef<string>("");

  const isConnected = useAppSelector(
    (state: RootState) => state.socket.isConnected
  );

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        console.log("WebSocket message received:", message);

        if (
          message.type === "update_sticky_note" &&
          message.data.sticky_note_id === stickyNoteId
        ) {
          const updatedBlocks = message.data.blocks;
          console.log("Processing sticky note update for ID:", stickyNoteId);
          console.log("Updated blocks:", updatedBlocks);

          isReceivingUpdate.current = true;

          // Update the editor if it exists
          if (editor) {
            editor.replaceBlocks(editor.document, updatedBlocks);
          }

          // Update blocks state if setter is provided
          if (setBlocks) {
            setBlocks(updatedBlocks);
          }

          lastSavedBlocks.current = JSON.stringify(updatedBlocks);

          setTimeout(() => {
            isReceivingUpdate.current = false;
          }, 100);
        }
      } catch (err) {
        console.error("Error handling incoming WebSocket message:", err);
      }
    },
    [stickyNoteId, editor, setBlocks]
  );

  useEffect(() => {
    if (!isConnected || !stickyNoteId) {
      console.log("WebSocket not connected or no sticky note ID");
      return;
    }

    const socket = getSocket();
    if (!socket) {
      console.log("No socket available");
      return;
    }

    console.log("Setting up WebSocket listener for sticky note:", stickyNoteId);
    socket.addEventListener("message", handleMessage);

    return () => {
      console.log("Cleaning up WebSocket listener");
      socket.removeEventListener("message", handleMessage);
    };
  }, [handleMessage, isConnected, stickyNoteId]);

  return {
    handleMessage,
    isReceivingUpdate: isReceivingUpdate.current,
    lastSavedBlocks: lastSavedBlocks.current,
  };
}
