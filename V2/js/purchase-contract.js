// 模拟采销合同数据
const mockContractData = [
    {
        id: 1,
        checked: false,
        contractNo: 'HT202511210001',
        signLink: '链接地址',
        status: '签署完成',
        supplierName: '广州XX服饰有限公司',
        buyerName: '福建新时颖潮牌品牌运营有限公司',
        quantity: '200',
        amountWithoutTax: '¥ 13,327',
        taxAmount: '¥ 1,733',
        totalAmount: 15060,
        factorySignDoc: '已签署',
        companySignDoc: '已签署',
        createTime: '2025-11-24 10:00:00',
        auditTime: '2025-11-24 14:30:00',
        companySignTime: '2025-11-24 16:00:00',
        relatedInvoiceNo: '25352000',
        invoiceAttachment: '已上传',
        relatedStatementId: '100001',
        relationshipType: '一对一'
    },
    {
        id: 2,
        checked: false,
        contractNo: 'HT202511210002',
        signLink: '链接地址',
        status: '签署完成',
        supplierName: '广州XX服饰有限公司',
        buyerName: '福建新时颖潮牌品牌运营有限公司',
        quantity: '200',
        amountWithoutTax: '¥ 13,327',
        taxAmount: '¥ 1,733',
        totalAmount: 15060,
        factorySignDoc: '已签署',
        companySignDoc: '已签署',
        createTime: '2025-11-24 09:00:00',
        auditTime: '2025-11-24 16:00:00',
        companySignTime: '2025-11-24 17:00:00',
        relatedInvoiceNo: '25352001',
        invoiceAttachment: '已上传',
        relatedStatementId: '100002',
        relationshipType: '一对一'
    },
    {
        id: 3,
        checked: false,
        contractNo: 'HT202511210003',
        signLink: '链接地址',
        status: '签署完成',
        supplierName: '深圳YY制衣厂',
        buyerName: '福建新时颖潮牌品牌运营有限公司',
        quantity: '100',
        amountWithoutTax: '¥ 7,876',
        taxAmount: '¥ 1,024',
        totalAmount: 8900,
        factorySignDoc: '已签署',
        companySignDoc: '已签署',
        createTime: '2025-11-25 10:00:00',
        auditTime: '2025-11-25 15:00:00',
        companySignTime: '2025-11-25 16:00:00',
        relatedInvoiceNo: '25352002',
        invoiceAttachment: '已上传',
        relatedStatementId: '100003',
        relationshipType: '一对一'
    },
    {
        id: 4,
        checked: false,
        contractNo: 'HT202511210004',
        signLink: '链接地址',
        status: '合同待生成',
        supplierName: '东莞ZZ服装厂',
        buyerName: '福建新时颖潮牌品牌运营有限公司',
        quantity: '100',
        amountWithoutTax: '¥ 2,894',
        taxAmount: '¥ 376',
        totalAmount: 3270,
        factorySignDoc: '',
        companySignDoc: '',
        createTime: '2025-11-27 11:00:00',
        auditTime: '',
        companySignTime: '',
        relatedInvoiceNo: '',
        invoiceAttachment: '',
        relatedStatementId: '100004',
        relationshipType: ''
    }
];

// 当前数据和状态
let currentContractData = [...mockContractData];
let currentTab = 'pending';
let currentContractPage = 1;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    renderContractTable();
    updateContractStats();
});

// 渲染合同表格
function renderContractTable() {
    const tbody = document.getElementById('contractTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    currentContractData.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox" ${item.checked ? 'checked' : ''} onchange="toggleContractRowSelect(${index}, this)"></td>
            <td>
                <a href="#" class="action-link" onclick="viewContractDetail('${item.contractNo}')">${item.contractNo}</a>
                <span class="copy-icon" onclick="copyToClipboard('${item.contractNo}')" title="复制">📋</span>
            </td>
            <td>
                ${item.signLink ? `<a href="#" class="action-link" onclick="openSignLink('${item.signLink}')">链接地址</a>` : '-'}
            </td>
            <td><span class="status-badge status-${getStatusClass(item.status)}">${item.status}</span></td>
            <td>${item.supplierName || '-'}</td>
            <td>${item.buyerName || '-'}</td>
            <td>${item.quantity || '-'}</td>
            <td>${item.amountWithoutTax || '-'}</td>
            <td>${item.taxAmount || '-'}</td>
            <td class="amount-highlight">${item.totalAmount ? item.totalAmount.toLocaleString() : '-'}</td>
            <td>${item.factorySignDoc ? `<a href="#" class="action-link" onclick="viewDocument('${item.factorySignDoc}')">查看</a>` : '-'}</td>
            <td>${item.companySignDoc ? `<a href="#" class="action-link" onclick="viewDocument('${item.companySignDoc}')">查看</a>` : '-'}</td>
            <td>${item.createTime || '-'}</td>
            <td>${item.auditTime || '-'}</td>
            <td class="highlight-column">${item.companySignTime || '-'}</td>
            <td class="highlight-column">
                ${item.relatedInvoiceNo ? `<a href="#" class="action-link" onclick="viewRelatedInvoice('${item.relatedInvoiceNo}')">
                    ${item.relatedInvoiceNo}
                    ${item.relationshipType ? `<span class="relation-badge">${item.relationshipType}</span>` : ''}
                </a>` : '<button class="btn btn-sm btn-primary" onclick="linkInvoice(${item.id})">关联发票</button>'}
            </td>
            <td class="highlight-column">
                ${item.invoiceAttachment ? `<a href="#" class="action-link" onclick="viewInvoice('${item.invoiceAttachment}')">查看附件</a>` : '-'}
            </td>
            <td class="highlight-column">${item.relatedStatementId || '-'}</td>
            <td>
                <a href="#" class="action-link" onclick="handleContractAction(${item.id})">预览</a>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// 获取状态样式类
function getStatusClass(status) {
    const statusMap = {
        '待审核': 'pending',
        '审核不通过': 'rejected',
        '签署中': 'signing',
        '签署完成': 'completed',
        '已拒签': 'refused',
        '已撤销': 'cancelled',
        '解约中': 'terminating',
        '已解约': 'terminated',
        '已过期': 'expired'
    };
    return statusMap[status] || 'default';
}

// 更新统计数据
function updateContractStats() {
    const totalRecords = document.getElementById('totalRecords');
    if (totalRecords) {
        totalRecords.textContent = currentContractData.length;
    }
}

// 切换标签页
function switchTab(tabStatus) {
    currentTab = tabStatus;
    
    // 更新标签页样式
    const tabs = document.querySelectorAll('.tab-item');
    tabs.forEach(tab => {
        if (tab.getAttribute('data-status') === tabStatus) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // 根据状态筛选数据
    if (tabStatus === 'all') {
        currentContractData = [...mockContractData];
    } else {
        const statusMap = {
            'pending': '待审核',
            'rejected': '审核不通过',
            'signing': '签署中',
            'completed': '签署完成',
            'refused': '已拒签',
            'cancelled': '已撤销',
            'terminating': '解约中',
            'terminated': '已解约',
            'expired': '已过期'
        };
        const statusName = statusMap[tabStatus];
        currentContractData = mockContractData.filter(item => item.status === statusName);
    }
    
    renderContractTable();
    updateContractStats();
}

// 全选/取消全选
function toggleSelectAllContracts(checkbox) {
    currentContractData.forEach(item => {
        item.checked = checkbox.checked;
    });
    renderContractTable();
}

// 切换行选中状态
function toggleContractRowSelect(index, checkbox) {
    currentContractData[index].checked = checkbox.checked;
    
    // 更新全选框状态
    const checkAll = document.getElementById('checkAllContracts');
    if (checkAll) {
        checkAll.checked = currentContractData.every(item => item.checked);
    }
}

// 获取选中的合同
function getSelectedContracts() {
    return currentContractData.filter(item => item.checked);
}

// 查询合同
function queryContracts() {
    console.log('查询合同...');
    const contractNo = document.getElementById('contractNoInput').value;
    const supplier = document.getElementById('supplierSelect').value;
    const buyer = document.getElementById('buyerSelect').value;
    const status = document.getElementById('statusSelect').value;
    const audit = document.getElementById('auditSelect').value;
    
    console.log('筛选条件：', { contractNo, supplier, buyer, status, audit });
    
    // 这里可以添加实际的筛选逻辑
    renderContractTable();
    updateContractStats();
}

// 重置筛选
function resetContractFilter() {
    document.getElementById('contractNoInput').value = '';
    document.getElementById('supplierSelect').selectedIndex = 0;
    document.getElementById('buyerSelect').selectedIndex = 0;
    document.getElementById('statusSelect').selectedIndex = 0;
    document.getElementById('auditSelect').selectedIndex = 0;
    
    currentContractData = [...mockContractData];
    renderContractTable();
    updateContractStats();
}

// 清除筛选
function clearContractFilter() {
    resetContractFilter();
}

// 审核通过
function approveContracts() {
    const selectedContracts = getSelectedContracts();
    if (selectedContracts.length === 0) {
        alert('请至少选择一条合同记录！');
        return;
    }
    
    console.log('审核通过合同：', selectedContracts.map(c => c.contractNo));
    alert(`正在审核通过 ${selectedContracts.length} 条合同...`);
}

// 审核不通过
function rejectContracts() {
    const selectedContracts = getSelectedContracts();
    if (selectedContracts.length === 0) {
        alert('请至少选择一条合同记录！');
        return;
    }
    
    const reason = prompt('请输入审核不通过的原因：');
    if (reason) {
        console.log('审核不通过合同：', selectedContracts.map(c => c.contractNo), '原因：', reason);
        alert(`已标记 ${selectedContracts.length} 条合同为审核不通过`);
    }
}

// 导出合同文件
function exportContractFiles() {
    const selectedContracts = getSelectedContracts();
    if (selectedContracts.length === 0) {
        alert('请至少选择一条合同记录！');
        return;
    }
    
    console.log('导出合同文件：', selectedContracts.map(c => c.contractNo));
    alert(`正在导出 ${selectedContracts.length} 个合同文件，请稍候...`);
}

// 显示合同设置
function showContractSettings() {
    console.log('显示合同设置');
    alert('合同设置功能开发中...');
}

// 查看合同详情
function viewContractDetail(contractNo) {
    console.log('查看合同详情：', contractNo);
    alert(`查看合同 ${contractNo} 的详细信息`);
    return false;
}

// 打开签署链接
function openSignLink(link) {
    console.log('打开签署链接：', link);
    alert('打开电子签署链接...');
    return false;
}

// 查看文档
function viewDocument(docId) {
    console.log('查看文档：', docId);
    alert(`查看文档：${docId}`);
    return false;
}

// 查看发票
function viewInvoice(invoiceId) {
    console.log('查看发票：', invoiceId);
    alert(`查看发票附件：${invoiceId}`);
    return false;
}

// 合同操作
function handleContractAction(contractId) {
    console.log('预览合同：', contractId);
    alert(`预览合同 ID: ${contractId}`);
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
function prevContractPage() {
    if (currentContractPage > 1) {
        currentContractPage--;
        document.getElementById('currentPage').textContent = currentContractPage;
        renderContractTable();
        console.log('当前页：', currentContractPage);
    }
}

// 下一页
function nextContractPage() {
    currentContractPage++;
    document.getElementById('currentPage').textContent = currentContractPage;
    renderContractTable();
    console.log('当前页：', currentContractPage);
}

// 查看关联发票
function viewRelatedInvoice(invoiceNo) {
    console.log('查看关联发票：', invoiceNo);
    alert(`查看关联的发票：${invoiceNo}\n点击确定跳转到发票管理页面`);
    // 实际应用中可以跳转到发票详情页
    // window.location.href = `invoice-management.html?invoiceNo=${invoiceNo}`;
    return false;
}

// 关联发票
function linkInvoice(contractId) {
    console.log('关联发票到合同：', contractId);
    const invoiceNo = prompt('请输入要关联的发票编号：');
    if (invoiceNo) {
        const relationshipType = confirm('是否为"一对一"关系？\n点击"确定"为一对一，点击"取消"为多对一') ? '一对一' : '多对一';
        console.log(`合同 ${contractId} 关联发票 ${invoiceNo}，关系类型：${relationshipType}`);
        alert(`已将发票 ${invoiceNo} 关联到合同，关系类型：${relationshipType}`);
        
        // 实际应用中应该调用API更新数据
        // updateContractInvoiceRelation(contractId, invoiceNo, relationshipType);
    }
    return false;
}

// 返回首页
function goBack() {
    window.location.href = '../index.html';
}

