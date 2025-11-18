import { Point } from "./point";
import { editor as editorState } from "./editor";

/**
 * Cursor represents a text cursor in the editor
 */
export class Cursor {
  public readonly id: string;
  private _position: Point;
  private _selectionStart: Point | null = null;

  constructor(options: { point?: Point; id?: string } = {}) {
    this.id = options.id ?? `cursor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this._position = options.point?.clone() ?? new Point(0, 0);
  }

  /**
   * Get the current cursor position
   */
  get position(): Point {
    return this._position.clone();
  }

  /**
   * Get the selection start position (if selecting)
   */
  get selectionStart(): Point | null {
    return this._selectionStart?.clone() ?? null;
  }

  /**
   * Check if there's an active selection
   */
  get hasSelection(): boolean {
    return this._selectionStart !== null && !this._position.equals(this._selectionStart);
  }

  /**
   * Move cursor to a specific position
   */
  moveTo(line: number, column: number, select: boolean = false): void {
    const newPosition = new Point(line, column);
    
    if (select) {
      if (!this._selectionStart) {
        this._selectionStart = this._position.clone();
      }
    } else {
      this._selectionStart = null;
    }

    this._position = newPosition;
    this._notifyChange();
  }

  /**
   * Move cursor up
   */
  moveUp(lines: number = 1, select: boolean = false): void {
    const newLine = Math.max(0, this._position.line - lines);
    this.moveTo(newLine, this._position.column, select);
  }

  /**
   * Move cursor down
   */
  moveDown(lines: number = 1, select: boolean = false): void {
    // Get max line from editor state if available
    const maxLine = editorState.document?.lines?.length 
      ? editorState.document.lines.length - 1 
      : this._position.line + lines;
    
    const newLine = Math.min(maxLine, this._position.line + lines);
    this.moveTo(newLine, this._position.column, select);
  }

  /**
   * Move cursor left
   */
  moveLeft(columns: number = 1, select: boolean = false): void {
    if (this._position.column > 0) {
      const newColumn = Math.max(0, this._position.column - columns);
      this.moveTo(this._position.line, newColumn, select);
    } else if (this._position.line > 0) {
      // Move to end of previous line
      const prevLineLength = this._getLineLength(this._position.line - 1);
      this.moveTo(this._position.line - 1, prevLineLength, select);
    }
  }

  /**
   * Move cursor right
   */
  moveRight(columns: number = 1, select: boolean = false): void {
    const lineLength = this._getLineLength(this._position.line);
    
    if (this._position.column < lineLength) {
      const newColumn = Math.min(lineLength, this._position.column + columns);
      this.moveTo(this._position.line, newColumn, select);
    } else {
      // Move to start of next line
      const maxLine = editorState.document?.lines?.length 
        ? editorState.document.lines.length - 1 
        : this._position.line + 1;
      
      if (this._position.line < maxLine) {
        this.moveTo(this._position.line + 1, 0, select);
      }
    }
  }

  /**
   * Move to start of line
   */
  moveToStartOfLine(select: boolean = false): void {
    this.moveTo(this._position.line, 0, select);
  }

  /**
   * Move to end of line
   */
  moveToEndOfLine(select: boolean = false): void {
    const lineLength = this._getLineLength(this._position.line);
    this.moveTo(this._position.line, lineLength, select);
  }

  /**
   * Get the length of a line (helper method)
   */
  private _getLineLength(line: number): number {
    if (editorState.document?.lines?.[line]) {
      return editorState.document.lines[line].length;
    }
    // Fallback: assume reasonable line length
    return 80;
  }

  /**
   * Notify that cursor position changed
   */
  private _notifyChange(): void {
    // Trigger any update callbacks
    if ((this as any).__updatePosition) {
      (this as any).__updatePosition();
    }
  }
}

