/**
 * Sanitize a string so it is safe to paste into a terminal:
 * strip ANSI escape sequences, C0/C1 control characters,
 * and zero-width / bidirectional override characters that could hide commands.
 */
const ANSI_ESCAPE =
  /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g
const C0_CONTROL = /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g
const C1_CONTROL = /[\u0080-\u009f]/g
const ZERO_WIDTH_AND_OVERRIDE =
  /[\u200b-\u200d\u2060\ufeff\u202a-\u202e]/g

export function sanitizeForTerminal(str: string): string {
  if (typeof str !== 'string') return ''
  return str
    .replace(ANSI_ESCAPE, '')
    .replace(C0_CONTROL, '')
    .replace(C1_CONTROL, '')
    .replace(ZERO_WIDTH_AND_OVERRIDE, '')
}
