import { useRef } from "react"
import Waveform from "./Waveform"
import { CLIP_DURATION } from "../constants"
import { formatTime } from "../utils/formatTime"
import "./SegmentSelector.css"

const KEY_STEP = 0.1

function clamp(value, max) {
  return Math.round(Math.min(max, Math.max(0, value)) * 10) / 10
}

export default function SegmentSelector({ duration, start, onStartChange, peaks }) {
  const trackRef = useRef(null)
  const windowRef = useRef(null)
  const dragRef = useRef(null)
  const max = Math.max(0, duration - CLIP_DURATION)

  const handlePointerDown = (event) => {
    event.preventDefault()
    windowRef.current.setPointerCapture(event.pointerId)
    dragRef.current = { x: event.clientX, start }
  }

  const handlePointerMove = (event) => {
    const drag = dragRef.current
    if (!drag) return

    const delta = ((event.clientX - drag.x) / trackRef.current.clientWidth) * duration
    onStartChange(clamp(drag.start + delta, max))
  }

  const handlePointerUp = (event) => {
    dragRef.current = null
    windowRef.current?.releasePointerCapture(event.pointerId)
  }

  const handleKeyDown = (event) => {
    const moves = {
      ArrowLeft: start - KEY_STEP,
      ArrowRight: start + KEY_STEP,
      Home: 0,
      End: max,
    }
    const next = moves[event.key]
    if (next === undefined) return

    event.preventDefault()
    onStartChange(clamp(next, max))
  }

  return (
    <div className="segment-selector">
      <div className="segment-selector__labels">
        <span>Inicio {formatTime(start)}</span>
        <span>Fin {formatTime(start + CLIP_DURATION)}</span>
      </div>

      <div
        ref={trackRef}
        className={`segment-selector__track${
          peaks ? " segment-selector__track--wave" : ""
        }`}
      >
        {peaks && <Waveform peaks={peaks} className="segment-selector__wave" />}
        <div
          ref={windowRef}
          className="segment-selector__window"
          role="slider"
          tabIndex={0}
          aria-label="Inicio del clip"
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={start}
          aria-valuetext={`Inicio ${formatTime(start)}`}
          style={{
            left: `${(start / duration) * 100}%`,
            width: `${(CLIP_DURATION / duration) * 100}%`,
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  )
}
