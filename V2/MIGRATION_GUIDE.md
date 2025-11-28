# 页面迁移指南 - 升级到左侧树状菜单布局

## 📋 概述

本指南帮助您将现有页面从旧的顶部导航布局迁移到新的左侧树状菜单布局。

## 🔄 迁移步骤

### 步骤1：更新HTML结构

#### 旧布局（需要替换）：
```html
<body>
    <div class="container">
        <!-- 顶部导航 -->
        <div class="top-nav">
            <button class="nav-btn" onclick="goBack()">< 首页</button>
            <div class="page-title">页面标题 <span class="close-btn" onclick="goBack()">×</span></div>
            <div class="nav-right">
                <!-- 导航按钮 -->
            </div>
        </div>
        
        <!-- 页面内容 -->
        <div class="content">
            <!-- ... -->
        </div>
    </div>
</body>
```

#### 新布局（应该使用）：
```html
<body>
    <!-- 顶部导航栏 -->
    <div class="top-header">
        <div class="header-left">
            <button class="menu-toggle" onclick="toggleSidebar()">☰</button>
            <div class="system-logo">财务合规管理系统 V2</div>
            <span style="color: rgba(255,255,255,0.6); margin-left: 15px;">/ 页面名称</span>
        </div>
        <div class="header-right">
            <button class="search-btn">🔍 Ctrl+K 搜索</button>
            <button class="icon-btn">📷</button>
            <button class="icon-btn">⬆</button>
            <button class="icon-btn">⚙</button>
            <div class="user-info">
                <span class="user-avatar">👤</span>
                <span class="user-name">XXX</span>
            </div>
        </div>
    </div>

    <div class="layout-container">
        <!-- 左侧菜单 -->
        <div class="sidebar" id="sidebar">
            <!-- 复制完整的菜单结构 -->
            <!-- 参见 includes/sidebar.html -->
        </div>

        <!-- 主内容区域 -->
        <div class="main-content">
            <div class="content-wrapper">
                <!-- 页面内容 -->
                <!-- 原来的内容放这里，保持原有缩进 -->
            </div>
        </div>
    </div>
</body>
```

### 步骤2：更新标题标签

```html
<!-- 旧标题 -->
<title>页面名称</title>

<!-- 新标题 -->
<title>页面名称 - 财务合规管理系统</title>
```

### 步骤3：更新脚本引用

确保引入 `main.js`：

```html
<!-- 在页面底部 </body> 之前 -->
<script src="../js/main.js"></script>
<script src="../js/your-page.js"></script>
```

### 步骤4：标记当前菜单项

在左侧菜单中，为当前页面对应的菜单项添加 `active` 类：

```html
<!-- 例如：SKU明细页面 -->
<div class="menu-item active" onclick="navigateTo('sku-detail.html')">
    <span class="menu-dot">•</span>
    <span class="menu-text">采销SKU明细</span>
    <span class="menu-badge">600</span>
</div>
```

### 步骤5：移除旧的导航函数

如果您的JavaScript文件中有 `goBack()` 函数，可以移除它：

```javascript
// 旧代码（删除）
function goBack() {
    window.history.back();
}
```

## 📝 完整示例

### 迁移前（旧版 - purchase-contract.html）

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>采销合同</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <div class="container">
        <div class="top-nav">
            <button class="nav-btn" onclick="goBack()">< 首页</button>
            <div class="page-title">采销合同</div>
        </div>
        
        <div class="content">
            <!-- 合同内容 -->
        </div>
    </div>
    
    <script src="../js/purchase-contract.js"></script>
</body>
</html>
```

### 迁移后（新版）

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>采销合同 - 财务合规管理系统</title>
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <!-- 顶部导航栏 -->
    <div class="top-header">
        <div class="header-left">
            <button class="menu-toggle" onclick="toggleSidebar()">☰</button>
            <div class="system-logo">财务合规管理系统 V2</div>
            <span style="color: rgba(255,255,255,0.6); margin-left: 15px;">/ 采销合同</span>
        </div>
        <div class="header-right">
            <button class="search-btn">🔍 Ctrl+K 搜索</button>
            <button class="icon-btn">📷</button>
            <button class="icon-btn">⬆</button>
            <button class="icon-btn">⚙</button>
            <div class="user-info">
                <span class="user-avatar">👤</span>
                <span class="user-name">XXX</span>
            </div>
        </div>
    </div>

    <div class="layout-container">
        <!-- 左侧菜单 -->
        <div class="sidebar" id="sidebar">
            <div class="sidebar-header">
                <div class="sidebar-title">功能菜单</div>
            </div>
            <div class="tree-menu">
                <!-- 采购管理 -->
                <div class="menu-group">
                    <div class="menu-group-title" onclick="toggleMenuGroup(this)">
                        <span class="menu-icon">📦</span>
                        <span class="menu-text">采购管理</span>
                        <span class="menu-arrow">▼</span>
                    </div>
                    <div class="menu-group-content">
                        <div class="menu-item" onclick="navigateTo('sku-detail.html')">
                            <span class="menu-dot">•</span>
                            <span class="menu-text">采销SKU明细</span>
                            <span class="menu-badge">600</span>
                        </div>
                        <!-- 标记当前页面为active -->
                        <div class="menu-item active" onclick="navigateTo('purchase-contract.html')">
                            <span class="menu-dot">•</span>
                            <span class="menu-text">采销合同</span>
                            <span class="menu-badge">4</span>
                        </div>
                    </div>
                </div>
                <!-- 其他菜单组... -->
            </div>
        </div>

        <!-- 主内容区域 -->
        <div class="main-content">
            <div class="content-wrapper">
                <!-- 原有的合同内容 -->
            </div>
        </div>
    </div>
    
    <script src="../js/main.js"></script>
    <script src="../js/purchase-contract.js"></script>
</body>
</html>
```

## 🔍 关键变化对照表

| 项目 | 旧版 | 新版 |
|------|------|------|
| 顶部导航 | `.top-nav` | `.top-header` |
| 主容器 | `.container` | `.layout-container` |
| 内容区域 | 直接在容器内 | `.main-content > .content-wrapper` |
| 导航按钮 | `goBack()` | 左侧菜单导航 |
| 页面标题 | 在顶部导航中 | 在 `.system-logo` 旁边 |
| 菜单切换 | 无 | `toggleSidebar()` |

## ✅ 迁移检查清单

完成以下检查项以确保迁移成功：

- [ ] HTML结构已更新为新布局
- [ ] 顶部导航栏包含菜单切换按钮
- [ ] 左侧菜单已添加且结构完整
- [ ] 当前页面的菜单项标记为 `active`
- [ ] 页面标题已更新（包含系统名称）
- [ ] 已引入 `main.js`
- [ ] 页面内容正确嵌套在 `.content-wrapper` 中
- [ ] 已移除旧的 `goBack()` 函数
- [ ] 在浏览器中测试页面显示正常
- [ ] 测试菜单展开/收起功能
- [ ] 测试侧边栏隐藏/显示功能

## 🎯 最佳实践

1. **一次迁移一个页面**：逐个页面迁移，便于测试和排查问题
2. **复制参考页面**：使用 `sku-detail.html` 作为参考模板
3. **保持菜单一致**：所有页面使用相同的菜单结构
4. **测试导航**：确保所有菜单链接正确指向对应页面
5. **检查样式**：确保原有页面样式在新布局中正常显示

## 🐛 常见问题

### Q1: 页面内容显示不完整
**A**: 检查是否正确关闭了所有 `<div>` 标签，特别是 `.content-wrapper`、`.main-content` 和 `.layout-container`

### Q2: 菜单无法展开
**A**: 确保引入了 `main.js` 并且引入顺序在页面特定脚本之前

### Q3: 侧边栏无法切换
**A**: 检查侧边栏元素是否有 `id="sidebar"` 属性

### Q4: 菜单项不高亮
**A**: 确保为当前页面的菜单项添加了 `active` 类

### Q5: 样式错乱
**A**: 检查CSS文件路径是否正确，通常应该是 `href="../css/style.css"`

## 📂 需要迁移的页面列表

以下页面需要迁移到新布局：

- [ ] `pages/sku-detail.html` ✅ 已完成
- [ ] `pages/purchase-contract.html`
- [ ] `pages/invoice-management.html`
- [ ] `pages/contract-invoice-relation.html`
- [ ] `pages/customs-declaration-match.html`
- [ ] `pages/declaration-sku-contract-mapping.html`

## 💡 提示

如果您想批量迁移，可以：
1. 创建一个包含完整布局的模板文件
2. 编写脚本自动替换HTML结构
3. 手动验证每个页面的菜单高亮状态

---

**需要帮助？** 请参考 [TREE_MENU_GUIDE.md](./TREE_MENU_GUIDE.md) 了解更多技术细节。

