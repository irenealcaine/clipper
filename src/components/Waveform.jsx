import { useEffect, useRef } from "react"
import "./Waveform.css"

export default function Waveform({ peaks, className, maxBars = 1400 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const draw = () => {
      const { clientWidth: width, clientHeight: height } = canvas
      const ratio = window.devicePixelRatio || 1

      canvas.width = Math.max(1, width * ratio)
      canvas.height = Math.max(1, height * ratio)

      const context = canvas.getContext("2d")
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      context.clearRect(0, 0, width, height)

      if (!peaks?.length || !width || !height) return

      const barCount = Math.min(peaks.length, maxBars)
      const groupSize = peaks.length / barCount
      const middle = height / 2
      const barWidth = width / barCount
      context.fillStyle = getComputedStyle(canvas).color

      for (let index = 0; index < barCount; index += 1) {
        const from = Math.floor(index * groupSize)
        const to = Math.max(from + 1, Math.floor((index + 1) * groupSize))
        let peak = 0

        for (let i = from; i < to; i += 1) {
          if (peaks[i] > peak) peak = peaks[i]
        }

        const amplitude = Math.max(peak * (middle - 1), 1)
        context.fillRect(
          index * barWidth,
          middle - amplitude,
          Math.max(barWidth - 0.5, 0.5),
          amplitude * 2
        )
      }
    }

    draw()

    const observer = new ResizeObserver(draw)
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [peaks, maxBars])

  return (
    <canvas
      ref={canvasRef}
      className={`waveform${className ? ` ${className}` : ""}`}
      aria-hidden="true"
    />
  )
}
