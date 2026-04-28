# 图片压缩网站设计文档

日期：2026-04-28

## 概述

纯前端图片压缩工具，支持批量处理（最多50张），在浏览器端完成压缩，保护用户隐私。

## 功能需求

### 核心功能
- 支持格式：JPEG, PNG, WebP, GIF, BMP, TIFF
- 批量处理：最多50张图片同时压缩
- 压缩参数：质量滑块（1-100%）、尺寸调整、输出格式选择
- 下载方式：批量打包 ZIP 下载

### 用户流程
1. 用户拖拽或选择图片（最多50张）
2. 显示图片列表，包含压缩前后的缩略图、大小对比
3. 用户调整压缩参数（质量、尺寸、格式）
4. 点击压缩按钮开始处理
5. 压缩完成后，一键下载 ZIP 包

## 设计系统（基于 UI-UX Pro Max）

### 风格：Micro-interactions
- 小动画、触摸反馈、微妙动效
- 适合工具类应用、用户友好的交互组件

### 色彩
| 用途 | 色值 |
|------|------|
| Primary | #0D9488 (Teal) |
| Secondary | #14B8A6 |
| CTA | #F97316 (Orange) |
| Background | #F0FDFA |
| Text | #134E4A |

### 字体
- 主字体：Inter
- 风格：Clean + Efficient typography

### 动效
- Hover：50-100ms 过渡
- 加载动画、成功/失败状态动画
- 手势触发（拖拽、滑动）
- 尊重 prefers-reduced-motion

### 抗模式（避免）
- 复杂引导流程
- 慢性能

## 技术方案

### 技术栈
- Vue 3 + TypeScript
- Vite
- Element Plus（已安装）
- browser-image-compression：图片压缩核心库
- JSZip：ZIP 打包下载
- FileSaver.js：触发下载

### 架构设计

```
src/
├── components/
│   ├── ImageUploader.vue      # 拖拽上传组件
│   ├── ImageList.vue          # 图片列表组件
│   ├── ImageItem.vue          # 单张图片项
│   ├── SettingsPanel.vue      # 压缩设置面板
│   └── DownloadButton.vue     # 下载按钮
├── composables/
│   ├── useImageCompression.ts  # 压缩逻辑
│   └── useZipDownload.ts     # ZIP 下载逻��
├── types/
│   └── image.ts               # 类型定义
├── App.vue
└── main.ts
```

## 验收标准

- 拖拽上传最多50张图片
- 压缩前后大小对比清晰显示
- 质量滑块实时影响压缩结果
- ZIP 下载正常，包含所有压缩后图片
- 无页面卡顿，压缩过程可中断
- 交互微动画流畅，hover 状态响应快
- 响应式适配：375px, 768px, 1024px, 1440px
- 无障碍：键盘导航可见、对比度 4.5:1 以上

## Pre-Delivery Checklist

- [ ] 使用 SVG 图标（Heroicons/Lucide），避免 emoji
- [ ] 所有可点击元素添加 cursor-pointer
- [ ] Hover 状态过渡平滑（150-300ms）
- [ ] 文本对比度 ≥ 4.5:1
- [ ] 键盘导航 focus 状态可见
- [ ] 尊重 prefers-reduced-motion
- [ ] 响应式：375px, 768px, 1024px, 1440px