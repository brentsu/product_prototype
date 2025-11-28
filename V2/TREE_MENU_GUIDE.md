# 左侧树状菜单使用指南

## 📋 概述

财务合规管理系统 V2 现在采用左侧树状菜单布局，类似于现代后台管理系统，提供更好的导航体验。

## 🎨 新布局特点

### 1. **固定顶部导航栏**
- 固定在页面顶部，包含系统logo和用户信息
- 包含菜单切换按钮（☰）
- 高度：50px

### 2. **左侧树状菜单**
- 固定在页面左侧
- 宽度：250px
- 可展开/收起的菜单组
- 支持菜单项高亮显示当前页面
- 可完全隐藏以获得更大的内容区域

### 3. **主内容区域**
- 自动适应左侧菜单的展开/收起状态
- 流式布局，适应不同屏幕尺寸

## 🌳 菜单结构

```
├── 📦 采购管理
│   ├── • 采销SKU明细 (600)
│   └── • 采销合同 (4)
├── 🧾 发票管理
│   ├── • 进项发票列表 (4)
│   └── • 合同-发票关联 (3)
├── 🚢 报关管理
│   ├── • 报关匹配管理 (2)
│   └── • 三方映射关系 (5)
└── 🏠 返回首页
```

## 💡 功能特性

### 1. **菜单组展开/收起**
- 点击菜单组标题可展开/收起子菜单
- 展开状态会自动保存到本地存储
- 下次访问时自动恢复之前的状态

### 2. **侧边栏显示/隐藏**
- 点击顶部的 `☰` 按钮可切换侧边栏显示状态
- 键盘快捷键：`Ctrl+B` 快速切换
- 隐藏状态会自动保存

### 3. **当前页面高亮**
- 自动高亮当前访问的菜单项
- 自动展开包含当前页面的菜单组
- 视觉反馈清晰明确

### 4. **徽章提示**
- 每个菜单项右侧显示数量徽章
- 实时反映对应功能的数据统计

## 🔧 技术实现

### 文件结构

```
V2/
├── index.html              # 首页（已更新为树状菜单布局）
├── css/
│   └── style.css          # 样式文件（新增树状菜单样式）
├── js/
│   ├── main.js            # 主JavaScript文件（菜单控制逻辑）
│   └── layout.js          # 布局组件加载工具
├── includes/
│   ├── header.html        # 顶部导航栏片段
│   └── sidebar.html       # 左侧菜单片段
└── pages/
    ├── sku-detail.html    # 示例页面（已更新）
    └── ...                # 其他页面
```

### 核心CSS类

```css
.top-header            # 顶部导航栏容器
.layout-container      # 主布局容器
.sidebar               # 左侧菜单容器
.sidebar.collapsed     # 侧边栏收起状态
.menu-group            # 菜单组容器
.menu-group-title      # 菜单组标题（可点击）
.menu-group-content    # 菜单组内容
.menu-item             # 菜单项
.menu-item.active      # 激活的菜单项
.main-content          # 主内容区域
.main-content.expanded # 内容区域扩展状态（侧边栏隐藏时）
```

### 核心JavaScript函数

```javascript
toggleSidebar()              // 切换侧边栏显示/隐藏
toggleMenuGroup(element)     // 切换菜单组展开/收起
restoreMenuGroupStates()     // 恢复菜单组状态
highlightCurrentMenu()       // 高亮当前菜单
navigateTo(page)            // 导航到指定页面
```

## 📖 在新页面中使用

### 方法1：复制模板结构

1. 复制 `pages/sku-detail.html` 作为模板
2. 修改页面标题和内容
3. 在左侧菜单中标记当前页面为 `active`

### 方法2：引用公共组件

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>页面标题 - 财务合规管理系统</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <!-- 顶部导航栏 -->
    <div class="top-header">
        <div class="header-left">
            <button class="menu-toggle" onclick="toggleSidebar()">☰</button>
            <div class="system-logo">财务合规管理系统 V2</div>
            <span style="color: rgba(255,255,255,0.6); margin-left: 15px;">/ 页面名称</span>
        </div>
        <div class="header-right">
            <!-- 右侧按钮组 -->
        </div>
    </div>

    <div class="layout-container">
        <!-- 左侧菜单：复制sidebar部分 -->
        <div class="sidebar" id="sidebar">
            <!-- ... 菜单内容 ... -->
        </div>

        <!-- 主内容区域 -->
        <div class="main-content">
            <div class="content-wrapper">
                <!-- 页面内容 -->
            </div>
        </div>
    </div>

    <script src="../js/main.js"></script>
    <script src="../js/your-page.js"></script>
</body>
</html>
```

## ⌨️ 键盘快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+B` | 切换侧边栏显示/隐藏 |
| `Ctrl+K` | 搜索菜单（规划中） |

## 🎯 最佳实践

1. **保持菜单结构一致**：所有页面使用相同的菜单结构
2. **正确标记当前页面**：为当前页面的菜单项添加 `active` 类
3. **加载main.js**：确保所有页面都引入 `main.js`
4. **徽章数据更新**：定期更新菜单徽章的数字统计

## 📱 响应式设计

- **桌面端（>1024px）**：显示完整的侧边栏和内容区域
- **平板端（768px-1024px）**：侧边栏默认收起，可手动展开
- **移动端（<768px）**：侧边栏覆盖在内容上方（待实现）

## 🔄 状态持久化

系统使用 `localStorage` 保存以下状态：
- `sidebarCollapsed`：侧边栏是否收起
- `menuGroupStates`：各菜单组的展开/收起状态

这确保用户刷新页面或重新访问时，布局状态保持一致。

## 🐛 故障排除

### 问题1：菜单不展开
**解决方案**：检查是否正确引入 `main.js`，并确保 `toggleMenuGroup` 函数可用

### 问题2：菜单项不高亮
**解决方案**：确保菜单项有正确的 `data-page` 属性，并且值与当前页面匹配

### 问题3：侧边栏无法切换
**解决方案**：检查是否给侧边栏元素设置了 `id="sidebar"`

## 📞 支持

如有问题或建议，请联系开发团队。

---

**版本**：V2.0  
**更新日期**：2025-11-28  
**维护者**：开发团队

