// 模拟待开票数据
const mockPendingInvoices = [
    {
        id: 1,
        inventoryId: 1,
        businessType: '采购入库',
        purchaseNo: 'PO-1235',
        returnNo: '-',
        sku: 'LC001-1-L',
        factory: '460工厂',
        quantity: '10,000',
        amountWithoutTax: '¥ 200,000',
        taxRate: '13%',
        taxAmount: '¥ 26,000',
        totalAmount: '¥ 226,000',
        matchedAmount: '¥ 226,000',
        remainingAmount: '¥ 0',
        matchStatus: '已完全匹配',
        createTime: '2025-09-01',
        bgColor: '#f0f8ff'
    },
    {
        id: 2,
        inventoryId: 2,
        businessType: '采购入库',
        purchaseNo: 'PO-1368',
        returnNo: '-',
        sku: 'LC001-1-L',
        factory: '460工厂',
        quantity: '5,000',
        amountWithoutTax: '¥ 110,000',
        taxRate: '13%',
        taxAmount: '¥ 14,300',
        totalAmount: '¥ 124,300',
        matchedAmount: '¥ 124,300',
        remainingAmount: '¥ 0',
        matchStatus: '已完全匹配',
        createTime: '2025-11-15',
        bgColor: '#fffacd'
    },
    {
        id: 3,
        inventoryId: 3,
        businessType: '采购入库',
        purchaseNo: 'PO-1235',
        returnNo: '-',
        sku: 'LC001-1-XL',
        factory: '460工厂',
        quantity: '10,000',
        amountWithoutTax: '¥ 200,000',
        taxRate: '13%',
        taxAmount: '¥ 26,000',
        totalAmount: '¥ 226,000',
        matchedAmount: '¥ 101,700',
        remainingAmount: '¥ 124,300',
        matchStatus: '部分匹配',
        createTime: '2025-09-01',
        bgColor: '#fffacd'
    },
    {
        id: 4,
        inventoryId: 4,
        businessType: '采购入库',
        purchaseNo: 'PO-1342',
        returnNo: '-',
        sku: 'LC002-M',
        factory: '460工厂',
        quantity: '8,000',
        amountWithoutTax: '¥ 136,000',
        taxRate: '13%',
        taxAmount: '¥ 17,680',
        totalAmount: '¥ 153,680',
        matchedAmount: '¥ 153,680',
        remainingAmount: '¥ 0',
        matchStatus: '已完全匹配',
        createTime: '2025-09-10',
        bgColor: '#f0f8ff'
    }
];

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
        matchedAmount: '¥ 226,000',
        remainingAmount: '¥ 0',
        invoiceStatus: '已认证',
        matchStatus: '已完全匹配',
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
        matchedAmount: '¥ 226,000',
        remainingAmount: '¥ 0',
        invoiceStatus: '已认证',
        matchStatus: '已完全匹配',
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
        matchedAmount: '¥ 76,840',
        remainingAmount: '¥ 0',
        invoiceStatus: '已认证',
        matchStatus: '已完全匹配',
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
        matchedAmount: '¥ 76,840',
        remainingAmount: '¥ 0',
        invoiceStatus: '已认证',
        matchStatus: '已完全匹配',
        belongMonth: '2025-09',
        bgColor: '#f0f8ff'
    }
];

// 模拟匹配记录数据
const mockMatchingRecords = [
    {
        id: 1,
        pendingId: 1,
        purchaseNo: 'PO-1235',
        sku: 'LC001-1-L',
        invoiceId: 1,
        invoiceNo: '25352000',
        matchAmount: '¥ 226,000',
        matchRatio: '100%',
        matchTime: '2025-09-05 14:30',
        matchUser: '张三',
        remark: '完全匹配（一对一）',
        bgColor: '#f0f8ff'
    },
    {
        id: 2,
        pendingId: 2,
        purchaseNo: 'PO-1368',
        sku: 'LC001-1-L',
        invoiceId: 2,
        invoiceNo: '25352001',
        matchAmount: '¥ 124,300',
        matchRatio: '55%',
        matchTime: '2025-11-16 15:20',
        matchUser: '张三',
        remark: '合开发票（1张发票匹配2个待开票记录）',
        bgColor: '#fffacd'
    },
    {
        id: 3,
        pendingId: 3,
        purchaseNo: 'PO-1235',
        sku: 'LC001-1-XL',
        invoiceId: 2,
        invoiceNo: '25352001',
        matchAmount: '¥ 101,700',
        matchRatio: '45%',
        matchTime: '2025-11-16 15:21',
        matchUser: '张三',
        remark: '合开发票（1张发票匹配2个待开票记录）',
        bgColor: '#fffacd'
    },
    {
        id: 4,
        pendingId: 4,
        purchaseNo: 'PO-1342',
        sku: 'LC002-M',
        invoiceId: 3,
        invoiceNo: '25352002',
        matchAmount: '¥ 76,840',
        matchRatio: '50%',
        matchTime: '2025-09-12 10:20',
        matchUser: '李四',
        remark: '分开发票（1个待开票用2张发票匹配）',
        bgColor: '#f0f8ff'
    },
    {
        id: 5,
        pendingId: 4,
        purchaseNo: 'PO-1342',
        sku: 'LC002-M',
        invoiceId: 4,
        invoiceNo: '25352003',
        matchAmount: '¥ 76,840',
        matchRatio: '50%',
        matchTime: '2025-09-15 16:15',
        matchUser: '李四',
        remark: '分开发票（1个待开票用2张发票匹配）',
        bgColor: '#f0f8ff'
    }
];

// 模拟销项发票数据
const mockOutputInvoices = [
    {
        id: 1,
        invoiceNo: 'EXP-2025090001',
        invoiceDate: '2025-09-15',
        customerName: 'Amazon FBA',
        country: '美国',
        orderNo: 'FBA192RDMZPS',
        fbaShipmentId: 'FBA192RDMZPS',
        amount: '$ 15,000',
        currency: 'USD',
        invoiceType: '出口发票',
        status: '已开票',
        belongMonth: '2025-09'
    },
    {
        id: 2,
        invoiceNo: 'EXP-2025090002',
        invoiceDate: '2025-09-20',
        customerName: 'Amazon FBA',
        country: '英国',
        orderNo: 'FBA193RDMZPS',
        fbaShipmentId: 'FBA193RDMZPS',
        amount: '£ 8,500',
        currency: 'GBP',
        invoiceType: '出口发票',
        status: '已开票',
        belongMonth: '2025-09'
    }
];

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    renderPendingInvoices();
    renderInputInvoices();
    renderMatchingRecords();
    renderOutputInvoices();
});

// 渲染待开票列表
function renderPendingInvoices() {
    const tbody = document.getElementById('pendingInvoiceBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    mockPendingInvoices.forEach(item => {
        const row = document.createElement('tr');
        row.style.backgroundColor = item.bgColor;
        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.inventoryId}</td>
            <td><span class="status status-active">${item.businessType}</span></td>
            <td>${item.purchaseNo}</td>
            <td>${item.returnNo}</td>
            <td>${item.sku}</td>
            <td>${item.factory}</td>
            <td>${item.quantity}</td>
            <td>${item.amountWithoutTax}</td>
            <td>${item.taxRate}</td>
            <td>${item.taxAmount}</td>
            <td>${item.totalAmount}</td>
            <td>${item.matchedAmount}</td>
            <td>${item.remainingAmount}</td>
            <td><span class="status ${item.matchStatus === '已完全匹配' ? 'status-active' : 'status-pending'}">${item.matchStatus}</span></td>
            <td>${item.createTime}</td>
            <td>
                <button class="btn btn-sm" onclick="viewPendingDetail(${item.id})">查看</button>
                <button class="btn btn-primary btn-sm" onclick="matchInvoice(${item.id})">匹配发票</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// 渲染进项发票列表
function renderInputInvoices() {
    const tbody = document.getElementById('inputInvoiceBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    mockInputInvoices.forEach(item => {
        const row = document.createElement('tr');
        row.style.backgroundColor = item.bgColor;
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
            <td>${item.totalAmount}</td>
            <td>${item.matchedAmount}</td>
            <td>${item.remainingAmount}</td>
            <td><span class="status status-active">${item.invoiceStatus}</span></td>
            <td><span class="status status-active">${item.matchStatus}</span></td>
            <td>${item.belongMonth}</td>
            <td>
                <button class="btn btn-sm" onclick="viewInvoiceDetail(${item.id})">查看</button>
                <button class="btn btn-primary btn-sm" onclick="matchToInvoice(${item.id})">匹配</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// 渲染匹配记录列表
function renderMatchingRecords() {
    const tbody = document.getElementById('matchingRecordBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    mockMatchingRecords.forEach(item => {
        const row = document.createElement('tr');
        row.style.backgroundColor = item.bgColor;
        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.pendingId}</td>
            <td>${item.purchaseNo}</td>
            <td>${item.sku}</td>
            <td>${item.invoiceId}</td>
            <td>${item.invoiceNo}</td>
            <td>${item.matchAmount}</td>
            <td>${item.matchRatio}</td>
            <td>${item.matchTime}</td>
            <td>${item.matchUser}</td>
            <td>${item.remark}</td>
            <td>
                <button class="btn btn-sm" onclick="viewMatchDetail(${item.id})">查看</button>
                <button class="btn btn-danger btn-sm" onclick="cancelMatch(${item.id})">取消匹配</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// 渲染销项发票列表
function renderOutputInvoices() {
    const tbody = document.getElementById('outputInvoiceBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    mockOutputInvoices.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.id}</td>
            <td>${item.invoiceNo}</td>
            <td>${item.invoiceDate}</td>
            <td>${item.customerName}</td>
            <td>${item.country}</td>
            <td>${item.orderNo}</td>
            <td>${item.fbaShipmentId}</td>
            <td>${item.amount}</td>
            <td>${item.currency}</td>
            <td><span class="status status-active">${item.invoiceType}</span></td>
            <td><span class="status status-active">${item.status}</span></td>
            <td>${item.belongMonth}</td>
            <td>
                <button class="btn btn-sm" onclick="viewOutputDetail(${item.id})">查看</button>
                <button class="btn btn-sm" onclick="downloadInvoice(${item.id})">下载</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// 导出待开票数据
function exportPendingData() {
    console.log('导出待开票数据');
    alert('正在导出待开票数据...');
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

// 新增匹配
function addMatching() {
    console.log('新增匹配');
    alert('打开发票匹配界面...');
}

// 导出匹配记录
function exportMatchingData() {
    console.log('导出匹配记录');
    alert('正在导出匹配记录...');
}

// 开具发票
function issueInvoice() {
    console.log('开具发票');
    alert('打开开具发票界面...');
}

// 导出销项发票数据
function exportOutputData() {
    console.log('导出销项发票数据');
    alert('正在导出销项发票数据...');
}

// 查看待开票详情
function viewPendingDetail(id) {
    console.log('查看待开票详情:', id);
    alert(`查看待开票 ID: ${id} 的详情`);
}

// 匹配发票
function matchInvoice(id) {
    console.log('匹配发票:', id);
    alert(`为待开票 ID: ${id} 匹配进项发票`);
}

// 查看进项发票详情
function viewInvoiceDetail(id) {
    console.log('查看进项发票详情:', id);
    alert(`查看进项发票 ID: ${id} 的详情`);
}

// 匹配到发票
function matchToInvoice(id) {
    console.log('匹配到发票:', id);
    alert(`将进项发票 ID: ${id} 匹配到待开票记录`);
}

// 查看匹配详情
function viewMatchDetail(id) {
    console.log('查看匹配详情:', id);
    alert(`查看匹配记录 ID: ${id} 的详情`);
}

// 取消匹配
function cancelMatch(id) {
    const confirmed = confirm('确定要取消此匹配记录吗？');
    if (confirmed) {
        console.log('取消匹配:', id);
        alert(`已取消匹配记录 ID: ${id}`);
    }
}

// 查看销项发票详情
function viewOutputDetail(id) {
    console.log('查看销项发票详情:', id);
    alert(`查看销项发票 ID: ${id} 的详情`);
}

// 下载发票
function downloadInvoice(id) {
    console.log('下载发票:', id);
    alert(`正在下载发票 ID: ${id}...`);
}

// 返回首页
function goBack() {
    window.location.href = '../index.html';
}


