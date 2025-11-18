/**
 * Point represents a position in the editor (line and column)
 */
export class Point {
  public line: number;
  public column: number;

  constructor(line: number = 0, column: number = 0) {
    this.line = line;
    this.column = column;
  }

  /**
   * Create a Point from an object
   */
  static from({ line, column }: { line: number; column: number }): Point {
    return new Point(line, column);
  }

  /**
   * Check if two points are equal
   */
  equals(other: Point): boolean {
    return this.line === other.line && this.column === other.column;
  }

  /**
   * Compare two points (returns -1 if this < other, 0 if equal, 1 if this > other)
   */
  compare(other: Point): number {
    if (this.line < other.line) return -1;
    if (this.line > other.line) return 1;
    if (this.column < other.column) return -1;
    if (this.column > other.column) return 1;
    return 0;
  }

  /**
   * Clone this point
   */
  clone(): Point {
    return new Point(this.line, this.column);
  }

  /**
   * Convert to string representation
   */
  toString(): string {
    return `Point(${this.line}, ${this.column})`;
  }
}

