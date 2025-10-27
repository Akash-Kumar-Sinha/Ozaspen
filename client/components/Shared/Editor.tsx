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
  setBlock: React.Dispatch<React.SetStateAction<Block[]>>;
}
const Editor = ({ editor, customTheme, setBlock }: EditorProps) => {
  return (
    <div
      style={{ height: "100%" }}
      className="overflow-y-auto sticky-note-scrollbar"
    >
      <BlockNoteView
        editor={editor}
        theme={customTheme}
        onChange={() => {
          setBlock(editor.document);
        }}
      />
    </div>
  );
};

export default Editor;
