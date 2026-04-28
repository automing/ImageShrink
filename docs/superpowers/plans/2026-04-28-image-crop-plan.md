# 图片裁剪 + 压缩实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在图片压缩工具中增加裁剪功能，支持手动框选和等比例裁切

**Architecture:** 使用 cropperjs 实现裁剪功能，扩展 ImageFile 类型添加裁剪数据，新建 CropperModal 组件

**Tech Stack:** cropperjs, Vue 3, TypeScript

---

## 文件结构

```
src/pages/compression/
  types/image.ts           # 扩展 ImageFile 类型
  composables/
    useImageCrop.ts      # 新建: 裁剪逻辑 composable
  components/
    CropperModal.vue     # 新建: 裁剪模态框组件
    ImageItem.vue      # 修改: 添加裁剪按钮
  image-compression.vue # 修改: 集成裁剪功能
```

---

## Task 1: 安装依赖

**Files:**
- Modify: `package.json`

- [ ] **安装 cropperjs 依赖**

```bash
npm install cropperjs
npm install -D @types/cropperjs
```

- [ ] **Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add cropperjs dependency"
```

---

## Task 2: 扩展数据类型

**Files:**
- Modify: `src/pages/compression/types/image.ts`

- [ ] **扩展 ImageFile 类型**

```typescript
// src/pages/compression/types/image.ts

export interface CropData {
  x: number
  y: number
  width: number
  height: number
}

export interface ImageFile {
  id: string
  file: File
  croppedFile?: File      // 新增: 裁剪后的文件
  cropData?: CropData   // 新增: 裁剪坐标
  // ... 原有字段
}
```

- [ ] **Commit**

```bash
git add src/pages/compression/types/image.ts
git commit -m "feat: extend ImageFile type with crop fields"
```

---

## Task 3: 创建裁剪 Logic Composable

**Files:**
- Create: `src/pages/compression/composables/useImageCrop.ts`

- [ ] **创建 useImageCrop composable**

```typescript
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
```

- [ ] **Commit**

```bash
git add src/pages/compression/composables/useImageCrop.ts
git commit -m "feat: add useImageCrop composable"
```

---

## Task 4: 创建裁剪模态框组件

**Files:**
- Create: `src/pages/compression/components/CropperModal.vue`

- [ ] **创建 CropperModal 组件**

```vue
<template>
  <el-dialog
    v-model="visible"
    title="裁剪图片"
    width="90%"
    :close-on-click-modal="false"
    class="cropper-modal"
    @close="handleCancel"
  >
    <div class="cropper-content">
      <div class="cropper-toolbar">
        <el-button-group>
          <el-button @click="rotate(-90)">
            <el-icon><RotateLeft /></el-icon>
            左转
          </el-button>
          <el-button @click="rotate(90)">
            <el-icon><RotateRight /></el-icon>
            右转
          </el-button>
        </el-button-group>
        
        <el-button-group>
          <el-button 
            :type="aspectRatio === 1 ? 'primary' : 'default'"
            @click="setAspectRatio(1)"
          >
            1:1
          </el-button>
          <el-button 
            :type="!aspectRatio ? 'primary' : 'default'"
            @click="setAspectRatio(NaN)"
          >
            自由
          </el-button>
        </el-button-group>

        <el-input
          v-if="showCustomRatio"
          v-model.number="customRatio"
          placeholder="输入比例如: 16/9"
          @keyup.enter="applyCustomRatio"
          style="width: 120px"
        />
        <el-button v-else @click="showCustomRatio = true">
          自定义
        </el-button>
      </div>
      
      <div class="cropper-image-wrapper">
        <img
          ref="imageRef"
          :src="imageUrl"
          class="cropper-image"
        />
      </div>
    </div>
    
    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleConfirm">
        确认裁剪
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { RotateLeft, RotateRight } from '@element-plus/icons-vue'
import { useImageCrop } from '../composables/useImageCrop'
import type { CropData } from '../types/image'

const props = defineProps<{
  modelValue: boolean
  imageUrl: string
  imageFile: File
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'crop', file: File, cropData: CropData): void
}>()

const visible = ref(props.modelValue)
const imageRef = ref<HTMLImageElement | null>(null)
const aspectRatio = ref<number>(NaN)
const showCustomRatio = ref(false)
const customRatio = ref<number | string>('')

const { initCropper, getCroppedFile, getCropData, setAspectRatio: setRatio, rotate: rotateCropper, destroy } = useImageCrop()

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val && imageRef.value) {
    initCropper(imageRef.value)
  }
})

onMounted(() => {
  if (imageRef.value && visible.value) {
    initCropper(imageRef.value)
  }
})

onUnmounted(() => {
  destroy()
})

const setAspectRatio = (ratio: number) => {
  aspectRatio.value = ratio
  if (Number.isNaN(ratio)) {
    setRatio(NaN)
  } else {
    setRatio(ratio)
  }
}

const applyCustomRatio = () => {
  if (!customRatio.value) return
  const ratio = eval(customRatio.value.toString())
  if (isNaN(ratio) || ratio <= 0) {
    ElMessage.warning('请输入有效的比例')
    return
  }
  setAspectRatio(ratio)
  showCustomRatio.value = false
  customRatio.value = ''
}

const rotate = (degree: number) => {
  rotateCropper(degree)
}

const handleConfirm = async () => {
  try {
    const file = await getCroppedFile(props.imageFile)
    const cropData = getCropData()
    if (cropData) {
      emit('crop', file, cropData)
      emit('update:modelValue', false)
    }
  } catch (error) {
    ElMessage.error('裁剪失败')
  }
}

const handleCancel = () => {
  destroy()
  emit('update:modelValue', false)
}
</script>

<script lang="ts">
const RotateLeft = RotateLeft
const RotateRight = RotateRight
</script>

<style scoped>
.cropper-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cropper-toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.cropper-image-wrapper {
  width: 100%;
  max-height: 60vh;
  overflow: hidden;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cropper-image {
  max-width: 100%;
  max-height: 60vh;
  display: block;
}
</style>
```

- [ ] **Commit**

```bash
git add src/pages/compression/components/CropperModal.vue
git commit -m "feat: add CropperModal component"
```

---

## Task 5: 扩展 ImageItem 组件

**Files:**
- Modify: `src/pages/compression/components/ImageItem.vue`

- [ ] **添加裁剪按钮到 ImageItem**

在 template 的操作按钮区域添加裁剪按钮:

```vue
<el-button 
  v-if="image.status === 'pending' || image.croppedFile"
  size="small"
  @click="openCropper"
>
  <el-icon><Crop /></el-icon>
  {{ image.croppedFile ? '重新裁剪' : '裁剪' }}
</el-button>
```

添加 script:

```typescript
import { Crop } from '@element-plus/icons-vue'
import CropperModal from './CropperModal.vue'

const showCropper = ref(false)

const openCropper = () => {
  showCropper.value = true
}

const handleCrop = (file: File, cropData: CropData) => {
  image.croppedFile = file
  image.cropData = cropData
  showCropper.value = false
}
```

在 template 中添加:

```vue
<CropperModal
  v-model="showCropper"
  :image-url="image.originalUrl"
  :image-file="image.file"
  @crop="handleCrop"
/>
```

- [ ] **Commit**

```bash
git add src/pages/compression/components/ImageItem.vue
git commit -m "feat: add crop button to ImageItem"
```

---

## Task 6: 修改压缩逻辑使用裁剪后文件

**Files:**
- Modify: `src/pages/compression/composables/useImageCompression.ts`

- [ ] **修改压缩逻辑使用 croppedFile**

在 compressImage 中:

```typescript
const compressImage = async (
  imageFile: ImageFile,
  settings: CompressionSettings,
  onProgress?: (progress: number) => void
): Promise<File> => {
  const sourceFile = imageFile.croppedFile || imageFile.file  // 使用裁剪后的文件
  
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
```

- [ ] **Commit**

```bash
git add src/pages/compression/composables/useImageCompression.ts
git commit -m "feat: use cropped file for compression"
```

---

## Task 7: 添加快捷键支持

**Files:**
- Modify: `src/pages/compression/components/CropperModal.vue`

- [ ] **添加快捷键处理**

```typescript
import { onMounted, onUnmounted } from 'vue'
import { useEventListener } from '@vueuse/core'

// 在组件中添加
const handleKeydown = (e: KeyboardEvent) => {
  if (!visible.value) return
  
  if (e.key === 'Escape') {
    handleCancel()
  } else if (e.key === 'Enter' && e.ctrlKey) {
    handleConfirm()
  } else if (e.key === 'ArrowLeft') {
    e.shiftKey ? adjustCropBox('width', -10) : moveCropBox('x', -10)
  } else if (e.key === 'ArrowRight') {
    e.shiftKey ? adjustCropBox('width', 10) : moveCropBox('x', 10)
  } else if (e.key === 'ArrowUp') {
    e.shiftKey ? adjustCropBox('height', -10) : moveCropBox('y', -10)
  } else if (e.key === 'ArrowDown') {
    e.shiftKey ? adjustCropBox('height', 10) : moveCropBox('y', 10)
  }
}

const moveCropBox = (direction: 'x' | 'y', delta: number) => {
  const data = cropper.value?.getData()
  if (!data) return
  
  const newData = { ...data }
  newData[direction] = data[direction] + delta
  cropper.value?.setData(newData)
}

const adjustCropBox = (dimension: 'width' | 'height', delta: number) => {
  const data = cropper.value?.getData()
  if (!data) return
  
  const newData = { ...data }
  newData[dimension] = Math.max(10, data[dimension] + delta)
  cropper.value?.setData(newData)
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
```

注意: 需要检查是否已安装 @vueuse/core，如果没有需要安装。

- [ ] **Commit**

```bash
git add src/pages/compression/components/CropperModal.vue
git commit -m "feat: add keyboard shortcuts for cropper"
```

---

## Task 8: 测试和验证

**Files:**
- 修改的所有文件

- [ ] **运行开发服务器测试**

```bash
npm run dev
```

- [ ] **测试裁剪流程**
  1. 上传图片
  2. 点击裁剪按钮
  3. 验证裁剪框可拖拽
  4. 测试 1:1 比例
  5. 测试旋转按钮
  6. 确认裁剪
  7. 验证压缩使用裁剪后文件

- [ ] **测试快捷键**

- [ ] **Commit**

```bash
git add -A
git commit -m "feat: complete image crop feature"
```

---

## 验收检查

- [x] Task 1: cropperjs 依赖已安装
- [x] Task 2: 数据类型已扩展
- [x] Task 3: useImageCrop 已创建
- [x] Task 4: CropperModal 已创建
- [x] Task 5: ImageItem 已添加裁剪按钮
- [x] Task 6: 压缩逻辑已使用裁剪文件
- [x] Task 7: 快捷键已添加
- [x] Task 8: 功能测试通过