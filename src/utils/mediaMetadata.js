export function readMediaMetadata(file, kind) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const element = document.createElement(kind === "audio" ? "audio" : "video")
    element.preload = "metadata"

    element.onloadedmetadata = () => {
      const { duration } = element

      if (kind === "video" && (!element.videoWidth || !element.videoHeight)) {
        URL.revokeObjectURL(url)
        reject(new Error("El archivo seleccionado no es un video válido"))
        return
      }

      if (!Number.isFinite(duration) || duration <= 0) {
        URL.revokeObjectURL(url)
        reject(
          new Error(
            kind === "audio"
              ? "No se pudo determinar la duración del audio"
              : "No se pudo determinar la duración del video"
          )
        )
        return
      }

      resolve({
        url,
        width: element.videoWidth,
        height: element.videoHeight,
        duration,
      })
    }

    element.onerror = () => {
      URL.revokeObjectURL(url)
      reject(
        new Error(
          kind === "audio"
            ? "No se pudo leer el audio seleccionado"
            : "No se pudo leer el video seleccionado"
        )
      )
    }

    element.src = url
  })
}
