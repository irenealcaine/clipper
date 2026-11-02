import { useMemo } from "react"
import Waveform from "./Waveform"
import { CLIP_DURATION } from "../constants"
import { slicePeaks } from "../utils/audioPeaks"
import { formatTime } from "../utils/formatTime"
import "./FragmentRow.css"

export default function FragmentRow({
  index,
  fragment,
  peaks,
  duration,
  isActive,
  isPlaying,
  isSaving,
  error,
  onPlay,
  onSave,
}) {
  const wave = useMemo(
    () =>
      slicePeaks(peaks, fragment.start, fragment.start + CLIP_DURATION, duration),
    [peaks, fragment.start, duration]
  )

  return (
    <section
      className={`fragment-row${isActive ? " fragment-row--active" : ""}`}
    >
      <h3>Fragmento {index + 1}</h3>

      <div className="fragment-row__wave">
        <Waveform peaks={wave} className="fragment-row__wave-canvas" />
      </div>

      <div className="fragment-row__labels">
        <span>Inicio {formatTime(fragment.start)}</span>
        <span>Fin {formatTime(fragment.start + CLIP_DURATION)}</span>
      </div>

      <div className="fragment-row__actions">
        <button type="button" className="fragment-row__play" onClick={onPlay}>
          {isPlaying ? "Pausar" : "Reproducir"}
        </button>
        <button
          type="button"
          className="fragment-row__save"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? "Guardando..." : "Guardar fragmento"}
        </button>
      </div>

      {error && (
        <p className="fragment-row__error" role="alert">
          {error}
        </p>
      )}
    </section>
  )
}
