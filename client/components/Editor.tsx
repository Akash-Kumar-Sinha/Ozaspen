import { BlockNoteView, Theme } from "@blocknote/mantine";
import { BlockNoteEditor, DefaultBlockSchema, DefaultInlineContentSchema, DefaultStyleSchema } from "@blocknote/core";
import React from "react";

interface EditorProps {
  editor: BlockNoteEditor<DefaultBlockSchema, DefaultInlineContentSchema, DefaultStyleSchema>;
  customTheme?: Theme;
}
const Editor = ({ editor, customTheme }: EditorProps) => {
  return (
    <div
      style={{ height: "100%" }}
      className="overflow-y-auto sticky-note-scrollbar"
    >
      <BlockNoteView editor={editor} theme={customTheme} />
    </div>
  );
};

export default Editor;
