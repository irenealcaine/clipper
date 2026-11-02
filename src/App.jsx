import { useRef, useState } from "react"
import { FaArrowLeft } from "react-icons/fa6"
import AudioEditor from "./components/AudioEditor"
import AudioUploader from "./components/AudioUploader"
import ClipEditor from "./components/ClipEditor"
import ClipResult from "./components/ClipResult"
import Footer from "./components/Footer"
import VideoUploader from "./components/VideoUploader"
import { CLIP_DURATION } from "./constants"
import { cutVideo } from "./services/clipperApi"
import { readMediaMetadata } from "./utils/mediaMetadata"
import "./App.css"

export default function App() {
  const resetIdRef = useRef(0)
  const [media, setMedia] = useState(null)
  const [start, setStart] = useState(0)
  const [crop, setCrop] = useState({ x: 0.5, y: 0.5 })
  const [resultUrl, setResultUrl] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState("")

  const handleFileSelected = async (file, kind) => {
    setError("")

    try {
      const metadata = await readMediaMetadata(file, kind)

      if (metadata.duration < CLIP_DURATION) {
        URL.revokeObjectURL(metadata.url)
        setError(
          kind === "audio"
            ? "El audio debe durar al menos 10 segundos"
            : "El video debe durar al menos 10 segundos"
        )
        return
      }

      if (media) URL.revokeObjectURL(media.url)
      setMedia({ file, kind, ...metadata })
      setStart(0)
      setCrop({ x: 0.5, y: 0.5 })
    } catch (err) {
      setError(err.message)
    }
  }

  const handleCut = async () => {
    setIsProcessing(true)
    setError("")
    const runId = resetIdRef.current

    try {
      const blob = await cutVideo({
        file: media.file,
        start,
        cropX: crop.x,
        cropY: crop.y,
      })

      if (runId !== resetIdRef.current) return
      setResultUrl(URL.createObjectURL(blob))
    } catch (err) {
      if (runId === resetIdRef.current) setError(err.message)
    } finally {
      if (runId === resetIdRef.current) setIsProcessing(false)
    }
  }

  const handleReset = () => {
    resetIdRef.current += 1
    if (media) URL.revokeObjectURL(media.url)
    if (resultUrl) URL.revokeObjectURL(resultUrl)
    setMedia(null)
    setResultUrl(null)
    setIsProcessing(false)
    setStart(0)
    setCrop({ x: 0.5, y: 0.5 })
    setError("")
  }

  return (
    <div className="app">
      <header className="app__header">
        <img src="/clipper.svg" alt="" />
        <h1>Clipper</h1>
      </header>

      <main className="app__main">
        {error && (
          <p className="app__error" role="alert">
            {error}
          </p>
        )}

        {resultUrl ? (
          <ClipResult resultUrl={resultUrl} onReset={handleReset} />
        ) : media ? (
          <>
            <button
              type="button"
              className="app__back"
              onClick={handleReset}
              aria-label="Volver al inicio"
              title="Volver al inicio"
            >
              <FaArrowLeft />
            </button>

            {media.kind === "audio" ? (
              <AudioEditor media={media} />
            ) : (
              <ClipEditor
                media={media}
                start={start}
                crop={crop}
                isProcessing={isProcessing}
                onStartChange={setStart}
                onCropChange={setCrop}
                onCut={handleCut}
              />
            )}
          </>
        ) : (
          <div className="app__uploaders">
            <VideoUploader
              onFileSelected={(file) => handleFileSelected(file, "video")}
            />
            <AudioUploader
              onFileSelected={(file) => handleFileSelected(file, "audio")}
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
