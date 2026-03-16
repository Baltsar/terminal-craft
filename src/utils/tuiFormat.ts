const PANEL_CONTENT_LEN = 19
const FRAME_TITLE_LEN = 12

export function formatPanelContent(s: string): string {
  return String(s ?? 'Content').padEnd(PANEL_CONTENT_LEN).slice(0, PANEL_CONTENT_LEN)
}

export function formatFrameTitle(s: string): string {
  return String(s ?? 'Frame').slice(0, FRAME_TITLE_LEN)
}
