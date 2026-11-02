import { useState } from "react"

export default function useFileDrop(onFileSelected) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files[0]
    if (file) onFileSelected(file)
  }

  return {
    isDragging,
    dropProps: {
      onDragOver: (event) => {
        event.preventDefault()
        setIsDragging(true)
      },
      onDragLeave: () => setIsDragging(false),
      onDrop: handleDrop,
    },
  }
}
