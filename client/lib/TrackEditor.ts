import {
  Block,
  BlockNoteEditor,
  DefaultBlockSchema,
  DefaultInlineContentSchema,
  DefaultStyleSchema,
} from "@blocknote/core";

export function TrackEditor(
  editor: BlockNoteEditor<
    DefaultBlockSchema,
    DefaultInlineContentSchema,
    DefaultStyleSchema
  >
): { block: Block; lineNumber: number } | null {
  if (!editor) return null;
  const cursor = editor.getTextCursorPosition();
  if (!cursor?.block) return null;

  const block = cursor.block;
  const lineNumber = editor.document.findIndex((b) => b.id === block.id);
  console.log("update blocks: ", lineNumber, block);
  return { block, lineNumber: lineNumber + 1 };
}
