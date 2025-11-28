// 模拟数据
const mockData = [
    {
        id: 1,
        checked: false,
        productCode: 'LC788786',
        productType: '女装->女士上衣->外套',
        category: '女士外套',
        launchDate: '2025-11-24',
        purchaseNo: 'PO00000001',
        receiveNo: 'JH200000011',
        skuCode: 'LC788786-P3010-XL',
        unitPrice: 75.30,
        quantity: 100,
        totalAmount: 7530,
        deliveredQty: 0,
        returnQty: 0,
        availableQty: 100,
        contractNo: 'HT202511210001',
        detailStatus: '合同签署完成',
        isInvoiced: '已开票',
        relatedStatementId: '100001',
        supplierCode: 'SYC0001',
        purchaseEntity: '采购主体A',
        detailCreateTime: '2025-11-24 09:53:02'
    },
    {
        id: 2,
        checked: false,
        productCode: 'LC788786',
        productType: '女装->女士上衣->外套',
        category: '女士外套',
        launchDate: '2025-11-24',
        purchaseNo: 'PO00000001',
        receiveNo: 'JH200000011',
        skuCode: 'LC788786-P3010-2XL',
        unitPrice: 75.30,
        quantity: 200,
        totalAmount: 15060,
        deliveredQty: 100,
        returnQty: 20,
        availableQty: 80,
        contractNo: 'HT202511210001',
        detailStatus: '合同签署完成',
        isInvoiced: '已开票',
        relatedStatementId: '100001',
        supplierCode: 'SYC0001',
        purchaseEntity: '采购主体A',
        detailCreateTime: '2025-11-24 09:53:02'
    },
    {
        id: 3,
        checked: false,
        productCode: 'LC788786',
        productType: '女装->女士上衣->外套',
        category: '女士外套',
        launchDate: '2025-11-23',
        purchaseNo: 'PO00000002',
        receiveNo: 'JH200000022',
        skuCode: 'LC788786-P3010-S',
        unitPrice: 75.30,
        quantity: 100,
        totalAmount: 7530,
        deliveredQty: 0,
        returnQty: 0,
        availableQty: 100,
        contractNo: 'HT202511210002',
        detailStatus: '合同签署完成',
        isInvoiced: '已开票',
        relatedStatementId: '100001',
        supplierCode: 'SYC0001',
        purchaseEntity: '采购主体A',
        detailCreateTime: '2025-11-24 09:53:02'
    },
    {
        id: 4,
        checked: false,
        productCode: 'LC628573',
        productType: '女装->女士下装->裤装',
        category: '裤装套装',
        launchDate: '2025-11-23',
        purchaseNo: 'PO00000003',
        receiveNo: 'JH200000033',
        skuCode: 'LC628573-P105-M',
        unitPrice: 89,
        quantity: 500,
        totalAmount: 44500,
        deliveredQty: 0,
        returnQty: 0,
        availableQty: 500,
        contractNo: 'HT202511210003',
        detailStatus: '合同签署完成',
        isInvoiced: '未开票',
        relatedStatementId: '100002',
        supplierCode: 'SYC0002',
        purchaseEntity: '采购主体A',
        detailCreateTime: '2025-11-25 15:53:22'
    },
    {
        id: 5,
        checked: false,
        productCode: 'MC25002',
        productType: '男装->男士上衣->T恤',
        category: '男士T恤',
        launchDate: '2025-11-21',
        purchaseNo: 'PO00000004',
        receiveNo: 'JH200000044',
        skuCode: 'MC25002-P2-L',
        unitPrice: 32.7,
        quantity: 100,
        totalAmount: 3270,
        deliveredQty: 0,
        returnQty: 0,
        availableQty: 100,
        contractNo: 'HT202511210004',
        detailStatus: '合同待生成',
        isInvoiced: '',
        relatedStatementId: '100003',
        supplierCode: 'SYC0003',
        purchaseEntity: '采购主体A',
        detailCreateTime: '2025-11-27 15:53:22'
    }
];

// 当前页面数据
let currentData = [...mockData];
let currentPage = 1;
const pageSize = 10;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    renderTable();
    updateStatistics();
});

// 渲染表格
function renderTable() {
    const tbody = document.getElementById('dataTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    currentData.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" ${item.checked ? 'checked' : ''} onchange="toggleRowSelect(${index}, this)"></td>
            <td>
                <div class="product-img">📦</div>
            </td>
            <td>${item.productCode}</td>
            <td>${item.productType}</td>
            <td>${item.category}</td>
            <td>${item.launchDate}</td>
            <td>${item.purchaseNo}</td>
            <td>${item.receiveNo}</td>
            <td>
                ${item.skuCode}
                <span class="copy-icon" onclick="copyToClipboard('${item.skuCode}')" title="复制">📋</span>
            </td>
            <td>${item.unitPrice}</td>
            <td>${item.quantity}</td>
            <td>${item.totalAmount}</td>
            <td class="highlight-value">${item.returnQty}</td>
            <td class="highlight-value">${item.availableQty}</td>
            <td>
                ${item.contractNo ? `<a href="#" class="action-link" onclick="viewContract('${item.contractNo}')">${item.contractNo}</a>` : '-'}
            </td>
            <td>${item.detailStatus}</td>
            <td>${item.isInvoiced || '-'}</td>
            <td>${item.relatedStatementId}</td>
            <td>${item.supplierCode}</td>
            <td>${item.purchaseEntity}</td>
            <td>${item.detailCreateTime}</td>
            <td><a href="#" class="action-link" onclick="viewDetail(${item.id})">日志</a></td>
        `;
        tbody.appendChild(row);
    });
}

// 更新统计数据
function updateStatistics() {
    const totalQty = currentData.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = currentData.reduce((sum, item) => sum + item.totalAmount, 0);
    
    const statValues = document.querySelectorAll('.stat-value');
    if (statValues.length >= 2) {
        statValues[0].textContent = totalQty;
        statValues[1].textContent = totalAmount;
    }
}

// 全选/取消全选
function toggleSelectAll(checkbox) {
    currentData.forEach(item => {
        item.checked = checkbox.checked;
    });
    renderTable();
}

// 切换行选中状态
function toggleRowSelect(index, checkbox) {
    currentData[index].checked = checkbox.checked;
    
    // 更新全选框状态
    const checkAll = document.getElementById('checkAll');
    if (checkAll) {
        checkAll.checked = currentData.every(item => item.checked);
    }
}

// 获取选中的行
function getSelectedRows() {
    return currentData.filter(item => item.checked);
}

// 查询数据
function queryData() {
    // 这里可以添加筛选逻辑
    console.log('查询数据...');
    renderTable();
    updateStatistics();
}

// 重置筛选
function resetFilter() {
    const inputs = document.querySelectorAll('.filter-input');
    const selects = document.querySelectorAll('.filter-select');
    
    inputs.forEach(input => input.value = '');
    selects.forEach(select => select.selectedIndex = 0);
    
    currentData = [...mockData];
    renderTable();
    updateStatistics();
}

// 清除筛选
function clearFilter() {
    resetFilter();
}

// 自动生成合同
function autoGenerateContract() {
    const selectedRows = getSelectedRows();
    if (selectedRows.length === 0) {
        alert('请至少选择一条记录！');
        return;
    }
    
    console.log('自动生成合同，选中记录数：', selectedRows.length);
    alert(`正在为${selectedRows.length}条记录自动生成合同...`);
}

// 手动生成合同
function manualGenerateContract() {
    const selectedRows = getSelectedRows();
    if (selectedRows.length === 0) {
        alert('请至少选择一条记录！');
        return;
    }
    
    console.log('手动生成合同，选中记录数：', selectedRows.length);
    alert(`正在为${selectedRows.length}条记录手动生成合同...`);
}

// 导出数据
function exportData() {
    console.log('导出数据...');
    alert('正在导出数据，请稍候...');
    
    // 模拟导出功能
    setTimeout(() => {
        console.log('数据导出完成');
    }, 1000);
}

// 显示设置
function showSettings() {
    console.log('显示设置面板');
    alert('设置功能开发中...');
}

// 查看详情
function viewDetail(id) {
    console.log('查看详情，ID：', id);
    alert(`查看记录 ID: ${id} 的日志`);
    return false;
}

// 查看合同
function viewContract(contractNo) {
    console.log('查看合同，合同编号：', contractNo);
    alert(`查看合同详情：${contractNo}`);
    return false;
}

// 复制到剪贴板
function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            console.log('复制成功：', text);
            showToast('复制成功！');
        }).catch(err => {
            console.error('复制失败：', err);
            fallbackCopyToClipboard(text);
        });
    } else {
        fallbackCopyToClipboard(text);
    }
}

// 备用复制方法
function fallbackCopyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
        console.log('复制成功：', text);
        showToast('复制成功！');
    } catch (err) {
        console.error('复制失败：', err);
        showToast('复制失败，请手动复制');
    }
    
    document.body.removeChild(textarea);
}

// 显示提示信息
function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #52c41a;
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        z-index: 9999;
        animation: fadeInOut 2s ease-in-out;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        document.body.removeChild(toast);
    }, 2000);
}

// 添加淡入淡出动画
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translateY(-10px); }
        10% { opacity: 1; transform: translateY(0); }
        90% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(-10px); }
    }
`;
document.head.appendChild(style);

// 上一页
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
        console.log('当前页：', currentPage);
    }
}

// 下一页
function nextPage() {
    currentPage++;
    renderTable();
    console.log('当前页：', currentPage);
}

// 返回首页
function goBack() {
    console.log('返回首页');
    window.history.back();
}

