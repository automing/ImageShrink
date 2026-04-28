export interface ImageFile {
  id: string
  file: File
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