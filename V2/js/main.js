// 导航到指定页面
function navigateTo(page) {
    console.log('导航到：', page);
    window.location.href = page;
}

// 快捷操作
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

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('财务合规管理系统 V2 已加载');
    
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
});
