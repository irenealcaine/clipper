import { useRef } from "react"
import useFileDrop from "../hooks/useFileDrop"
import "./AudioUploader.css"

export default function AudioUploader({ onFileSelected }) {
  const inputRef = useRef(null)
  const { isDragging, dropProps } = useFileDrop(onFileSelected)

  return (
    <section
      className={`audio-uploader${isDragging ? " audio-uploader--dragging" : ""}`}
      {...dropProps}
    >
      <h2>Sube tu audio</h2>
      <p>Arrastra un archivo aquí o selecciónalo desde tu dispositivo.</p>

      <button
        type="button"
        className="audio-uploader__button"
        onClick={() => inputRef.current?.click()}
      >
        Seleccionar audio
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        hidden
        onChange={(event) => {
          const file = event.target.files[0]
          if (file) onFileSelected(file)
        }}
      />
    </section>
  )
}
