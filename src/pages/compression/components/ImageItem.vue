<template>
  <div class="image-item" :class="image.status">
    <div class="image-preview">
      <img :src="previewUrl" alt="" />
      <div v-if="image.status === 'compressing'" class="progress-overlay">
        <el-progress type="circle" :percentage="image.progress" :width="60" />
      </div>
      <div v-else-if="image.status === 'error'" class="error-overlay">
        <el-icon><CircleCloseFilled /></el-icon>
        <span>压缩失败</span>
      </div>
      <div v-if="image.status === 'pending'" class="hover-actions">
        <el-button size="small" @click="openCropper">
          <el-icon><Crop /></el-icon>
        </el-button>
        <el-button size="small" type="danger" @click="$emit('remove')">
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>
    </div>
    <div class="image-info">
      <p class="name" :title="image.name">{{ image.name }}</p>
      <p class="sizes">
        <span class="original">{{ formatSize(image.originalSize) }}</span>
        <span v-if="image.compressedSize" class="arrow">→</span>
        <span v-if="image.compressedSize" class="compressed">{{ formatSize(image.compressedSize) }}</span>
      </p>
      <p v-if="image.compressedSize" class="savings">
        <el-icon><Bottom /></el-icon>
        {{ savingsPercent }}%
      </p>
    </div>
    <CropperModal
      v-model="showCropper"
      :image-url="image.originalUrl"
      :image-file="image.file"
      @crop="handleCrop"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { CircleCloseFilled, Bottom, Crop, Delete } from '@element-plus/icons-vue'
import type { ImageFile, CropData } from '@/types/image'
import CropperModal from './CropperModal.vue'

const props = defineProps<{
  image: ImageFile
}>()

defineEmits<{
  (e: 'remove'): void
}>()

const showCropper = ref(false)

const previewUrl = computed(() =>
  props.image.compressedUrl || props.image.originalUrl
)

const savingsPercent = computed(() => {
  if (!props.image.compressedSize) return 0
  return Math.round((1 - props.image.compressedSize / props.image.originalSize) * 100)
})

const formatSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

const openCropper = () => {
  showCropper.value = true
}

const handleCrop = (file: File, cropData: CropData) => {
  props.image.croppedFile = file
  props.image.cropData = cropData
  showCropper.value = false
}
</script>

<style scoped>
.image-item {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(13, 148, 136, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.image-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(13, 148, 136, 0.15);
}

.image-item.completed {
  border: 2px solid #0D9488;
}

.image-preview {
  position: relative;
  width: 100%;
  height: 140px;
  background: linear-gradient(135deg, #F0FDFA 0%, #CCFBF1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-preview img {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  border-radius: 8px;
}

.progress-overlay,
.error-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.error-overlay .el-icon {
  font-size: 28px;
  color: #EF4444;
}

.error-overlay span {
  font-size: 12px;
  color: #EF4444;
}

.hover-actions {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-preview:hover .hover-actions {
  opacity: 1;
}

.image-info {
  padding: 12px;
}

.image-info .name {
  margin: 0;
  font-size: 12px;
  font-weight: 500;
  color: #134E4A;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-info .sizes {
  margin: 6px 0 0;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.image-info .original {
  color: #14B8A6;
}

.image-info .arrow {
  color: #99F6E4;
}

.image-info .compressed {
  color: #0D9488;
  font-weight: 500;
}

.image-info .savings {
  margin: 6px 0 0;
  font-size: 12px;
  color: #0D9488;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.image-info .savings .el-icon {
  font-size: 14px;
}
</style>