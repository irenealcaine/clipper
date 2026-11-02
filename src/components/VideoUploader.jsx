import { useRef } from "react"
import useFileDrop from "../hooks/useFileDrop"
import "./VideoUploader.css"

export default function VideoUploader({ onFileSelected }) {
  const inputRef = useRef(null)
  const { isDragging, dropProps } = useFileDrop(onFileSelected)

  return (
    <section
      className={`video-uploader${isDragging ? " video-uploader--dragging" : ""}`}
      {...dropProps}
    >
      <h2>Sube tu video</h2>
      <p>Arrastra un archivo aquí o selecciónalo desde tu dispositivo.</p>

      <button
        type="button"
        className="video-uploader__button"
        onClick={() => inputRef.current?.click()}
      >
        Seleccionar video
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        hidden
        onChange={(event) => {
          const file = event.target.files[0]
          if (file) onFileSelected(file)
        }}
      />
    </section>
  )
}
