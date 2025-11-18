import { Point } from "./point";
import { settings, elements } from "./editor";

/**
 * Convert a Point to pixel coordinates (x, y)
 */
export function pointToXY(point: Point): { x: number; y: number } {
  // If we have access to the actual DOM, calculate real positions
  if (elements.lines) {
    const lineElement = elements.lines.children[point.line] as HTMLElement;
    if (lineElement) {
      const rect = lineElement.getBoundingClientRect();
      const editorRect = elements.editor?.getBoundingClientRect();
      
      if (editorRect) {
        // Calculate approximate x position based on column
        // This is a simplified calculation - in a real implementation,
        // you'd measure actual character widths
        const charWidth = settings.fontSize * 0.6; // Approximate monospace char width
        const x = point.column * charWidth;
        const y = point.line * settings.lineHeight;
        
        return { x, y };
      }
    }
  }

  // Fallback: use settings-based calculation
  const charWidth = settings.fontSize * 0.6;
  const x = point.column * charWidth;
  const y = point.line * settings.lineHeight;

  return { x, y };
}

/**
 * Convert pixel coordinates to a Point
 */
export function xyToPoint(x: number, y: number): Point {
  const line = Math.floor(y / settings.lineHeight);
  const charWidth = settings.fontSize * 0.6;
  const column = Math.floor(x / charWidth);
  
  return new Point(line, column);
}

