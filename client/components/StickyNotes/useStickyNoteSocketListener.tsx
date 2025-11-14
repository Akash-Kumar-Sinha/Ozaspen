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
}: {
  stickyNoteId: string | undefined;
  editor: BlockNoteEditor<
    DefaultBlockSchema,
    DefaultInlineContentSchema,
    DefaultStyleSchema
  > | null;
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

        if (
          message.type === "update_sticky_note" &&
          message.data.sticky_note_id === stickyNoteId
        ) {
          const isEditorFocused = editor && editor.isFocused();
          if (message.data.blocks && Array.isArray(message.data.blocks)) {
            const blocks = message.data.blocks;
            const isDbBlocks =
              blocks.length > 0 && blocks[0].ID && blocks[0].CreatedAt;

            if (isDbBlocks) {
              const updatedBlocks: Block[] = [];
              for (const blockData of blocks) {
                try {
                  let block: Block;
                  if (typeof blockData.lineContent === "string") {
                    block = JSON.parse(blockData.lineContent);
                  } else if (
                    blockData.lineContent &&
                    typeof blockData.lineContent === "object"
                  ) {
                    block = blockData.lineContent as Block;
                  } else {
                    continue;
                  }

                  updatedBlocks.push(block);
                } catch {}
              }

              if (editor && updatedBlocks.length > 0) {
                let currentCursor = null;
                if (isEditorFocused) {
                  currentCursor = editor.getTextCursorPosition();
                }

                editor.replaceBlocks(editor.document, updatedBlocks);

                setTimeout(() => {
                  if (currentCursor && currentCursor.block && isEditorFocused) {
                    try {
                      const targetBlock = updatedBlocks.find(
                        (block) => block.id === currentCursor.block.id
                      );
                      if (targetBlock) {
                        editor.setTextCursorPosition(targetBlock, "end");
                      } else {
                        const lastBlock =
                          updatedBlocks[updatedBlocks.length - 1];
                        if (lastBlock) {
                          editor.setTextCursorPosition(lastBlock, "end");
                        }
                      }
                    } catch {}
                  }
                }, 10);
              }
            } else {
              const updatedBlocks: Block[] = blocks;

              if (editor && updatedBlocks.length > 0) {
                let currentCursor = null;
                if (isEditorFocused) {
                  currentCursor = editor.getTextCursorPosition();
                }

                editor.replaceBlocks(editor.document, updatedBlocks);

                setTimeout(() => {
                  if (currentCursor && currentCursor.block && isEditorFocused) {
                    try {
                      const targetBlock = updatedBlocks.find(
                        (block) => block.id === currentCursor.block.id
                      );
                      if (targetBlock) {
                        editor.setTextCursorPosition(targetBlock, "end");
                      } else {
                        const lastBlock =
                          updatedBlocks[updatedBlocks.length - 1];
                        if (lastBlock) {
                          editor.setTextCursorPosition(lastBlock, "end");
                        }
                      }
                    } catch {}
                  }
                }, 10);
              }
            }
          } else if (
            message.data.blocks &&
            !Array.isArray(message.data.blocks) &&
            message.data.blocks.lineContent &&
            message.data.blocks.number
          ) {
            const blockData = message.data.blocks;
            const lineNumber = blockData.number;

            try {
              let newBlock: Block;
              if (typeof blockData.lineContent === "string") {
                newBlock = JSON.parse(blockData.lineContent);
              } else if (
                blockData.lineContent &&
                typeof blockData.lineContent === "object"
              ) {
                newBlock = blockData.lineContent as Block;
              } else {
                return;
              }

              if (editor) {
                const currentBlocks = [...editor.document];

                const targetIndex = lineNumber - 1;

                if (targetIndex < 0) {
                  return;
                }

                let updatedBlocks: Block[];

                if (targetIndex >= currentBlocks.length) {
                  updatedBlocks = [...currentBlocks, newBlock];
                } else {
                  updatedBlocks = [...currentBlocks];
                  updatedBlocks[targetIndex] = newBlock;
                }

                let currentCursor = null;
                if (isEditorFocused) {
                  currentCursor = editor.getTextCursorPosition();
                }

                editor.replaceBlocks(editor.document, updatedBlocks);

                setTimeout(() => {
                  if (
                    currentCursor &&
                    currentCursor.block &&
                    editor.isFocused()
                  ) {
                    try {
                      const targetBlock = updatedBlocks.find(
                        (block) => block.id === currentCursor.block.id
                      );
                      if (targetBlock) {
                        editor.setTextCursorPosition(targetBlock, "end");
                      } else {
                        const lastBlock =
                          updatedBlocks[updatedBlocks.length - 1];
                        if (lastBlock) {
                          editor.setTextCursorPosition(lastBlock, "end");
                        }
                      }
                    } catch {}
                  }
                }, 10);
              }
            } catch {}
          } else if (message.data.line) {
            const lineData = message.data.line;
            const lineNumber = lineData.number;

            try {
              let newBlock: Block;
              if (typeof lineData.lineContent === "string") {
                newBlock = JSON.parse(lineData.lineContent);
              } else if (
                lineData.lineContent &&
                typeof lineData.lineContent === "object"
              ) {
                newBlock = lineData.lineContent as Block;
              } else {
                return;
              }

              if (editor) {
                const currentBlocks = [...editor.document];

                const targetIndex = lineNumber - 1;

                if (targetIndex < 0) {
                  return;
                }

                let updatedBlocks: Block[];

                if (targetIndex >= currentBlocks.length) {
                  updatedBlocks = [...currentBlocks, newBlock];
                } else {
                  updatedBlocks = [
                    ...currentBlocks.slice(0, targetIndex),
                    newBlock,
                    ...currentBlocks.slice(targetIndex),
                  ];
                }

                editor.replaceBlocks(editor.document, updatedBlocks);
              }
            } catch {}
          } else {
            return;
          }

          isReceivingUpdate.current = true;

          setTimeout(() => {
            isReceivingUpdate.current = false;
          }, 100);
        }
      } catch {}
    },
    [stickyNoteId, editor]
  );

  useEffect(() => {
    if (!isConnected || !stickyNoteId) {
      return;
    }

    const socket = getSocket();
    if (!socket) {
      return;
    }

    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [handleMessage, isConnected, stickyNoteId]);

  return {
    handleMessage,
    isReceivingUpdate: isReceivingUpdate.current,
    lastSavedBlocks: lastSavedBlocks.current,
  };
}
