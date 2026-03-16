import { useEffect, useRef } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'

interface TerminalPreviewProps {
  content?: string
  className?: string
  cols?: number
  rows?: number
}

export function TerminalPreview({
  content = '',
  className = '',
  cols = 80,
  rows = 24,
}: TerminalPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const terminalRef = useRef<Terminal | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const term = new Terminal({
      cols,
      rows,
      cursorBlink: true,
      theme: {
        background: '#0a0a0a',
        foreground: '#33ff33',
        cursor: '#33ff33',
      },
      fontFamily: 'IBM Plex Mono, monospace',
      fontSize: 14,
    })
    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    term.open(containerRef.current)
    fitAddon.fit()
    terminalRef.current = term
    if (content) term.writeln(content)
    return () => {
      term.dispose()
      terminalRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!terminalRef.current || content === undefined) return
    terminalRef.current.clear()
    const lines = content.split(/\r?\n/)
    lines.forEach((line) => terminalRef.current?.writeln(line))
  }, [content])

  return <div ref={containerRef} className={className} style={{ width: '100%', height: '100%', minHeight: 360 }} />
}
