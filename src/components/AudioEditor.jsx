import { useEffect, useRef, useState } from "react"
import AudioWaveform from "./AudioWaveform"
import FragmentRow from "./FragmentRow"
import { CLIP_DURATION } from "../constants"
import { cutAudio } from "../services/clipperApi"
import { readAudioPeaks } from "../utils/audioPeaks"
import { formatTime } from "../utils/formatTime"
import "./AudioEditor.css"

const MAX_FRAGMENTS = 20

export default function AudioEditor({ media }) {
  const playerRef = useRef(null)
  const nextId = useRef(2)
  const [peaks, setPeaks] = useState(null)
  const [waveformState, setWaveformState] = useState("loading")
  const [fragments, setFragments] = useState([{ id: 1, start: 0 }])
  const [activeId, setActiveId] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [savingId, setSavingId] = useState(null)
  const [error, setError] = useState({ id: null, message: "" })

  const maxStart = Math.max(0, media.duration - CLIP_DURATION)
  const activeStart = fragments.find((item) => item.id === activeId)?.start ?? 0

  useEffect(() => {
    let cancelled = false

    readAudioPeaks(media.file, media.duration).then(
      (result) => {
        if (cancelled) return
        setPeaks(result)
        setWaveformState("ready")
      },
      () => {
        if (cancelled) return
        setWaveformState("error")
      }
    )

    return () => {
      cancelled = true
    }
  }, [media.file, media.duration])

  const setFragmentCount = (nextCount) => {
    const next = Math.max(1, Math.min(MAX_FRAGMENTS, nextCount))
    let updated = fragments

    if (next < fragments.length) {
      updated = fragments.slice(0, next)
    } else if (next > fragments.length) {
      updated = [...fragments]

      while (updated.length < next) {
        const last = updated[updated.length - 1]
        const id = nextId.current
        nextId.current += 1
        updated.push({
          id,
          start: Math.min(maxStart, (last ? last.start : 0) + CLIP_DURATION),
        })
      }
    }

    setFragments(updated)

    if (!updated.some((fragment) => fragment.id === activeId)) {
      playerRef.current?.pause()
      setActiveId(updated[0].id)
    }
  }

  const handleFragmentMove = (id, value) => {
    setActiveId(id)
    setFragments((current) =>
      current.map((fragment) =>
        fragment.id === id ? { ...fragment, start: value } : fragment
      )
    )
    if (playerRef.current) playerRef.current.currentTime = value
    setCurrentTime(value)
  }

  const togglePlayback = (id) => {
    const player = playerRef.current
    const fragment = fragments.find((item) => item.id === id)
    if (!player || !fragment) return

    if (isPlaying && activeId === id) {
      player.pause()
      return
    }

    setActiveId(id)

    if (
      player.currentTime < fragment.start ||
      player.currentTime >= fragment.start + CLIP_DURATION
    ) {
      player.currentTime = fragment.start
    }

    player.play()
  }

  const handleTimeUpdate = (event) => {
    const player = event.currentTarget

    if (!player.paused && player.currentTime >= activeStart + CLIP_DURATION) {
      player.currentTime = activeStart + CLIP_DURATION
      player.pause()
    }

    setCurrentTime(player.currentTime)
  }

  const saveFragment = async (fragment, index) => {
    setSavingId(fragment.id)
    setError({ id: null, message: "" })

    try {
      const blob = await cutAudio({ file: media.file, start: fragment.start })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `clip-${index + 1}.mp3`
      document.body.appendChild(link)
      link.click()
      link.remove()
      setTimeout(() => URL.revokeObjectURL(url), 10000)
    } catch (err) {
      setError({ id: fragment.id, message: err.message })
    } finally {
      setSavingId(null)
    }
  }

  return (
    <section className="audio-editor">
      <audio
        ref={playerRef}
        className="audio-editor__player"
        src={media.url}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
      />

      <div className="audio-editor__info">
        <p className="audio-editor__name">{media.file.name}</p>
        <p className="audio-editor__time">
          {formatTime(currentTime)} / {formatTime(media.duration)}
        </p>
      </div>

      <div className="audio-editor__wave">
        <AudioWaveform
          peaks={peaks}
          duration={media.duration}
          fragments={fragments}
          activeId={activeId}
          currentTime={currentTime}
          onActivate={setActiveId}
          onFragmentMove={handleFragmentMove}
        />
        {waveformState !== "ready" && (
          <p className="audio-editor__wave-note">
            {waveformState === "loading"
              ? "Generando waveform..."
              : "No se pudo generar la waveform. Elige el tramo escuchando la previsualización."}
          </p>
        )}
      </div>

      <p className="audio-editor__hint">
        Arrastra cada fragmento sobre la waveform de la canción para colocarlo
        (o usa las flechas del teclado). Cada uno dura {CLIP_DURATION} segundos
        y muestra su propia waveform. Pulsa Guardar fragmento para descargarlo.
      </p>

      <div className="audio-editor__count">
        <span className="audio-editor__count-label">Fragmentos</span>
        <div className="audio-editor__stepper">
          <button
            type="button"
            aria-label="Un fragmento menos"
            onClick={() => setFragmentCount(fragments.length - 1)}
            disabled={fragments.length <= 1}
          >
            −
          </button>
          <span className="audio-editor__count-value">{fragments.length}</span>
          <button
            type="button"
            aria-label="Un fragmento más"
            onClick={() => setFragmentCount(fragments.length + 1)}
            disabled={fragments.length >= MAX_FRAGMENTS}
          >
            +
          </button>
        </div>
      </div>

      <div className="audio-editor__fragments">
        {fragments.map((fragment, index) => (
          <FragmentRow
            key={fragment.id}
            index={index}
            fragment={fragment}
            peaks={peaks}
            duration={media.duration}
            isActive={fragment.id === activeId}
            isPlaying={isPlaying && fragment.id === activeId}
            isSaving={savingId === fragment.id}
            error={error.id === fragment.id ? error.message : ""}
            onPlay={() => togglePlayback(fragment.id)}
            onSave={() => saveFragment(fragment, index)}
          />
        ))}
      </div>
    </section>
  )
}
