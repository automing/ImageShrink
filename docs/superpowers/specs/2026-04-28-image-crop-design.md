# 图片裁剪 + 压缩功能设计

## 概述

在现有图片压缩工具中增加裁剪功能，用户可在压缩前手动框选裁剪区域。

## 功能需求

- 用户点击图片的"裁剪"按钮，弹出裁剪模态框
- 使用 cropperjs 实现手动框选裁剪区域
- 裁剪完成后图片进入压缩流程
- 支持撤销裁剪，重新裁剪

## 技术方案

### 依赖

添加 `cropperjs` 作为裁剪库：

```bash
npm install cropperjs
npm install -D @types/cropperjs
```

### 数据结构

扩展 `ImageFile` 类型：

```typescript
export interface ImageFile {
  id: string
  file: File
  croppedFile?: File  // 裁剪后的文件
  cropData?: CropData // 裁剪坐标
  // ... 原有字段
}

export interface CropData {
  x: number
  y: number
  width: number
  height: number
}
```

### 组件结构

```
composables/
  useImageCrop.ts      // 裁剪逻辑

components/
  CropperModal.vue    // 裁剪模态框
```

扩展现有组件：

- `ImageItem.vue` - 添加裁剪按钮
- `useImageCompression.ts` - 使用 croppedFile 作为源

### 裁剪流程

1. 用户点击裁剪按钮
2. 弹出模态框加载原图
3. 用户手动拖拽选择裁剪区域
4. 点击"确认裁剪"生成新文件
5. 更新 ImageFile.croppedFile 和 cropData
6. 压缩时使用 croppedFile

### 交互细节

- 裁剪按钮仅在 pending 状态显示
- 已裁剪的图片显示"重新裁剪"按钮
- 裁剪支持旋转（90°旋转按钮）

#### 快捷键支持

| 快捷键 | 功能 |
|--------|------|
| `Ctrl + Enter` | 确认裁剪 |
| `Esc` | 取消裁剪 |
| `← → ↑ ↓` | 微调裁剪框位置 |
| `Shift + ← →` | 调整裁剪框宽高 |

#### 等比例裁切

提供以下比例选项：
- **1:1 方形** - 常用于头像、社交媒体
- **自定义** - 用户可输入宽高比（如 16:9）

点击比例按钮后，裁剪框自动调整为对应比例，用户可拖拽调整大小。

## 验收标准

- [x] 点击裁剪按钮弹出模态框
- [x] 支持手动拖拽框选裁剪区域
- [x] 确认裁剪后文件更新
- [x] 压缩使用裁剪后的文件
- [x] 支持重新裁剪
- [x] 旋转功能正常
- [x] 支持 1:1 等比例裁切
- [x] 支持自定义比例裁切
- [x] 快捷键功能正常