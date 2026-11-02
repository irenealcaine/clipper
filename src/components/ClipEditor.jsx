import { useRef, useState } from "react"
import CropSelector from "./CropSelector"
import SegmentSelector from "./SegmentSelector"
import { CLIP_DURATION } from "../constants"
import { formatTime } from "../utils/formatTime"
import "./ClipEditor.css"

export default function ClipEditor({
  media,
  start,
  crop,
  isProcessing,
  onStartChange,
  onCropChange,
  onCut,
}) {
  const playerRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)

  const handleStartChange = (value) => {
    onStartChange(value)
    if (playerRef.current) playerRef.current.currentTime = value
    setCurrentTime(value)
  }

  const togglePlayback = () => {
    const player = playerRef.current
    if (!player) return

    if (player.paused) {
      if (player.currentTime < start || player.currentTime >= start + CLIP_DURATION) {
        player.currentTime = start
      }
      player.play()
    } else {
      player.pause()
    }
  }

  const handleTimeUpdate = (event) => {
    const player = event.currentTarget

    if (!player.paused && player.currentTime >= start + CLIP_DURATION) {
      player.currentTime = start + CLIP_DURATION
      player.pause()
    }

    setCurrentTime(player.currentTime)
  }

  return (
    <section className="clip-editor">
      <CropSelector
        videoRef={playerRef}
        videoUrl={media.url}
        width={media.width}
        height={media.height}
        crop={crop}
        onCropChange={onCropChange}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
      />

      <div className="clip-editor__playback">
        <button type="button" onClick={togglePlayback}>
          {isPlaying ? "Pausar" : "Reproducir"}
        </button>
        <span>
          {formatTime(currentTime)} / {formatTime(media.duration)}
        </span>
      </div>

      <p className="clip-editor__hint">
        Arrastra el marco para elegir la zona que se verá en vertical.
      </p>

      <SegmentSelector
        duration={media.duration}
        start={start}
        onStartChange={handleStartChange}
      />

      <p className="clip-editor__hint">
        Arrastra la ventana de la línea de tiempo para elegir el tramo: se
        recortarán {CLIP_DURATION} segundos desde ese punto.
      </p>

      <button
        type="button"
        className="clip-editor__cut"
        onClick={onCut}
        disabled={isProcessing}
      >
        {isProcessing ? "Cortando..." : "Cortar video"}
      </button>
    </section>
  )
}
