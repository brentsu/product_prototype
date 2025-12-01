// 模拟采购合同明细数据
const mockContractItemData = [
    {
        id: 1,
        checked: false,
        contractNo: 'HT202511210001',
        contractItemNo: '1',
        productName: '女士外套',
        unit: '件',
        quantity: 3,
        unitPrice: 24.40,
        amountWithoutTax: 0, // 示例中只给出含税金额，这里简化处理
        taxAmount: 0,
        amountWithTax: 73.20,
        deliveryDate: '2025-09-18',
        linkedSkuDetailCount: 2,
        createTime: '2025-08-19 10:00:00'
    },
    {
        id: 2,
        checked: false,
        contractNo: 'HT202511210001',
        contractItemNo: '2',
        productName: '泳装裤',
        unit: '件',
        quantity: 5,
        unitPrice: 38.20,
        amountWithoutTax: 0,
        taxAmount: 0,
        amountWithTax: 191.00,
        deliveryDate: '2025-09-18',
        linkedSkuDetailCount: 2,
        createTime: '2025-08-19 10:00:00'
    },
    {
        id: 3,
        checked: false,
        contractNo: 'HT202511210001',
        contractItemNo: '3',
        productName: '泳装套装',
        unit: '件',
        quantity: 18,
        unitPrice: 32.80,
        amountWithoutTax: 0,
        taxAmount: 0,
        amountWithTax: 590.40,
        deliveryDate: '2025-09-18',
        linkedSkuDetailCount: 3,
        createTime: '2025-08-19 10:00:00'
    }
];

// 当前数据和状态
let currentContractItemData = [...mockContractItemData];
let currentItemPage = 1;
const pageSize = 10;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    renderContractItemTable();
    updateContractItemStats();
});

// 渲染合同明细表格
function renderContractItemTable() {
    const tbody = document.getElementById('contractItemTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    currentContractItemData.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" ${item.checked ? 'checked' : ''} onchange="toggleItemRowSelect(${index}, this)"></td>
            <td>
                <a href="#" class="action-link" onclick="viewContract('${item.contractNo}')">${item.contractNo}</a>
                <span class="copy-icon" onclick="copyToClipboard('${item.contractNo}')" title="复制">📋</span>
            </td>
            <td>${item.contractItemNo}</td>
            <td>${item.productName}</td>
            <td>${item.unit}</td>
            <td>${item.quantity}</td>
            <td>¥${item.unitPrice.toFixed(2)}</td>
            <td>¥${item.amountWithoutTax.toFixed(2)}</td>
            <td>¥${item.taxAmount.toFixed(2)}</td>
            <td class="amount-highlight">¥${item.amountWithTax.toFixed(2)}</td>
            <td>${item.deliveryDate || '-'}</td>
            <td>
                ${item.linkedSkuDetailCount > 0 ? 
                    `<a href="#" class="action-link" onclick="viewLinkedSkuDetails(${item.id})">${item.linkedSkuDetailCount} 个</a>` : 
                    '<span style="color: #999;">未关联</span>'}
            </td>
            <td>${item.createTime}</td>
            <td>
                <a href="#" class="action-link" onclick="viewContractItemDetail(${item.id})">详情</a>
                <span style="margin: 0 5px;">|</span>
                <a href="#" class="action-link" onclick="editContractItem(${item.id})">编辑</a>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// 更新统计数据
function updateContractItemStats() {
    const totalItems = currentContractItemData.length;
    const totalQuantity = currentContractItemData.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = currentContractItemData.reduce((sum, item) => sum + item.amountWithTax, 0);
    
    const statValues = document.querySelectorAll('.stat-value');
    if (statValues.length >= 3) {
        statValues[0].textContent = totalItems;
        statValues[1].textContent = totalQuantity;
        statValues[2].textContent = `¥${totalAmount.toFixed(2)}`;
    }
    
    const totalRecords = document.getElementById('totalItemRecords');
    if (totalRecords) {
        totalRecords.textContent = totalItems;
    }
}

// 全选/取消全选
function toggleSelectAllItems(checkbox) {
    currentContractItemData.forEach(item => {
        item.checked = checkbox.checked;
    });
    renderContractItemTable();
}

// 切换行选中状态
function toggleItemRowSelect(index, checkbox) {
    currentContractItemData[index].checked = checkbox.checked;
    
    // 更新全选框状态
    const checkAll = document.getElementById('checkAllItems');
    if (checkAll) {
        checkAll.checked = currentContractItemData.every(item => item.checked);
    }
}

// 获取选中的合同明细
function getSelectedContractItems() {
    return currentContractItemData.filter(item => item.checked);
}

// 查询合同明细
function queryContractItems() {
    const contractNo = document.getElementById('filterContractNo')?.value.trim() || '';
    const itemNo = document.getElementById('filterItemNo')?.value.trim() || '';
    const productName = document.getElementById('filterProductName')?.value.trim() || '';
    const supplier = document.getElementById('filterSupplier')?.value || '';
    
    // 筛选数据
    currentContractItemData = mockContractItemData.filter(item => {
        if (contractNo && !item.contractNo.includes(contractNo)) return false;
        if (itemNo && item.contractItemNo !== itemNo) return false;
        if (productName && !item.productName.includes(productName)) return false;
        // supplier筛选可以根据实际需求实现
        return true;
    });
    
    renderContractItemTable();
    updateContractItemStats();
}

// 重置筛选
function resetContractItemFilter() {
    document.getElementById('filterContractNo').value = '';
    document.getElementById('filterItemNo').value = '';
    document.getElementById('filterProductName').value = '';
    document.getElementById('filterSupplier').selectedIndex = 0;
    
    currentContractItemData = [...mockContractItemData];
    renderContractItemTable();
    updateContractItemStats();
}

// 导出合同明细数据
function exportContractItems() {
    const selectedItems = getSelectedContractItems();
    const itemsToExport = selectedItems.length > 0 ? selectedItems : currentContractItemData;
    
    // 转换为CSV格式
    const headers = ['合同编号', '合同项号', '产品名称/品类', '计量单位', '数量', '含税单价', '不含税金额', '税额', '含税金额', '交货日期', '关联SKU明细数', '创建时间'];
    const rows = itemsToExport.map(item => [
        item.contractNo,
        item.contractItemNo,
        item.productName,
        item.unit,
        item.quantity,
        item.unitPrice.toFixed(2),
        item.amountWithoutTax.toFixed(2),
        item.taxAmount.toFixed(2),
        item.amountWithTax.toFixed(2),
        item.deliveryDate || '',
        item.linkedSkuDetailCount,
        item.createTime
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `采购合同明细_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert(`已导出 ${itemsToExport.length} 条数据`);
}

// 关联SKU明细
function linkSkuDetails() {
    const selectedItems = getSelectedContractItems();
    if (selectedItems.length === 0) {
        alert('请至少选择一条合同明细记录！');
        return;
    }
    
    console.log('关联SKU明细到合同明细：', selectedItems.map(i => `${i.contractNo}-项${i.contractItemNo}`));
    alert(`正在为 ${selectedItems.length} 条合同明细关联SKU明细...`);
}

// 显示设置
function showContractItemSettings() {
    console.log('显示合同明细设置');
    alert('合同明细设置功能开发中...');
}

// 查看合同
function viewContract(contractNo) {
    console.log('查看合同：', contractNo);
    window.location.href = `purchase-contract.html?contractNo=${contractNo}`;
    return false;
}

// 查看关联的SKU明细
function viewLinkedSkuDetails(itemId) {
    const item = currentContractItemData.find(i => i.id === itemId);
    if (!item) return;
    
    console.log('查看关联的SKU明细：', item);
    alert(`合同明细：${item.contractNo}-项${item.contractItemNo}\n关联了 ${item.linkedSkuDetailCount} 个SKU明细\n点击确定查看详情`);
    // 实际应用中可以跳转到SKU明细页面并筛选
    return false;
}

// 查看合同明细详情
function viewContractItemDetail(itemId) {
    const item = currentContractItemData.find(i => i.id === itemId);
    if (!item) return;
    
    let message = `合同明细详情\n\n`;
    message += `合同编号：${item.contractNo}\n`;
    message += `合同项号：${item.contractItemNo}\n`;
    message += `SKU编码：${item.sku}\n`;
    message += `商品名称：${item.productName}\n`;
    message += `数量：${item.quantity}\n`;
    message += `单价：¥${item.unitPrice.toFixed(2)}\n`;
    message += `不含税金额：¥${item.amountWithoutTax.toFixed(2)}\n`;
    message += `税额：¥${item.taxAmount.toFixed(2)}\n`;
    message += `含税金额：¥${item.amountWithTax.toFixed(2)}\n`;
    message += `关联SKU明细数：${item.linkedSkuDetailCount}\n`;
    message += `创建时间：${item.createTime}`;
    
    alert(message);
    return false;
}

// 编辑合同明细
function editContractItem(itemId) {
    const item = currentContractItemData.find(i => i.id === itemId);
    if (!item) return;
    
    console.log('编辑合同明细：', item);
    alert(`编辑合同明细：${item.contractNo}-项${item.contractItemNo}\n编辑功能开发中...`);
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

// 上一页
function prevItemPage() {
    if (currentItemPage > 1) {
        currentItemPage--;
        document.getElementById('currentItemPage').textContent = currentItemPage;
        renderContractItemTable();
        console.log('当前页：', currentItemPage);
    }
}

// 下一页
function nextItemPage() {
    currentItemPage++;
    document.getElementById('currentItemPage').textContent = currentItemPage;
    renderContractItemTable();
    console.log('当前页：', currentItemPage);
}

// 返回首页
function goBack() {
    window.location.href = '../index.html';
}

