import { BlockNoteView, Theme } from "@blocknote/mantine";
import {
  Block,
  BlockNoteEditor,
  DefaultBlockSchema,
  DefaultInlineContentSchema,
  DefaultStyleSchema,
} from "@blocknote/core";
import React from "react";

interface EditorProps {
  editor: BlockNoteEditor<
    DefaultBlockSchema,
    DefaultInlineContentSchema,
    DefaultStyleSchema
  >;
  customTheme: Theme;
  setBlock?: React.Dispatch<React.SetStateAction<Block[]>>;
  editable?: boolean;
  isReceivingUpdate?: boolean;
}
const Editor = ({
  editor,
  customTheme,
  setBlock,
  editable = true,
  isReceivingUpdate = false,
}: EditorProps) => {
  return (
    <div
      style={{ height: "100%" }}
      className="overflow-y-auto sticky-note-scrollbar"
    >
      <BlockNoteView
        editor={editor}
        theme={customTheme}
        editable={editable}
        onChange={() => {
          if (!isReceivingUpdate) {
            console.log("📝 Editor onChange - calling setBlock");
            setBlock?.(editor.document);
          }
        }}
      />
    </div>
  );
};

export default Editor;
