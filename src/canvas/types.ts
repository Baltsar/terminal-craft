/** Shared TUI canvas data model – used by both Classic and Canvas 2.0 */

export type DropItemType =
  | 'confirm'
  | 'text'
  | 'panel'
  | 'frame'
  | 'button'
  | 'spinner'
  | 'progress'
  | 'agentic-feed'
  | 'multi-agent'
  | 'glyph'

export type DropItem = {
  type: DropItemType
  id: string
  label?: string
  glyphId?: string
  textContent?: string
  panelContent?: string
  frameTitle?: string
  confirmPrompt?: string
  buttonLabel?: string
  glyphLabel?: string
  speedMs?: number
}

export type PaletteDragItem = { type: string; label: string; glyphId?: string }

/** Hermes terminal – max 5 blocks (default initial state) */
export const INITIAL_DROPPED: DropItem[] = [
  { type: 'text', id: 'init-1', label: 'Text', textContent: 'Hermes' },
  { type: 'glyph', id: 'init-2', label: 'Hermes thinking', glyphId: 'hermes-thinking', glyphLabel: 'Thinking…', speedMs: 200 },
  { type: 'agentic-feed', id: 'init-3', label: 'Agentic Feed' },
  { type: 'glyph', id: 'init-4', label: 'Hermes tool icons', glyphId: 'hermes-tool-icons', glyphLabel: 'Tools', speedMs: 200 },
  { type: 'frame', id: 'init-5', label: 'Frame', frameTitle: '' },
]

/** Create a new DropItem from a palette drag/tap item (same defaults as Classic) */
export function createDropItem(dragItem: PaletteDragItem): DropItem {
  const item: DropItem = {
    type: dragItem.type as DropItemType,
    id: crypto.randomUUID(),
    label: dragItem.label,
    glyphId: dragItem.glyphId,
  }
  if (dragItem.type === 'text') item.textContent = 'Sample text'
  if (dragItem.type === 'panel') item.panelContent = 'Content'
  if (dragItem.type === 'frame') item.frameTitle = ''
  if (dragItem.type === 'confirm') item.confirmPrompt = 'Continue?'
  if (dragItem.type === 'button') item.buttonLabel = 'Button'
  if (dragItem.type === 'spinner') {
    item.speedMs = 200
    item.glyphLabel = 'Working…'
  }
  if (dragItem.type === 'glyph' && dragItem.label) item.glyphLabel = dragItem.label
  if (dragItem.type === 'glyph') item.speedMs = 200
  return item
}
