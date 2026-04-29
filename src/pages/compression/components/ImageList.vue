<template>
  <div class="image-list">
    <div class="list-header">
      <div class="header-left">
        <el-icon><Files /></el-icon>
        <h3>已选图片 <span class="count">({{ images.length }}/50)</span></h3>
      </div>
      <el-button link type="danger" @click="$emit('clear')" class="clear-btn">
        <el-icon><Delete /></el-icon>
        清空
      </el-button>
    </div>
    <div class="grid">
      <ImageItem
        v-for="image in images"
        :key="image.id"
        :image="image"
      />
    </div>
    <div v-if="images.length === 0" class="empty-state">
      <el-icon :size="48"><Picture /></el-icon>
      <p>暂无图片</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import ImageItem from './ImageItem.vue'
import { Files, Delete, Picture } from '@element-plus/icons-vue'
import type { ImageFile } from '@/types/image'

defineProps<{
  images: ImageFile[]
}>()

defineEmits<{
  (e: 'clear'): void
}>()
</script>

<style scoped>
.image-list {
  background: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 24px rgba(13, 148, 136, 0.08);
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #F0FDFA;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left .el-icon {
  font-size: 24px;
  color: #0D9488;
}

.header-left h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #134E4A;
}

.header-left .count {
  font-weight: 400;
  color: #14B8A6;
}

.clear-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
}

.empty-state {
  text-align: center;
  padding: 48px 24px;
  color: #99F6E4;
}

.empty-state p {
  margin: 12px 0 0;
  font-size: 14px;
}
</style>