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
    const selection = cropper.value.getCropperSelection()
    if (!selection) return null
    const data = selection.getData()
    return {
      x: data.x,
      y: data.y,
      width: data.width,
      height: data.height
    }
  }

  const setAspectRatio = (ratio: number) => {
    const selection = cropper.value?.getCropperSelection()
    if (selection) {
      selection.aspectRatio = ratio
    }
  }

  const rotate = (degree: number) => {
    const image = cropper.value?.getCropperImage()
    if (image) {
      image.$rotate(`${degree}deg`)
    }
  }

  const getCroppedFile = async (originalFile: File, outputFormat?: string): Promise<File> => {
    const canvas = cropper.value?.getCropperCanvas()
    if (!canvas) {
      throw new Error('Failed to get canvas')
    }

    const canvasEl = await canvas.$toCanvas()
    
    return new Promise((resolve, reject) => {
      const ext = outputFormat || originalFile.name.split('.').pop() || 'jpeg'
      const mimeType = `image/${ext === 'jpg' ? 'jpeg' : ext}`
      const fileName = originalFile.name.replace(/\.[^.]+$/, '_cropped.' + ext)

      canvasEl.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to crop image'))
          return
        }
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