// ==================== 布局组件加载 ====================
// 加载HTML片段的辅助函数
async function loadHTMLFragment(url, targetId) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const html = await response.text();
        const target = document.getElementById(targetId);
        if (target) {
            target.innerHTML = html;
        }
    } catch (error) {
        console.error(`加载 ${url} 失败:`, error);
    }
}

// 初始化页面布局（适用于内页）
async function initPageLayout() {
    // 创建布局容器
    const body = document.body;
    
    // 如果页面没有布局容器，创建一个
    if (!document.querySelector('.layout-container')) {
        // 保存原有内容
        const originalContent = body.innerHTML;
        
        // 创建新布局
        body.innerHTML = `
            <!-- 顶部导航栏 -->
            <div class="top-header">
                <div class="header-left">
                    <button class="menu-toggle" onclick="toggleSidebar()">☰</button>
                    <div class="system-logo">财务合规管理系统 V2</div>
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

                    <!-- 树状菜单 -->
                    <div class="tree-menu">
                        <!-- 采购管理 -->
                        <div class="menu-group">
                            <div class="menu-group-title" onclick="toggleMenuGroup(this)">
                                <span class="menu-icon">📦</span>
                                <span class="menu-text">采购管理</span>
                                <span class="menu-arrow">▼</span>
                            </div>
                            <div class="menu-group-content">
                                <div class="menu-item" onclick="navigateTo('sku-detail.html')" data-page="sku-detail">
                                    <span class="menu-dot">•</span>
                                    <span class="menu-text">采销SKU明细</span>
                                    <span class="menu-badge">600</span>
                                </div>
                                <div class="menu-item" onclick="navigateTo('purchase-contract.html')" data-page="purchase-contract">
                                    <span class="menu-dot">•</span>
                                    <span class="menu-text">采销合同</span>
                                    <span class="menu-badge">4</span>
                                </div>
                            </div>
                        </div>

                        <!-- 发票管理 -->
                        <div class="menu-group">
                            <div class="menu-group-title" onclick="toggleMenuGroup(this)">
                                <span class="menu-icon">🧾</span>
                                <span class="menu-text">发票管理</span>
                                <span class="menu-arrow">▼</span>
                            </div>
                            <div class="menu-group-content">
                                <div class="menu-item" onclick="navigateTo('invoice-management.html')" data-page="invoice-management">
                                    <span class="menu-dot">•</span>
                                    <span class="menu-text">进项发票列表</span>
                                    <span class="menu-badge">4</span>
                                </div>
                                <div class="menu-item" onclick="navigateTo('contract-invoice-relation.html')" data-page="contract-invoice-relation">
                                    <span class="menu-dot">•</span>
                                    <span class="menu-text">合同-发票关联</span>
                                    <span class="menu-badge">3</span>
                                </div>
                            </div>
                        </div>

                        <!-- 报关管理 -->
                        <div class="menu-group">
                            <div class="menu-group-title" onclick="toggleMenuGroup(this)">
                                <span class="menu-icon">🚢</span>
                                <span class="menu-text">报关管理</span>
                                <span class="menu-arrow">▼</span>
                            </div>
                            <div class="menu-group-content">
                                <div class="menu-item menu-item-helper" onclick="navigateTo('customs-declaration-match.html')" data-page="customs-declaration-match">
                                    <span class="menu-dot">ℹ</span>
                                    <span class="menu-text">报关匹配管理</span>
                                    <span class="menu-helper-label">说明</span>
                                </div>
                                <div class="menu-item" onclick="navigateTo('declaration-sku-contract-mapping.html')" data-page="declaration-sku-contract-mapping">
                                    <span class="menu-dot">•</span>
                                    <span class="menu-text">三方映射关系</span>
                                    <span class="menu-badge">5</span>
                                </div>
                            </div>
                        </div>

                        <!-- 返回首页 -->
                        <div class="menu-group">
                            <div class="menu-item" onclick="navigateTo('../index.html')" data-page="home" style="border-top: 1px solid rgba(255,255,255,0.1); margin-top: 10px; padding-top: 15px;">
                                <span class="menu-icon">🏠</span>
                                <span class="menu-text">返回首页</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 主内容区域 -->
                <div class="main-content">
                    <div class="content-wrapper" id="page-content">
                        ${originalContent}
                    </div>
                </div>
            </div>
        `;
    }
    
    // 初始化布局功能
    initLayoutFeatures();
}

// 初始化布局功能
function initLayoutFeatures() {
    // 恢复侧边栏状态
    const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (sidebarCollapsed) {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.querySelector('.main-content');
        if (sidebar && mainContent) {
            sidebar.classList.add('collapsed');
            mainContent.classList.add('expanded');
        }
    }
    
    // 恢复菜单组展开状态
    restoreMenuGroupStates();
    
    // 高亮当前菜单项
    highlightCurrentMenu();
}

// 自动初始化（如果页面已经有container但没有新布局）
document.addEventListener('DOMContentLoaded', function() {
    // 检查是否需要初始化布局
    const hasOldContainer = document.querySelector('.container');
    const hasNewLayout = document.querySelector('.layout-container');
    
    if (hasOldContainer && !hasNewLayout) {
        // 旧版布局，需要升级
        console.log('检测到旧版布局，准备升级...');
        // 这里不自动升级，等待手动调用
    } else if (hasNewLayout) {
        // 新版布局，初始化功能
        console.log('新版布局已加载，初始化功能...');
        initLayoutFeatures();
    }
});

