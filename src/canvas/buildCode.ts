import type { DropItem } from './types'
import { allGlyphAnimations } from '../data/glyphAnimations'
import { sanitizeForTerminal } from '../utils/sanitizeForTerminal'
import { formatPanelContent, formatFrameTitle } from '../utils/tuiFormat'

export function serializeTUI(items: DropItem[]): string[] {
  const lines: string[] = ['$ termcraft', '> Vad du bygger visas här nedan.']
  items.forEach((item) => {
    if (item.type === 'confirm') lines.push(`${sanitizeForTerminal(item.confirmPrompt ?? 'Continue?')} (J/N)`)
    else if (item.type === 'panel') {
      const content = formatPanelContent(sanitizeForTerminal(item.panelContent ?? 'Content'))
      lines.push('┌─ Panel ─────────────┐', `│ ${content} │`, '└─────────────────────┘')
    } else if (item.type === 'text') lines.push(sanitizeForTerminal(item.textContent ?? 'Sample text'))
    else if (item.type === 'button') lines.push(`[ ${sanitizeForTerminal(item.buttonLabel ?? 'Button')} ]`)
    else if (item.type === 'spinner') lines.push(`| ${sanitizeForTerminal(item.glyphLabel ?? 'Working…')}`)
    else if (item.type === 'progress') lines.push('▰▰▰▰▰▱▱▱▱▱ 50%')
    else if (item.type === 'agentic-feed') lines.push('▸ Thinking…', '▸ Running tool')
    else if (item.type === 'multi-agent') lines.push('Researcher ●', 'Judge ○')
    else if (item.type === 'frame') {
      const title = formatFrameTitle(sanitizeForTerminal(item.frameTitle ?? ''))
      lines.push(`┌─ ${title} ─${'─'.repeat(Math.max(0, 11 - title.length))}┐`, '│                     │', '└─────────────────────┘')
    } else if (item.type === 'glyph' && item.glyphId) {
      const g = allGlyphAnimations.find((x) => x.id === item.glyphId)
      const label = item.glyphLabel ?? g?.name ?? ''
      if (g) lines.push(`${g.chars[0]} ${sanitizeForTerminal(label)}`)
    }
  })
  return lines
}

export function buildCopyCode(items: DropItem[]): string {
  const entries = items.map((item) => {
    const base: Record<string, unknown> = { type: item.type, id: item.id }
    if (item.textContent != null) base.textContent = sanitizeForTerminal(item.textContent)
    if (item.panelContent != null) base.panelContent = sanitizeForTerminal(item.panelContent)
    if (item.frameTitle != null) base.frameTitle = sanitizeForTerminal(item.frameTitle)
    if (item.confirmPrompt != null) base.confirmPrompt = sanitizeForTerminal(item.confirmPrompt)
    if (item.buttonLabel != null) base.buttonLabel = sanitizeForTerminal(item.buttonLabel)
    if (item.glyphLabel != null) base.glyphLabel = sanitizeForTerminal(item.glyphLabel)
    if (item.glyphId != null) base.glyphId = item.glyphId
    if (item.speedMs != null) base.speedMs = item.speedMs
    if ((item.type === 'glyph' || item.type === 'spinner') && item.glyphId) {
      const g = allGlyphAnimations.find((x) => x.id === item.glyphId)
      if (g) base.chars = g.chars
    }
    if (item.type === 'spinner' && !item.glyphId) base.chars = ['|', '/', '-', '\\']
    return JSON.stringify(base)
  })
  return `// TERMCRAFT build – kopiera och anpassa\nconst build = [\n${entries.map((e) => '  ' + e).join(',\n')}\n];`
}
