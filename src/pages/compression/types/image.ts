export interface CropData {
  x: number
  y: number
  width: number
  height: number
}

export interface ImageFile {
  id: string
  file: File
  croppedFile?: File
  cropData?: CropData
  name: string
  originalSize: number
  compressedSize: number
  originalUrl: string
  compressedUrl: string | null
  status: 'pending' | 'compressing' | 'completed' | 'error'
  progress: number
}

export interface CompressionSettings {
  quality: number
  maxWidthOrHeight: number
  outputFormat: 'jpeg' | 'png' | 'webp'
  maxFiles: number
}