import { useEffect, useRef, useState } from 'react'

interface SpinnerGlyphProps {
  chars: string[]
  speed?: number
  className?: string
}

export function SpinnerGlyph({ chars, speed = 200, className = '' }: SpinnerGlyphProps) {
  const [index, setIndex] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % chars.length)
    }, speed)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [chars.length, speed])

  return <span className={className} aria-hidden="true">{chars[index]}</span>
}
