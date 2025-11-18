import { Cursor } from "./cursor";

/**
 * Editor state interface
 */
export interface EditorDocument {
  lines: string[];
}

/**
 * Editor state singleton
 */
export const editor = {
  cursors: [] as Cursor[],
  document: null as EditorDocument | null,
};

/**
 * Editor elements references
 */
export const elements = {
  editor: null as HTMLElement | null,
  lines: null as HTMLElement | null,
  decorations: null as HTMLElement | null,
  textarea: null as HTMLTextAreaElement | null,
};

/**
 * Editor settings
 */
export const settings = {
  lineHeight: 28,
  fontSize: 14,
  fontFamily: "monospace",
  tabSize: 2,
};

