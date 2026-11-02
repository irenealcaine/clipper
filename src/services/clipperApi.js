import { API_URL } from "../constants"

async function requestCut(path, formData, errorMessage) {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new Error(data?.detail || errorMessage)
  }

  return response.blob()
}

export async function cutVideo({ file, start, cropX, cropY }) {
  const formData = new FormData()
  formData.append("video", file)
  formData.append("start", start)
  formData.append("crop_x", cropX)
  formData.append("crop_y", cropY)

  return requestCut("/cut", formData, "No se pudo procesar el video")
}

export async function cutAudio({ file, start }) {
  const formData = new FormData()
  formData.append("audio", file)
  formData.append("start", start)

  return requestCut("/cut-audio", formData, "No se pudo procesar el audio")
}
