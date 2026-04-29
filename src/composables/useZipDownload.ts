import { ref } from 'vue'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import type { ImageFile } from '@/types/image'

export function useZipDownload() {
  const isDownloading = ref(false)

  const downloadAsZip = async (images: ImageFile[], onProgress?: (progress: number) => void): Promise<void> => {
    isDownloading.value = true
    const zip = new JSZip()

    const completedImages = images.filter(img => img.status === 'completed' && img.compressedUrl)

    for (let i = 0; i < completedImages.length; i++) {
      const img = completedImages[i]
      if (img.compressedUrl) {
        const response = await fetch(img.compressedUrl)
        const blob = await response.blob()
        const fileName = `compressed_${img.name}`
        zip.file(fileName, blob)
      }
      if (onProgress) {
        onProgress(((i + 1) / completedImages.length) * 100)
      }
    }

    const content = await zip.generateAsync({ type: 'blob' })
    saveAs(content, 'compressed-images.zip')
    isDownloading.value = false
  }

  return {
    isDownloading,
    downloadAsZip
  }
}