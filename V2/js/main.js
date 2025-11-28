// ==================== 导航功能 ====================
// 导航到指定页面
function navigateTo(page) {
    console.log('导航到：', page);
    window.location.href = page;
}

// ==================== 左侧菜单控制 ====================
// 切换侧边栏显示/隐藏
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (sidebar && mainContent) {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
        
        // 保存状态到localStorage
        const isCollapsed = sidebar.classList.contains('collapsed');
        localStorage.setItem('sidebarCollapsed', isCollapsed);
    }
}

// 切换菜单组展开/收起
function toggleMenuGroup(element) {
    const content = element.nextElementSibling;
    const arrow = element.querySelector('.menu-arrow');
    
    if (content && arrow) {
        // 切换当前菜单组
        element.classList.toggle('collapsed');
        content.classList.toggle('collapsed');
        
        // 保存展开状态
        const groupText = element.querySelector('.menu-text').textContent;
        const isCollapsed = element.classList.contains('collapsed');
        saveMenuGroupState(groupText, isCollapsed);
    }
}

// 保存菜单组展开状态
function saveMenuGroupState(groupName, isCollapsed) {
    const states = JSON.parse(localStorage.getItem('menuGroupStates') || '{}');
    states[groupName] = isCollapsed;
    localStorage.setItem('menuGroupStates', JSON.stringify(states));
}

// 恢复菜单组展开状态
function restoreMenuGroupStates() {
    const states = JSON.parse(localStorage.getItem('menuGroupStates') || '{}');
    
    document.querySelectorAll('.menu-group-title').forEach(title => {
        const groupText = title.querySelector('.menu-text').textContent;
        const isCollapsed = states[groupText];
        
        if (isCollapsed === true) {
            title.classList.add('collapsed');
            const content = title.nextElementSibling;
            if (content) {
                content.classList.add('collapsed');
            }
        }
    });
}

// 高亮当前激活的菜单项
function highlightCurrentMenu() {
    const currentPath = window.location.pathname;
    
    document.querySelectorAll('.menu-item').forEach(item => {
        const onclick = item.getAttribute('onclick');
        if (onclick && onclick.includes(currentPath)) {
            item.classList.add('active');
            
            // 展开父菜单组
            const parentGroup = item.closest('.menu-group');
            if (parentGroup) {
                const groupTitle = parentGroup.querySelector('.menu-group-title');
                const groupContent = parentGroup.querySelector('.menu-group-content');
                if (groupTitle && groupContent) {
                    groupTitle.classList.remove('collapsed');
                    groupContent.classList.remove('collapsed');
                    groupTitle.classList.add('active');
                }
            }
        }
    });
}

// ==================== 快捷操作 ====================
function quickAction(action) {
    console.log('快捷操作：', action);
    
    switch(action) {
        case 'new-contract':
            alert('新建合同功能开发中...');
            break;
        case 'new-invoice':
            alert('开具发票功能开发中...');
            break;
        case 'export-data':
            alert('导出数据功能开发中...');
            break;
        case 'settings':
            alert('系统设置功能开发中...');
            break;
        default:
            console.log('未知操作');
    }
}

// ==================== 页面初始化 ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('财务合规管理系统 V2 已加载');
    
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
    
    // 添加卡片悬停效果
    const cards = document.querySelectorAll('.module-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // 键盘快捷键 - Ctrl+B 切换侧边栏
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'b') {
            e.preventDefault();
            toggleSidebar();
        }
    });
});
