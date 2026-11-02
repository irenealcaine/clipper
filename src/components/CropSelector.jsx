import { useRef } from "react"
import { TARGET_RATIO } from "../constants"
import "./CropSelector.css"

const KEY_STEP = 0.02

function clamp(value) {
  return Math.min(1, Math.max(0, value))
}

export default function CropSelector({
  videoRef,
  videoUrl,
  width,
  height,
  crop,
  onCropChange,
  onPlay,
  onPause,
  onTimeUpdate,
}) {
  const wrapperRef = useRef(null)
  const frameRef = useRef(null)
  const dragRef = useRef(null)

  const isWide = width / height > TARGET_RATIO
  const frameWidth = isWide ? ((height * TARGET_RATIO) / width) * 100 : 100
  const frameHeight = isWide ? 100 : (width / TARGET_RATIO / height) * 100

  const handlePointerDown = (event) => {
    event.preventDefault()
    frameRef.current.setPointerCapture(event.pointerId)
    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      cropX: crop.x,
      cropY: crop.y,
    }
  }

  const handlePointerMove = (event) => {
    const drag = dragRef.current
    if (!drag) return

    const freeX = wrapperRef.current.clientWidth - frameRef.current.offsetWidth
    const freeY =
      wrapperRef.current.clientHeight - frameRef.current.offsetHeight

    onCropChange({
      x: clamp(
        drag.cropX + (freeX > 0 ? (event.clientX - drag.x) / freeX : 0)
      ),
      y: clamp(
        drag.cropY + (freeY > 0 ? (event.clientY - drag.y) / freeY : 0)
      ),
    })
  }

  const handlePointerUp = (event) => {
    dragRef.current = null
    frameRef.current?.releasePointerCapture(event.pointerId)
  }

  const handleKeyDown = (event) => {
    const moves = {
      ArrowLeft: [-KEY_STEP, 0],
      ArrowRight: [KEY_STEP, 0],
      ArrowUp: [0, -KEY_STEP],
      ArrowDown: [0, KEY_STEP],
    }
    const move = moves[event.key]
    if (!move) return

    event.preventDefault()
    onCropChange({
      x: clamp(crop.x + move[0]),
      y: clamp(crop.y + move[1]),
    })
  }

  return (
    <div
      ref={wrapperRef}
      className="crop-selector"
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <video
        ref={videoRef}
        className="crop-selector__video"
        src={videoUrl}
        playsInline
        onPlay={onPlay}
        onPause={onPause}
        onTimeUpdate={onTimeUpdate}
      />

      <div
        ref={frameRef}
        className="crop-selector__frame"
        tabIndex={0}
        aria-label="Zona de recorte. Usa las flechas para moverla."
        style={{
          width: `${frameWidth}%`,
          height: `${frameHeight}%`,
          left: `${crop.x * (100 - frameWidth)}%`,
          top: `${crop.y * (100 - frameHeight)}%`,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
      />
    </div>
  )
}
