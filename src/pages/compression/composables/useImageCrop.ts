import { ref } from 'vue'
import Cropper from 'cropperjs'
import type { CropData } from '../types/image'

export function useImageCrop() {
  const cropper = ref<Cropper | null>(null)
  const isCropping = ref(false)

  const initCropper = (imageElement: HTMLImageElement, options?: Cropper.Options) => {
    cropper.value = new Cropper(imageElement, {
      viewMode: 1,
      autoCropArea: 0.8,
      responsive: true,
      zoomable: false,
      ...options
    })
    isCropping.value = true
    return cropper.value
  }

  const getCropData = (): CropData | null => {
    if (!cropper.value) return null
    const data = cropper.value.getData()
    return {
      x: data.x,
      y: data.y,
      width: data.width,
      height: data.height
    }
  }

  const setAspectRatio = (ratio: number) => {
    cropper.value?.setAspectRatio(ratio)
  }

  const rotate = (degree: number) => {
    cropper.value?.rotate(degree)
  }

  const getCroppedFile = async (originalFile: File, outputFormat?: string): Promise<File> => {
    return new Promise((resolve, reject) => {
      if (!cropper.value) {
        reject(new Error('Cropper not initialized'))
        return
      }

      cropper.value.getCroppedCanvas().toBlob(async (blob) => {
        if (!blob) {
          reject(new Error('Failed to crop image'))
          return
        }

        const ext = outputFormat || originalFile.name.split('.').pop() || 'jpeg'
        const mimeType = `image/${ext === 'jpg' ? 'jpeg' : ext}`
        const fileName = originalFile.name.replace(/\.[^.]+$/, '_cropped.' + ext)

        const file = new File([blob], fileName, { type: mimeType })
        resolve(file)
      }, mimeType)
    })
  }

  const destroy = () => {
    if (cropper.value) {
      cropper.value.destroy()
      cropper.value = null
    }
    isCropping.value = false
  }

  return {
    cropper,
    isCropping,
    initCropper,
    getCropData,
    setAspectRatio,
    rotate,
    getCroppedFile,
    destroy
  }
}