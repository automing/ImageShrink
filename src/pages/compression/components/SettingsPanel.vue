<template>
  <div class="settings-panel">
    <div class="setting-group">
      <div class="setting-header">
        <label>质量</label>
        <span class="setting-value">{{ quality }}%</span>
      </div>
      <el-slider
        v-model="quality"
        :min="10"
        :max="100"
        :step="5"
        :show-tooltip="false"
        class="quality-slider"
      />
    </div>

    <div class="setting-group">
      <div class="setting-header">
        <label>最大尺寸</label>
        <span class="setting-value">{{ maxWidthOrHeight }}px</span>
      </div>
      <el-slider
        v-model="maxWidthOrHeight"
        :min="100"
        :max="10000"
        :step="100"
        :marks="sizeMarks"
        class="size-slider"
      />
    </div>

    <div class="setting-group">
      <div class="setting-header">
        <label>输出格式</label>
      </div>
      <div class="format-options">
        <div
          v-for="fmt in formats"
          :key="fmt.value"
          class="format-option"
          :class="{ active: outputFormat === fmt.value }"
          @click="outputFormat = fmt.value"
        >
          <span class="format-name">{{ fmt.label }}</span>
          <span class="format-ext">.{{ fmt.ext }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import type { CompressionSettings } from '../types/image'

const props = defineProps<{
  modelValue: CompressionSettings
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: CompressionSettings): void
}>()

const quality = computed({
  get: () => Math.round(props.modelValue.quality * 100),
  set: (v) => emit('update:modelValue', { ...props.modelValue, quality: v / 100 })
})

const maxWidthOrHeight = computed({
  get: () => props.modelValue.maxWidthOrHeight,
  set: (v) => emit('update:modelValue', { ...props.modelValue, maxWidthOrHeight: v })
})

const outputFormat = computed({
  get: () => props.modelValue.outputFormat,
  set: (v: FormatType) => emit('update:modelValue', { ...props.modelValue, outputFormat: v })
})

type FormatType = 'jpeg' | 'png' | 'webp'

const formats: { value: FormatType; label: string; ext: string }[] = [
  { value: 'jpeg', label: 'JPEG', ext: 'jpg' },
  { value: 'png', label: 'PNG', ext: 'png' },
  { value: 'webp', label: 'WebP', ext: 'webp' }
]

const sizeMarks = reactive({
  100: '100',
  1920: '1080p',
  4000: '2K',
  8000: '4K'
})
</script>

<style scoped>
.settings-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.setting-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.setting-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.setting-header label {
  font-size: 14px;
  font-weight: 500;
  color: #134E4A;
}

.setting-value {
  font-size: 14px;
  font-weight: 600;
  color: #0D9488;
  background: #F0FDFA;
  padding: 4px 12px;
  border-radius: 8px;
}

:deep(.el-slider) {
  --el-slider-main-bg-color: #CCFBF1;
  --el-slider-runway-bg-color: #F0FDFA;
  --el-slider-button-size: 20px;
}

:deep(.el-slider__button) {
  border: 3px solid #0D9488;
  background: white;
  box-shadow: 0 2px 8px rgba(13, 148, 136, 0.3);
}

:deep(.el-slider__bar) {
  background: linear-gradient(90deg, #0D9488 0%, #14B8A6 100%);
}

:deep(.el-slider__marks-text) {
  font-size: 10px;
  color: #14B8A6;
}

.format-options {
  display: flex;
  gap: 8px;
}

.format-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  background: #F0FDFA;
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.format-option:hover {
  background: #CCFBF1;
}

.format-option.active {
  background: linear-gradient(135deg, #0D9488 0%, #14B8A6 100%);
  border-color: #0D9488;
}

.format-option.active .format-name,
.format-option.active .format-ext {
  color: white;
}

.format-name {
  font-size: 14px;
  font-weight: 600;
  color: #134E4A;
}

.format-ext {
  font-size: 11px;
  color: #14B8A6;
}
</style>