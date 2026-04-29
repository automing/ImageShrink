<template>
  <el-dialog
    v-model="visible"
    title="裁剪图片"
    width="90%"
    :close-on-click-modal="false"
    class="cropper-modal"
    append-to-body
    destroy-on-close
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
          <el-button @click="zoom(-0.2)">
            <el-icon><ZoomOut /></el-icon>
            缩小
          </el-button>
          <el-button @click="zoom(0.25)">
            <el-icon><ZoomIn /></el-icon>
            放大
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
            :type="aspectRatio === (4/3) ? 'primary' : 'default'"
            @click="setAspectRatio(4/3)"
          >
            4:3
          </el-button>
          <el-button
            :type="aspectRatio === (16/9) ? 'primary' : 'default'"
            @click="setAspectRatio(16/9)"
          >
            16:9
          </el-button>
          <el-button
            :type="aspectRatio === 0 ? 'primary' : 'default'"
            @click="setAspectRatio(NaN)"
          >
            自由
          </el-button>
        </el-button-group>
      </div>

      <div class="cropper-image-wrapper" ref="wrapperRef"></div>
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
import { ref, watch, onUnmounted, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { RefreshLeft, RefreshRight, ZoomIn, ZoomOut } from '@element-plus/icons-vue'
import { useImageCrop } from '@/composables/useImageCrop'
import type { CropData } from '@/types/image'

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
const wrapperRef = ref<HTMLElement | null>(null)
const aspectRatio = ref<number>(NaN)
const showCustomRatio = ref(false)
const customRatio = ref<number | string>('')

const { initCropper, getCroppedFile, getCropData, setAspectRatio: setRatio, rotate: rotateCropper, zoom: zoomCropper, destroy } = useImageCrop()

watch(() => props.modelValue, async (val) => {
  visible.value = val
  if (val) {
    await nextTick()
    setTimeout(() => {
      if (wrapperRef.value) {
        initCropper(wrapperRef.value, props.imageUrl)
      }
    }, 300)
  } else {
    destroy()
  }
})

const handleKeydown = (e: KeyboardEvent) => {
  if (!visible.value) return

  if (e.key === 'Escape') {
    handleCancel()
  } else if (e.key === 'Enter' && e.ctrlKey) {
    handleConfirm()
  }
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
  setRatio(ratio)
}

const applyCustomRatio = () => {
  if (!customRatio.value) return
  const ratioStr = customRatio.value.toString()
  const parts = ratioStr.split('/')
  let ratio: number
  if (parts.length === 2) {
    ratio = parseFloat(parts[0]) / parseFloat(parts[1])
  } else {
    ratio = parseFloat(parts[0])
  }
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

const zoom = (ratio: number) => {
  zoomCropper(ratio)
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
  height: 70vh;
  overflow: hidden;
  background: #f5f5f5;
}

:deep(cropper-canvas) {
  display: block;
  width: 100%;
  height: 100%;
  min-width: 0 !important;
  min-height: 0 !important;
}

.cropper-image {
  max-width: 100%;
  max-height: 70vh;
  display: block;
}
</style>