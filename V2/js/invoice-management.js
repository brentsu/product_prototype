// 模拟进项发票数据
const mockInputInvoices = [
    {
        id: 1,
        invoiceCode: '40313160',
        invoiceNo: '25352000',
        invoiceDate: '2025-09-05',
        buyer: '福建新时颖潮牌品牌运营有限公司',
        seller: '广州纤依服饰有限公司（460工厂）',
        amountWithoutTax: '¥ 200,000',
        taxRate: '13%',
        taxAmount: '¥ 26,000',
        totalAmount: '¥ 226,000',
        invoiceStatus: '已认证',
        relatedContractNo: 'HT202511210001',
        belongMonth: '2025-09',
        bgColor: '#f0f8ff'
    },
    {
        id: 2,
        invoiceCode: '40313161',
        invoiceNo: '25352001',
        invoiceDate: '2025-11-16',
        buyer: '福建新时颖潮牌品牌运营有限公司',
        seller: '广州纤依服饰有限公司（460工厂）',
        amountWithoutTax: '¥ 200,000',
        taxRate: '13%',
        taxAmount: '¥ 26,000',
        totalAmount: '¥ 226,000',
        invoiceStatus: '已认证',
        relatedContractNo: 'HT202511210002, HT202511210003',
        belongMonth: '2025-11',
        bgColor: '#fffacd'
    },
    {
        id: 3,
        invoiceCode: '40313162',
        invoiceNo: '25352002',
        invoiceDate: '2025-09-12',
        buyer: '福建新时颖潮牌品牌运营有限公司',
        seller: '广州纤依服饰有限公司（460工厂）',
        amountWithoutTax: '¥ 68,000',
        taxRate: '13%',
        taxAmount: '¥ 8,840',
        totalAmount: '¥ 76,840',
        invoiceStatus: '已认证',
        relatedContractNo: '',
        belongMonth: '2025-09',
        bgColor: '#f0f8ff'
    },
    {
        id: 4,
        invoiceCode: '40313163',
        invoiceNo: '25352003',
        invoiceDate: '2025-09-15',
        buyer: '福建新时颖潮牌品牌运营有限公司',
        seller: '广州纤依服饰有限公司（460工厂）',
        amountWithoutTax: '¥ 68,000',
        taxRate: '13%',
        taxAmount: '¥ 8,840',
        totalAmount: '¥ 76,840',
        invoiceStatus: '待认证',
        relatedContractNo: '',
        belongMonth: '2025-09',
        bgColor: '#fff9e6'
    }
];

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    renderInputInvoices();
});

// 渲染进项发票列表
function renderInputInvoices() {
    const tbody = document.getElementById('inputInvoiceBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    mockInputInvoices.forEach(item => {
        const row = document.createElement('tr');
        row.style.backgroundColor = item.bgColor;
        
        const statusClass = item.invoiceStatus === '已认证' ? 'status-completed' : 
                           item.invoiceStatus === '待认证' ? 'status-pending' : 'status-default';
        
        const contractDisplay = item.relatedContractNo ? 
            item.relatedContractNo.split(', ').map(contract => 
                `<a href="#" class="action-link" onclick="viewContract('${contract}')">${contract}</a>`
            ).join(', ') : 
            '<span style="color: #999;">未关联</span>';
        
        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.invoiceCode}</td>
            <td>${item.invoiceNo}</td>
            <td>${item.invoiceDate}</td>
            <td>${item.buyer}</td>
            <td>${item.seller}</td>
            <td>${item.amountWithoutTax}</td>
            <td>${item.taxRate}</td>
            <td>${item.taxAmount}</td>
            <td class="amount-highlight">${item.totalAmount}</td>
            <td><span class="status-badge ${statusClass}">${item.invoiceStatus}</span></td>
            <td>${contractDisplay}</td>
            <td>${item.belongMonth}</td>
            <td>
                <button class="btn btn-sm" onclick="viewInvoiceDetail(${item.id})">查看详情</button>
                <button class="btn btn-primary btn-sm" onclick="matchToInvoice(${item.id})">关联合同</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// 登记发票
function registerInvoice() {
    console.log('登记发票');
    alert('打开发票登记表单...');
}

// 批量导入发票
function batchImportInvoice() {
    console.log('批量导入发票');
    alert('打开批量导入界面...');
}

// 导出进项发票数据
function exportInvoiceData() {
    console.log('导出进项发票数据');
    alert('正在导出进项发票数据...');
}

// 查看进项发票详情
function viewInvoiceDetail(id) {
    console.log('查看进项发票详情:', id);
    alert(`查看进项发票 ID: ${id} 的详情`);
}

// 关联到合同
function matchToInvoice(id) {
    console.log('关联发票到合同:', id);
    alert(`将进项发票 ID: ${id} 关联到合同`);
}

// 查看合同
function viewContract(contractNo) {
    console.log('查看合同:', contractNo);
    alert(`查看合同详情：${contractNo}\n点击确定跳转到合同管理页面`);
    // 实际应用中可以跳转到合同详情页
    // window.location.href = `purchase-contract.html?contractNo=${contractNo}`;
    return false;
}

// 返回首页
function goBack() {
    window.location.href = '../index.html';
}


