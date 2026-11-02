const BUCKETS_PER_SECOND = 120

export async function readAudioPeaks(file, duration) {
  const context = new (window.AudioContext || window.webkitAudioContext)()

  try {
    const buffer = await context.decodeAudioData(await file.arrayBuffer())
    const channels = Array.from({ length: buffer.numberOfChannels }, (_, index) =>
      buffer.getChannelData(index)
    )
    const bucketCount = Math.max(1, Math.ceil(duration * BUCKETS_PER_SECOND))
    const blockSize = Math.max(1, Math.floor(buffer.length / bucketCount))
    const stride = Math.max(1, Math.floor(buffer.length / 2000000))
    const peaks = []
    let max = 0

    for (let i = 0; i < bucketCount; i += 1) {
      const start = i * blockSize
      const end = Math.min(start + blockSize, buffer.length)
      let peak = 0

      for (let j = start; j < end; j += stride) {
        for (const channel of channels) {
          const value = Math.abs(channel[j])
          if (value > peak) peak = value
        }
      }

      peaks.push(peak)
      if (peak > max) max = peak
    }

    return max > 0 ? peaks.map((peak) => peak / max) : peaks
  } finally {
    context.close()
  }
}

export function slicePeaks(peaks, start, end, duration) {
  if (!peaks?.length || !duration) return null

  const bucketsPerSecond = peaks.length / duration
  const from = Math.max(0, Math.floor(start * bucketsPerSecond))
  const to = Math.min(peaks.length, Math.ceil(end * bucketsPerSecond))
  return peaks.slice(from, to)
}
