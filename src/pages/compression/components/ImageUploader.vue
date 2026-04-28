<template>
  <div
    class="uploader"
    :class="{ 'drag-over': isDragOver }"
    @dragover.prevent="onDragOver"
    @dragleave="onDragLeave"
    @drop.prevent="onDrop"
    @click="openFileDialog"
  >
    <input
      ref="fileInput"
      type="file"
      multiple
      accept="image/*"
      @change="onFileSelect"
      style="display: none"
    />
    <div class="uploader-content">
      <div class="upload-icon">
        <el-icon :size="40"><UploadFilled /></el-icon>
      </div>
      <p class="main-text">拖拽图片到此处，或点击选择</p>
      <p class="hint">支持 JPEG, PNG, WebP, GIF, BMP, TIFF</p>
      <div class="supported-formats">
        <span class="format-badge">JPG</span>
        <span class="format-badge">PNG</span>
        <span class="format-badge">WebP</span>
        <span class="format-badge">GIF</span>
      </div>
    </div>
    <div class="upload-particles">
      <div class="particle"></div>
      <div class="particle"></div>
      <div class="particle"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'
import type { ImageFile } from '../types/image'

const props = defineProps<{
  maxFiles?: number
}>()

const emit = defineEmits<{
  (e: 'files-selected', files: ImageFile[]): void
}>()

const fileInput = ref<HTMLInputElement>()
const isDragOver = ref(false)

const createImageFile = (file: File): ImageFile => ({
  id: crypto.randomUUID(),
  file,
  name: file.name,
  originalSize: file.size,
  compressedSize: 0,
  originalUrl: URL.createObjectURL(file),
  compressedUrl: null,
  status: 'pending',
  progress: 0
})

const handleFiles = (files: FileList | File[]) => {
  const fileArray = Array.from(files)
  const validFiles = fileArray.filter(f => f.type.startsWith('image/'))
  const limitedFiles = validFiles.slice(0, props.maxFiles || 50)
  const imageFiles = limitedFiles.map(createImageFile)
  emit('files-selected', imageFiles)
}

const onDragOver = () => { isDragOver.value = true }
const onDragLeave = () => { isDragOver.value = false }

const onDrop = (e: DragEvent) => {
  isDragOver.value = false
  if (e.dataTransfer?.files) {
    handleFiles(e.dataTransfer.files)
  }
}

const openFileDialog = () => fileInput.value?.click()
const onFileSelect = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (input.files) {
    handleFiles(input.files)
    input.value = ''
  }
}
</script>

<style scoped>
.uploader {
  position: relative;
  border: 2px dashed #0D9488;
  border-radius: 20px;
  padding: 48px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,253,250,0.9) 100%);
  backdrop-filter: blur(10px);
  overflow: hidden;
}

.uploader:hover {
  border-color: #F97316;
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(13, 148, 136, 0.15);
}

.uploader.drag-over {
  border-color: #F97316;
  background: linear-gradient(135deg, rgba(255,247,237,0.95) 0%, rgba(254,215,170,0.95) 100%);
  transform: scale(1.02);
}

.uploader.drag-over .upload-icon {
  transform: scale(1.1);
  background: #F97316;
}

.uploader-content {
  position: relative;
  z-index: 2;
}

.upload-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  background: linear-gradient(135deg, #0D9488 0%, #14B8A6 100%);
  border-radius: 18px;
  color: white;
  margin-bottom: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(13, 148, 136, 0.3);
}

.main-text {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: #134E4A;
}

.hint {
  margin: 0 0 16px;
  font-size: 14px;
  color: #14B8A6;
}

.supported-formats {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.format-badge {
  padding: 4px 12px;
  background: #F0FDFA;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  color: #0D9488;
}

.upload-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.particle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: #0D9488;
  border-radius: 50%;
  opacity: 0.2;
  animation: float 6s ease-in-out infinite;
}

.particle:nth-child(1) {
  left: 10%;
  top: 20%;
  animation-delay: 0s;
}

.particle:nth-child(2) {
  left: 80%;
  top: 60%;
  animation-delay: 2s;
  background: #F97316;
}

.particle:nth-child(3) {
  left: 50%;
  top: 80%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}
</style>