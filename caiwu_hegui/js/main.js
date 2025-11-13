// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function () {
    // 默认加载虚拟库存池页面
    loadPage('dashboard');
});

// 加载页面内容
async function loadPage(pageName) {
    try {
        const response = await fetch(`pages/${pageName}.html`);
        if (!response.ok) {
            throw new Error(`无法加载页面: ${pageName}`);
        }
        const html = await response.text();
        const contentContainer = document.getElementById('content-container');
        contentContainer.innerHTML = html;
    } catch (error) {
        console.error('加载页面失败:', error);
        document.getElementById('content-container').innerHTML = 
            '<div style="padding: 40px; text-align: center; color: #e74c3c;"><h3>页面加载失败</h3><p>请检查页面路径是否正确</p></div>';
    }
}

// 显示不同section
function showSection(sectionName) {
    // 移除所有菜单项的active状态
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.classList.remove('active');
    });

    // 设置当前菜单项为active
    event.currentTarget.classList.add('active');

    // 加载对应的页面
    loadPage(sectionName);

    // 更新页面标题
    const titles = {
        'dashboard': '虚拟库存池管理',
        'inventory-process': '虚拟库存池流程',
        'cost': '库存成本核算',
        'invoice': '待开票管理',
        'invoice-process': '待开票流程'
    };
    document.getElementById('page-title').textContent = titles[sectionName] || '财务合规系统';
}

// 显示成本明细
function showCostDetail(factory, sku) {
    // 显示成本明细（可以弹出模态框或跳转到详情页）
    if (arguments.length === 2) {
        alert('查看 ' + factory + ' + ' + sku + ' 的成本明细\n\n此功能可以展示该工厂+SKU组合的完整成本计算历史记录，包括所有采购单的入库记录如何被加权平均合并计算。');
    } else {
        // 兼容旧的调用方式
        alert('查看库存ID ' + factory + ' 的成本明细\n\n此功能可以展示该SKU的完整成本计算历史记录');
    }
    // 实际应用中，这里可以：
    // 1. 弹出模态框显示详细的成本计算记录
    // 2. 跳转到专门的成本详情页面
    // 3. 在当前页面展开详细信息
}

