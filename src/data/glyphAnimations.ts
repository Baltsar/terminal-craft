/**
 * Glyph Animations catalog – Spinners & Throbbers, ASCII, Unicode,
 * Hermes kawaii thinking faces, Progress, Agentic Activity Feeds.
 * Industry terms only (no "loading glyphs").
 */

export type GlyphCategory =
  | 'spinners-throbbers'
  | 'ascii'
  | 'unicode'
  | 'hermes-kawaii'
  | 'hermes-cli'
  | 'progress'
  | 'agentic-feed'

export interface GlyphAnimation {
  id: string
  name: string
  category: GlyphCategory
  chars: string[]
  description?: string
}

/** Spinners & Throbbers – classic character-cycling indicators */
export const spinnersThrobbers: GlyphAnimation[] = [
  { id: 'braille', name: 'braille', category: 'spinners-throbbers', chars: ['\u280B','\u2819','\u2839','\u2838','\u283C','\u2834','\u2826','\u2827','\u2807','\u280F'] },
  { id: 'dots', name: 'dots', category: 'spinners-throbbers', chars: ['\u28FE','\u28FD','\u28FB','\u28BF','\u287F','\u28DF','\u28AF','\u28B7'] },
  { id: 'arrows', name: 'arrows', category: 'spinners-throbbers', chars: ['\u2191','\u2197','\u2192','\u2198','\u2193','\u2199','\u2190','\u2196'] },
  { id: 'moon', name: 'moon', category: 'spinners-throbbers', chars: ['\u25D0','\u25D3','\u25D1','\u25D2'] },
  { id: 'circle', name: 'circle', category: 'spinners-throbbers', chars: ['\u25F4','\u25F7','\u25F6','\u25F5'] },
]

/** ASCII – classic terminal-style */
export const asciiAnimations: GlyphAnimation[] = [
  { id: 'classic', name: 'classic', category: 'ascii', chars: ['|','/','-','\\','|','/','-','\\'] },
  { id: 'binary', name: 'binary', category: 'ascii', chars: ['0','1'] },
  { id: 'hex', name: 'hex', category: 'ascii', chars: ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F'] },
]

/** Unicode – blocks, shapes, symbols */
export const unicodeAnimations: GlyphAnimation[] = [
  { id: 'blocks', name: 'blocks', category: 'unicode', chars: ['\u2596','\u2598','\u259D','\u2597','\u259A','\u259E','\u2588','\u2593','\u2592','\u2591'] },
  { id: 'line', name: 'line', category: 'unicode', chars: ['\u2581','\u2582','\u2583','\u2584','\u2585','\u2586','\u2587','\u2588','\u2587','\u2586','\u2585','\u2584','\u2583','\u2582'] },
  { id: 'grow', name: 'grow', category: 'unicode', chars: ['\u258F','\u258E','\u258D','\u258C','\u258B','\u258A','\u2589','\u2588'] },
  { id: 'quarter', name: 'quarter', category: 'unicode', chars: ['\u25DC','\u25E0','\u25DD','\u25DF','\u25DE','\u25DE','\u25DD','\u25E0'] },
  { id: 'triangle', name: 'triangle', category: 'unicode', chars: ['\u25E2','\u25E3','\u25E4','\u25E5'] },
  { id: 'dice', name: 'dice', category: 'unicode', chars: ['\u2680','\u2681','\u2682','\u2683','\u2684','\u2685'] },
]

/** Hermes kawaii thinking faces – native agentic animations */
export const hermesKawaiiFaces: GlyphAnimation[] = [
  { id: 'hermes-think', name: 'Hermes think', category: 'hermes-kawaii', chars: ['(・_・?)','(・_・;)','(´・ω・`)','(๑•̀ㅂ•́)و'], description: 'Thinking…' },
  { id: 'hermes-aha', name: 'Hermes aha', category: 'hermes-kawaii', chars: ['(⌒▽⌒)','(≧▽≦)','(^_^)','(☆∀☆)'], description: 'Got it!' },
  { id: 'hermes-work', name: 'Hermes work', category: 'hermes-kawaii', chars: ['(´･ω･`)','( ̄︶ ̄)','(・ω・)','(｀・ω・´)'], description: 'Working…' },
]

/** Hermes Agent CLI – thinking phases & tool execution feed (hermes-agent.nousresearch.com) */
export const hermesCliAnimations: GlyphAnimation[] = [
  { id: 'hermes-thinking', name: 'Hermes thinking', category: 'hermes-cli', chars: ['◜', '◠', '✧'], description: 'Pondering → contemplating → got it!' },
  { id: 'hermes-pondering-faces', name: 'Hermes pondering faces', category: 'hermes-cli', chars: ['(｡•́︿•̀｡)', '(⊙_⊙)', '✧٩(ˊᗜˋ*)و✧'], description: 'pondering… contemplating… got it!' },
  { id: 'hermes-tool-icons', name: 'Hermes tool icons', category: 'hermes-cli', chars: ['💻', '🔍', '📄', '📁', '🌐'], description: 'Tool feed: terminal, search, doc, folder, web' },
  { id: 'hermes-feed-pipe', name: 'Hermes feed pipe', category: 'hermes-cli', chars: ['┊'], description: 'Tool execution feed prefix' },
]

/** Progress indicators – bar / percentage style */
export const progressIndicators: GlyphAnimation[] = [
  { id: 'bar-dots', name: 'bar dots', category: 'progress', chars: ['⠁','⠂','⠄','⠈','⠐','⠠','⡀','⢀','⠿'] },
  { id: 'bar-fill', name: 'bar fill', category: 'progress', chars: ['▱▱▱▱▱','▰▱▱▱▱','▰▰▱▱▱','▰▰▰▱▱','▰▰▰▰▱','▰▰▰▰▰'] },
]

/** Agentic Activity Feed – multi-step / tool-call style */
export const agenticFeedAnimations: GlyphAnimation[] = [
  { id: 'agent-step', name: 'agent step', category: 'agentic-feed', chars: ['○','◔','◑','◕','●'], description: 'Step in progress' },
  { id: 'agent-pulse', name: 'agent pulse', category: 'agentic-feed', chars: ['▁','▂','▃','▄','▅','▆','▇','█','▇','▆','▅','▄','▃','▂'] },
]

export const allGlyphAnimations: GlyphAnimation[] = [
  ...spinnersThrobbers,
  ...asciiAnimations,
  ...unicodeAnimations,
  ...hermesKawaiiFaces,
  ...hermesCliAnimations,
  ...progressIndicators,
  ...agenticFeedAnimations,
]

export const categoryLabels: Record<GlyphCategory, string> = {
  'spinners-throbbers': 'Spinners & Throbbers',
  'ascii': 'ASCII',
  'unicode': 'Unicode',
  'hermes-kawaii': 'Hermes kawaii',
  'hermes-cli': 'Hermes Agent CLI',
  'progress': 'Progress Indicators',
  'agentic-feed': 'Agentic Activity Feeds',
}

export const CATEGORY_ORDER: GlyphCategory[] = [
  'spinners-throbbers',
  'ascii',
  'unicode',
  'hermes-kawaii',
  'hermes-cli',
  'progress',
  'agentic-feed',
]
