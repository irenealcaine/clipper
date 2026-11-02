import "./ClipResult.css"

export default function ClipResult({ resultUrl, onReset }) {
  return (
    <section className="clip-result">
      <h2>Tu clip está listo</h2>

      <video src={resultUrl} controls playsInline />

      <div className="clip-result__actions">
        <a className="clip-result__download" href={resultUrl} download="clip.mp4">
          Descargar clip
        </a>
        <button type="button" onClick={onReset}>
          Cortar otro video
        </button>
      </div>
    </section>
  )
}
