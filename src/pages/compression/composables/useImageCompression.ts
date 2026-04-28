import { ref } from 'vue'
import imageCompression from 'browser-image-compression'
import type { ImageFile, CompressionSettings } from '../types/image'

export function useImageCompression() {
  const isCompressing = ref(false)

const compressImage = async (
  imageFile: ImageFile,
  settings: CompressionSettings,
  onProgress?: (progress: number) => void
): Promise<File> => {
  const sourceFile = imageFile.croppedFile || imageFile.file

  const options = {
    maxSizeMB: 10,
    maxWidthOrHeight: settings.maxWidthOrHeight,
    useWebWorker: true,
    initialQuality: settings.quality,
    fileType: `image/${settings.outputFormat}`,
    onProgress
  }

  return await imageCompression(sourceFile, options)
}

  const compressBatch = async (
    images: ImageFile[],
    settings: CompressionSettings,
    onProgress: (id: string, progress: number) => void,
    onComplete: (id: string, file: File) => void,
    onError: (id: string, error: Error) => void
  ): Promise<void> => {
    isCompressing.value = true

    const promises = images.map(async (img) => {
      try {
        img.status = 'compressing'
        const compressedFile = await compressImage(img, settings, (p) => {
          img.progress = p
          onProgress(img.id, p)
        })
        img.status = 'completed'
        onComplete(img.id, compressedFile)
      } catch (error) {
        img.status = 'error'
        onError(img.id, error as Error)
      }
    })

    await Promise.all(promises)
    isCompressing.value = false
  }

  return {
    isCompressing,
    compressImage,
    compressBatch
  }
}