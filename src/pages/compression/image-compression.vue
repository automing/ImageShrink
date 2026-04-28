<template>
  <div class="compression-page">
    <div class="hero-section">
      <div class="hero-content">
        <div class="logo">
          <el-icon :size="48"><PictureFilled /></el-icon>
        </div>
        <h1>图片压缩工具</h1>
        <p class="subtitle">浏览器端批量压缩，保护您的隐私</p>
        <div class="features">
          <span class="feature-tag">
            <el-icon><Check /></el-icon> 50张批量处理
          </span>
          <span class="feature-tag">
            <el-icon><Check /></el-icon> 纯前端压缩
          </span>
          <span class="feature-tag">
            <el-icon><Check /></el-icon> 即时预览
          </span>
        </div>
      </div>
    </div>

    <div class="main-content">
      <template v-if="images.length === 0">
        <ImageUploader @files-selected="onFilesSelected" />
      </template>

      <template v-if="images.length > 0">
        <div class="workspace">
          <div class="back-button">
            <el-button text @click="images = []">
              <el-icon><ArrowLeft /></el-icon>
              返回上传
            </el-button>
          </div>
          <div class="settings-section">
            <div class="section-card">
              <div class="card-header">
                <el-icon><Setting /></el-icon>
                <h3>压缩设置</h3>
              </div>
              <SettingsPanel v-model="settings" />
            </div>
            <div class="action-card">
              <div class="card-header">
                <el-icon><Download /></el-icon>
                <h3>下载文件</h3>
              </div>
              <div class="action-buttons">
                <el-button
                  type="primary"
                  size="large"
                  :loading="isCompressing"
                  :disabled="pendingCount === 0"
                  @click="startCompression"
                  class="action-btn"
                >
                  <template #icon>
                    <el-icon><VideoPlay /></el-icon>
                  </template>
                  开始压缩 ({{ pendingCount }})
                </el-button>
                <div></div>
                <el-button
                  size="large"
                  :disabled="!hasCompleted || isDownloading"
                  :loading="isDownloading"
                  @click="downloadZip"
                  class="action-btn download-btn"
                >
                  <template #icon>
                    <el-icon><Download /></el-icon>
                  </template>
                  下载 ZIP ({{ completedCount }})
                </el-button>
              </div>
              <div v-if="hasCompleted" class="stats">
                <div class="stat-item">
                  <span class="stat-value">{{ totalSavings }}%</span>
                  <span class="stat-label">总节省</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">{{ formatSize(totalOriginalSize) }}</span>
                  <span class="stat-label">原始大小</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">{{ formatSize(totalCompressedSize) }}</span>
                  <span class="stat-label">压缩后</span>
                </div>
              </div>
            </div>
          </div>

          <ImageList :images="images" @clear="clearImages" />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  PictureFilled,
  Check,
  Setting,
  Download,
  VideoPlay,
  ArrowLeft
} from '@element-plus/icons-vue'
import ImageUploader from './components/ImageUploader.vue'
import SettingsPanel from './components/SettingsPanel.vue'
import ImageList from './components/ImageList.vue'
import { useImageCompression } from './composables/useImageCompression'
import { useZipDownload } from './composables/useZipDownload'
import type { ImageFile, CompressionSettings } from './types/image'

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
const pendingCount = computed(() => images.value.filter(img => img.status === 'pending').length)

const totalOriginalSize = computed(() =>
  images.value.filter(img => img.status === 'completed').reduce((sum, img) => sum + img.originalSize, 0)
)

const totalCompressedSize = computed(() =>
  images.value.filter(img => img.status === 'completed').reduce((sum, img) => sum + img.compressedSize, 0)
)

const totalSavings = computed(() => {
  if (!totalOriginalSize.value) return 0
  return Math.round((1 - totalCompressedSize.value / totalOriginalSize.value) * 100)
})

const formatSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

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
  min-height: 100vh;
  background: linear-gradient(135deg, #F0FDFA 0%, #CCFBF1 50%, #99F6E4 100%);
}

.hero-section {
  position: relative;
  padding: 60px 24px 80px;
  text-align: center;
  overflow: hidden;
}

.hero-content {
  position: relative;
  z-index: 1;
}

.logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #0D9488 0%, #14B8A6 100%);
  border-radius: 20px;
  color: white;
  margin-bottom: 24px;
  box-shadow: 0 8px 32px rgba(13, 148, 136, 0.3);
}

.hero-section h1 {
  margin: 0;
  font-size: 40px;
  font-weight: 700;
  background: linear-gradient(135deg, #134E4A 0%, #0D9488 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  margin: 12px 0 24px;
  font-size: 18px;
  color: #134E4A;
  opacity: 0.8;
}

.features {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.feature-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: white;
  border-radius: 20px;
  font-size: 14px;
  color: #134E4A;
  box-shadow: 0 2px 8px rgba(13, 148, 136, 0.1);
}

.feature-tag .el-icon {
  color: #0D9488;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px 60px;
}

.workspace {
  margin-top: 24px;
}

.back-button {
  margin-bottom: 16px;
}

.settings-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

.section-card,
.action-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 24px rgba(13, 148, 136, 0.08),
              0 1px 2px rgba(13, 148, 136, 0.04);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.card-header .el-icon {
  font-size: 24px;
  color: #0D9488;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #134E4A;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-btn {
  height: 52px;
  font-size: 16px;
  border-radius: 12px;
}

.action-btn.is-disabled {
  background: #F0FDFA;
  border-color: #CCFBF1;
  color: #99F6E4;
}

.download-btn {
  background: #F97316;
  border: none;
  color: white;
}

.download-btn:hover {
  background: #EA580C;
}

.download-btn:disabled {
  background: #FED7AA;
  color: #FBBF24;
}

.stats {
  display: flex;
  justify-content: space-around;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #F0FDFA;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #0D9488;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #14B8A6;
  margin-top: 4px;
}

@media (max-width: 768px) {
  .hero-section {
    padding: 40px 16px 60px;
  }

  .hero-section h1 {
    font-size: 28px;
  }

  .settings-section {
    grid-template-columns: 1fr;
  }

  .features {
    gap: 8px;
  }

  .feature-tag {
    padding: 6px 12px;
    font-size: 12px;
  }
}
</style>