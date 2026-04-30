import { ref } from 'vue'
import Cropper from 'cropperjs'
import type { CropData } from '@/types/image'

export function useImageCrop() {
  const cropper = ref<Cropper | null>(null)
  const isCropping = ref(false)

  const initCropper = (container: HTMLElement, imageUrl: string) => {
    container.innerHTML = ''

    const img = document.createElement('img')
    img.src = imageUrl
    img.crossOrigin = 'anonymous'
    img.alt = 'Picture'
    container.appendChild(img)

    const CropperClass = (Cropper as any).default || Cropper
    cropper.value = new CropperClass(img, {
      container: container,
      template: `
        <cropper-canvas style="display:block;width:100%;height:100%;">
          <cropper-image rotatable scalable></cropper-image>
          <cropper-shade hidden></cropper-shade>
          <cropper-handle action="select" plain></cropper-handle>
          <cropper-selection movable resizable>
            <cropper-grid role="grid" bordered covered></cropper-grid>
            <cropper-crosshair centered></cropper-crosshair>
            <cropper-handle action="move" theme-color="rgba(255, 255, 255, 0.35)"></cropper-handle>
            <cropper-handle action="n-resize"></cropper-handle>
            <cropper-handle action="e-resize"></cropper-handle>
            <cropper-handle action="s-resize"></cropper-handle>
            <cropper-handle action="w-resize"></cropper-handle>
            <cropper-handle action="ne-resize"></cropper-handle>
            <cropper-handle action="nw-resize"></cropper-handle>
            <cropper-handle action="se-resize"></cropper-handle>
            <cropper-handle action="sw-resize"></cropper-handle>
          </cropper-selection>
        </cropper-canvas>
      `,
    })

    const checkReady = setInterval(() => {
      const canvas = cropper.value?.getCropperCanvas()
      const cropperImg = cropper.value?.getCropperImage()
      if (canvas && cropperImg) {
        clearInterval(checkReady)

        cropperImg.$ready().then(() => {
          requestAnimationFrame(() => {
            const containerRect = container.getBoundingClientRect()
            canvas.style.cssText = `display:block;width:${containerRect.width}px;height:${containerRect.height}px;min-width:0;min-height:0;`

            const sel = cropper.value?.getCropperSelection()
            if (sel && containerRect.width > 0) {
              sel.x = (containerRect.width - 400) / 2
              sel.y = (containerRect.height - 300) / 2
              sel.width = 400
              sel.height = 300
              sel.$render()
            }
          })
        })
      }
    }, 50)

    isCropping.value = true
    return cropper.value
  }

  const getCropData = (): CropData | null => {
    if (!cropper.value) return null
    const sel = cropper.value.getCropperSelection()
    if (!sel) return null
    return {
      x: sel.x,
      y: sel.y,
      width: sel.width,
      height: sel.height
    }
  }

  const setAspectRatio = (ratio: number | NaN) => {
    const sel = cropper.value?.getCropperSelection()
    if (sel) {
      sel.aspectRatio = isNaN(ratio) ? NaN : ratio
      if (!isNaN(ratio)) {
        const container = sel.parentElement
        if (container) {
          const containerRect = container.getBoundingClientRect()
          const targetWidth = 200
          const targetHeight = targetWidth / ratio
          sel.x = (containerRect.width - targetWidth) / 2
          sel.y = (containerRect.height - targetHeight) / 2
          sel.width = targetWidth
          sel.height = targetHeight
        }
      }
      sel.$render()
    }
  }

  const rotate = async (degree: number) => {
    const img = cropper.value?.getCropperImage()
    if (img) {
      await img.$rotate(`${degree}deg`)
    }
  }

  const zoom = async (ratio: number) => {
    const img = cropper.value?.getCropperImage()
    if (img) {
      await img.$zoom(ratio)
    }
  }

  const getCroppedFile = async (originalFile: File, outputFormat?: string): Promise<File> => {
    const selection = cropper.value?.getCropperSelection()
    if (!selection) {
      throw new Error('Failed to get selection')
    }

    const canvasEl = await selection.$toCanvas()

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
    zoom,
    getCroppedFile,
    destroy
  }
}