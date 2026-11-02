import { useRef } from "react"
import Waveform from "./Waveform"
import { CLIP_DURATION } from "../constants"
import { formatTime } from "../utils/formatTime"
import "./AudioWaveform.css"

const KEY_STEP = 0.1

function clamp(value, max) {
  return Math.round(Math.min(max, Math.max(0, value)) * 10) / 10
}

export default function AudioWaveform({
  peaks,
  duration,
  fragments,
  activeId,
  currentTime,
  onActivate,
  onFragmentMove,
}) {
  const containerRef = useRef(null)
  const dragRef = useRef(null)
  const maxStart = Math.max(0, duration - CLIP_DURATION)

  const handlePointerDown = (event, fragment) => {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = { id: fragment.id, x: event.clientX, start: fragment.start }
    onActivate(fragment.id)
  }

  const handlePointerMove = (event) => {
    const drag = dragRef.current
    if (!drag) return

    const delta =
      ((event.clientX - drag.x) / containerRef.current.clientWidth) * duration
    onFragmentMove(drag.id, clamp(drag.start + delta, maxStart))
  }

  const handlePointerUp = (event) => {
    dragRef.current = null
    event.currentTarget.releasePointerCapture(event.pointerId)
  }

  const handleKeyDown = (event, fragment) => {
    const moves = {
      ArrowLeft: fragment.start - KEY_STEP,
      ArrowRight: fragment.start + KEY_STEP,
      Home: 0,
      End: maxStart,
    }
    const next = moves[event.key]
    if (next === undefined) return

    event.preventDefault()
    onActivate(fragment.id)
    onFragmentMove(fragment.id, clamp(next, maxStart))
  }

  return (
    <div ref={containerRef} className="audio-waveform">
      <Waveform peaks={peaks} className="audio-waveform__wave" />

      {fragments.map((fragment, index) => (
        <div
          key={fragment.id}
          className={`audio-waveform__band${
            fragment.id === activeId ? " audio-waveform__band--active" : ""
          }`}
          role="slider"
          tabIndex={0}
          aria-label={`Fragmento ${index + 1}`}
          aria-valuemin={0}
          aria-valuemax={Math.round(maxStart * 10) / 10}
          aria-valuenow={fragment.start}
          aria-valuetext={`Inicio ${formatTime(fragment.start)}`}
          style={{
            left: `${(fragment.start / duration) * 100}%`,
            width: `${(CLIP_DURATION / duration) * 100}%`,
          }}
          onPointerDown={(event) => handlePointerDown(event, fragment)}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onKeyDown={(event) => handleKeyDown(event, fragment)}
          onFocus={() => onActivate(fragment.id)}
        />
      ))}

      <div
        className="audio-waveform__playhead"
        style={{ left: `${(currentTime / duration) * 100}%` }}
      />
    </div>
  )
}
