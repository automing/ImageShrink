# 图片压缩网站实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建纯前端图片压缩工具，支持批量处理（最多50张），浏览器端完成压缩

**Architecture:** 使用 Vue 3 + Element Plus 构建界面，browser-image-compression 处理图片压缩，JSZip 实现批量打包下载

**Tech Stack:** Vue 3, TypeScript, Element Plus, browser-image-compression, JSZip, FileSaver.js

---

## 准备工作

### Task 1: 安装依赖

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 添加依赖到 package.json**

```json
{
  "browser-image-compression": "^2.0.2",
  "jszip": "^3.10.1",
  "file-saver": "^2.0.5"
}
```

- [ ] **Step 2: 安装依赖**

Run: `npm install`
Expected: 安装完成，package.json 更新

---

## 类型定义

### Task 2: 创建类型定义

**Files:**
- Create: `src/types/image.ts`

```typescript
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
  quality: number       // 0.1 - 1.0
  maxWidthOrHeight: number
  outputFormat: 'jpeg' | 'png' | 'webp'
  maxFiles: number
}
```

---

## Composable

### Task 3: 创建压缩逻辑 Composable

**Files:**
- Create: `src/composables/useImageCompression.ts`

- [ ] **Step 1: 创建 useImageCompression.ts**

```typescript
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
    const options = {
      maxSizeMB: 10,
      maxWidthOrHeight: settings.maxWidthOrHeight,
      useWebWorker: true,
      initialQuality: settings.quality,
      fileType: `image/${settings.outputFormat}`,
      onProgress
    }

    return await imageCompression(imageFile.file, options)
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
```

---

### Task 4: 创建 ZIP 下载 Composable

**Files:**
- Create: `src/composables/useZipDownload.ts`

```typescript
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import type { ImageFile } from '../types/image'

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
```

---

## 组件

### Task 5: 创建图片上传组件

**Files:**
- Create: `src/components/ImageUploader.vue`

```vue
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
      <el-icon :size="48"><UploadFilled /></el-icon>
      <p>拖拽图片到此处，或点击选择</p>
      <p class="hint">支持 JPEG, PNG, WebP, GIF, BMP, TIFF (最多50张)</p>
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
  border: 2px dashed #0D9488;
  border-radius: 12px;
  padding: 48px;
  text-align: center;
  cursor: pointer;
  transition: all 0.15s ease;
  background: #F0FDFA;
}
.uploader:hover, .uploader.drag-over {
  border-color: #F97316;
  background: #FFF7ED;
}
.uploader-content {
  color: #134E4A;
}
.uploader-content p {
  margin: 16px 0 8px;
  font-size: 16px;
}
.uploader-content .hint {
  font-size: 14px;
  color: #14B8A6;
}
</style>
```

---

### Task 6: 创建设置面板组件

**Files:**
- Create: `src/components/SettingsPanel.vue`

```vue
<template>
  <div class="settings-panel">
    <h3>压缩设置</h3>
    
    <div class="setting-item">
      <label>质量: {{ quality }}%</label>
      <el-slider v-model="quality" :min="10" :max="100" :step="5" />
    </div>

    <div class="setting-item">
      <label>最大尺寸 (px)</label>
      <el-input-number v-model="maxWidthOrHeight" :min="100" :max="10000" :step="100" />
    </div>

    <div class="setting-item">
      <label>输出格式</label>
      <el-select v-model="outputFormat">
        <el-option label="JPEG" value="jpeg" />
        <el-option label="PNG" value="png" />
        <el-option label="WebP" value="webp" />
      </el-select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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
  set: (v) => emit('update:modelValue', { ...props.modelValue, outputFormat: v })
})
</script>

<style scoped>
.settings-panel {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(13, 148, 136, 0.1);
}
.settings-panel h3 {
  margin: 0 0 20px;
  color: #134E4A;
  font-size: 18px;
}
.setting-item {
  margin-bottom: 20px;
}
.setting-item label {
  display: block;
  margin-bottom: 8px;
  color: #134E4A;
  font-size: 14px;
}
</style>
```

---

### Task 7: 创建图片项组件

**Files:**
- Create: `src/components/ImageItem.vue`

```vue
<template>
  <div class="image-item" :class="image.status">
    <div class="image-preview">
      <img :src="previewUrl" alt="" />
      <div v-if="image.status === 'compressing'" class="progress-overlay">
        <el-progress type="circle" :percentage="image.progress" :width="60" />
      </div>
      <div v-else-if="image.status === 'error'" class="error-overlay">
        <el-icon><CircleCloseFilled /></el-icon>
      </div>
    </div>
    <div class="image-info">
      <p class="name" :title="image.name">{{ image.name }}</p>
      <p class="sizes">
        <span class="original">{{ formatSize(image.originalSize) }}</span>
        <span v-if="image.compressedSize">→ {{ formatSize(image.compressedSize) }}</span>
      </p>
      <p v-if="image.compressedSize" class="savings">
        节省 {{ savingsPercent }}%
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CircleCloseFilled } from '@element-plus/icons-vue'
import type { ImageFile } from '../types/image'

const props = defineProps<{
  image: ImageFile
}>()

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
</script>

<style scoped>
.image-item {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(13, 148, 136, 0.1);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.image-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(13, 148, 136, 0.15);
}
.image-preview {
  position: relative;
  width: 100%;
  height: 120px;
  background: #F0FDFA;
  display: flex;
  align-items: center;
  justify-content: center;
}
.image-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
.progress-overlay, .error-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
}
.error-overlay .el-icon {
  font-size: 32px;
  color: #EF4444;
}
.image-info {
  padding: 12px;
}
.image-info .name {
  margin: 0;
  font-size: 12px;
  color: #134E4A;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.image-info .sizes {
  margin: 4px 0 0;
  font-size: 11px;
  color: #14B8A6;
}
.image-info .savings {
  margin: 4px 0 0;
  font-size: 11px;
  color: #0D9488;
  font-weight: 600;
}
</style>
```

---

### Task 8: 创建图片列表组件

**Files:**
- Create: `src/components/ImageList.vue`

```vue
<template>
  <div class="image-list">
    <div class="list-header">
      <h3>已选图片 ({{ images.length }}/50)</h3>
      <el-button link type="danger" @click="$emit('clear')">清空</el-button>
    </div>
    <div class="grid">
      <ImageItem 
        v-for="image in images" 
        :key="image.id" 
        :image="image" 
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import ImageItem from './ImageItem.vue'
import type { ImageFile } from '../types/image'

defineProps<{
  images: ImageFile[]
}>()

defineEmits<{
  (e: 'clear'): void
}>()
</script>

<style scoped>
.image-list {
  margin-top: 24px;
}
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.list-header h3 {
  margin: 0;
  color: #134E4A;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
}
</style>
```

---

## 主页面

### Task 9: 创建主页面视图

**Files:**
- Create: `src/views/ImageCompressionView.vue`

```vue
<template>
  <div class="compression-page">
    <header class="header">
      <h1>图片压缩工具</h1>
      <p class="subtitle">浏览器端批量压缩，保护您的隐私</p>
    </header>

    <ImageUploader @files-selected="onFilesSelected" />

    <template v-if="images.length > 0">
      <div class="content-grid">
        <SettingsPanel v-model="settings" />
        <div class="actions">
          <el-button 
            type="primary" 
            size="large"
            :loading="isCompressing"
            @click="startCompression"
          >
            开始压缩
          </el-button>
          <el-button 
            size="large"
            :disabled="!hasCompleted || isDownloading"
            :loading="isDownloading"
            @click="downloadZip"
          >
            下载 ZIP ({{ completedCount }})
          </el-button>
        </div>
      </div>

      <ImageList :images="images" @clear="clearImages" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import ImageUploader from '@/components/ImageUploader.vue'
import SettingsPanel from '@/components/SettingsPanel.vue'
import ImageList from '@/components/ImageList.vue'
import { useImageCompression } from '@/composables/useImageCompression'
import { useZipDownload } from '@/composables/useZipDownload'
import type { ImageFile, CompressionSettings } from '@/types/image'

const images = ref<ImageFile[]>([])
const settings = ref<CompressionSettings>({
  quality: 0.8,
  maxWidthOrHeight: 1920,
  outputFormat: 'jpeg',
  maxFiles: 50
})

const { isCompressing, compressBatch } = useImageCompression()
const { isDownloading, downloadAsZip } = useZipDownload()

const hasCompleted = computed(() => images.value.some(img => img.status === 'completed'))
const completedCount = computed(() => images.value.filter(img => img.status === 'completed').length)

const onFilesSelected = (newImages: ImageFile[]) => {
  images.value = [...images.value, ...newImages].slice(0, 50)
}

const clearImages = () => {
  images.value.forEach(img => {
    URL.revokeObjectURL(img.originalUrl)
    if (img.compressedUrl) URL.revokeObjectURL(img.compressedUrl)
  })
  images.value = []
}

const startCompression = async () => {
  const pendingImages = images.value.filter(img => img.status === 'pending')
  
  await compressBatch(
    pendingImages,
    settings.value,
    (id, progress) => {
      const img = images.value.find(i => i.id === id)
      if (img) img.progress = progress
    },
    (id, file) => {
      const img = images.value.find(i => i.id === id)
      if (img) {
        img.compressedSize = file.size
        img.compressedUrl = URL.createObjectURL(file)
      }
    },
    (id, error) => {
      console.error('Compression error:', error)
    }
  )
}

const downloadZip = async () => {
  await downloadAsZip(images.value)
}
</script>

<style scoped>
.compression-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
}
.header {
  text-align: center;
  margin-bottom: 32px;
}
.header h1 {
  margin: 0;
  color: #134E4A;
  font-size: 32px;
}
.header .subtitle {
  margin: 8px 0 0;
  color: #14B8A6;
  font-size: 16px;
}
.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 24px;
}
.actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
  justify-content: center;
}
@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>
```

---

### Task 10: 更新路由配置

**Files:**
- Modify: `src/router/index.ts`

- [ ] **Step 1: 添加路由配置**

```typescript
{
  path: '/',
  name: 'home',
  component: () => import('@/views/ImageCompressionView.vue')
}
```

---

### Task 11: 更新 App.vue

**Files:**
- Modify: `src/App.vue`

```vue
<template>
  <router-view />
</template>

<script setup lang="ts">
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: #F0FDFA;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  -webkit-font-smoothing: antialiased;
}

#app {
  min-height: 100vh;
}
</style>
```

---

### Task 12: 更新 main.ts

**Files:**
- Modify: `src/main.ts`

```typescript
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.mount('#app')
```

---

## 验收检查

- [ ] 拖拽上传最多50张图片
- [ ] 压缩前后大小对比显示
- [ ] 质量滑块可调节
- [ ] ZIP 下载正常
- [ ] 响应式：375px, 768px, 1024px, 1440px
- [ ] Hover 状态平滑过渡
- [ ] 无 emoji，使用 SVG 图标

---

**Plan complete and saved to `docs/superpowers/plans/2026-04-28-image-compression-plan.md`**

**Two execution options:**

1. **Subagent-Driven (recommended)** - 调度子代理逐任务执行，快速迭代
2. **Inline Execution** - 在当前会话批量执行

选择哪种方式？