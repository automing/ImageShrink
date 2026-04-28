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
            <el-icon><RefreshLeft /></el-icon>
            左转
          </el-button>
          <el-button @click="rotate(90)">
            <el-icon><RefreshRight /></el-icon>
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
            :type="!aspectRatio && aspectRatio !== 0 ? 'primary' : 'default'"
            @click="setAspectRatio(NaN)"
          >
            自由
          </el-button>
        </el-button-group>

        <el-input
          v-if="showCustomRatio"
          v-model.number="customRatio"
          placeholder="如: 16/9"
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
import { ref, watch, onUnmounted, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { RefreshLeft, RefreshRight } from '@element-plus/icons-vue'
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

const { initCropper, getCroppedFile, getCropData, setAspectRatio: setRatio, rotate: rotateCropper, destroy, cropper: cropperInstance } = useImageCrop()

watch(() => props.modelValue, async (val) => {
  visible.value = val
  if (val && imageRef.value) {
    setTimeout(() => {
      if (imageRef.value) {
        initCropper(imageRef.value)
      }
    }, 100)
  }
})

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
  if (!cropperInstance.value) return
  const data = cropperInstance.value.getData()
  const newData = { ...data }
  newData[direction] = data[direction] + delta
  cropperInstance.value.setData(newData)
}

const adjustCropBox = (dimension: 'width' | 'height', delta: number) => {
  if (!cropperInstance.value) return
  const data = cropperInstance.value.getData()
  const newData = { ...data }
  newData[dimension] = Math.max(10, data[dimension] + delta)
  cropperInstance.value.setData(newData)
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
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