// 模拟合同-发票关联数据
const mockRelationData = [
    {
        id: 1,
        relationType: '一对一',
        contractNo: 'HT202511210001',
        contractAmount: '¥226,000',
        contractStatus: '签署完成',
        invoiceNo: '25352000',
        invoiceAmount: '¥226,000',
        invoiceStatus: '已认证',
        relationTime: '2025-09-05 14:30',
        relationUser: '张三',
        remark: '正常一对一关联',
        bgColor: '#f0f8ff'
    },
    {
        id: 2,
        relationType: '多对一',
        contractNo: 'HT202511210002',
        contractAmount: '¥124,300',
        contractStatus: '签署完成',
        invoiceNo: '25352001',
        invoiceAmount: '¥226,000',
        invoiceStatus: '已认证',
        relationTime: '2025-11-16 15:20',
        relationUser: '张三',
        remark: '与合同HT202511210003共用发票',
        bgColor: '#fffacd'
    },
    {
        id: 3,
        relationType: '多对一',
        contractNo: 'HT202511210003',
        contractAmount: '¥101,700',
        contractStatus: '签署完成',
        invoiceNo: '25352001',
        invoiceAmount: '¥226,000',
        invoiceStatus: '已认证',
        relationTime: '2025-11-16 15:21',
        relationUser: '张三',
        remark: '与合同HT202511210002共用发票',
        bgColor: '#fffacd'
    }
];

// 模拟按发票分组数据
const mockInvoiceGroupData = [
    {
        invoiceNo: '25352000',
        invoiceAmount: '¥226,000',
        invoiceStatus: '已认证',
        contractCount: 1,
        contractList: ['HT202511210001'],
        contractAmountSum: '¥226,000',
        matchStatus: '完全匹配',
        bgColor: '#f0f8ff'
    },
    {
        invoiceNo: '25352001',
        invoiceAmount: '¥226,000',
        invoiceStatus: '已认证',
        contractCount: 2,
        contractList: ['HT202511210002', 'HT202511210003'],
        contractAmountSum: '¥226,000',
        matchStatus: '完全匹配',
        bgColor: '#fffacd'
    }
];

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    renderRelationTable();
    renderInvoiceGroupTable();
});

// 渲染关联关系表格
function renderRelationTable() {
    const tbody = document.getElementById('relationTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    mockRelationData.forEach(item => {
        const row = document.createElement('tr');
        row.style.backgroundColor = item.bgColor;
        row.innerHTML = `
            <td>${item.id}</td>
            <td><span class="relation-badge">${item.relationType}</span></td>
            <td>
                <a href="#" class="action-link" onclick="viewContract('${item.contractNo}')">${item.contractNo}</a>
            </td>
            <td class="amount-highlight">${item.contractAmount}</td>
            <td><span class="status-badge status-completed">${item.contractStatus}</span></td>
            <td>
                <a href="#" class="action-link" onclick="viewInvoice('${item.invoiceNo}')">${item.invoiceNo}</a>
            </td>
            <td class="amount-highlight">${item.invoiceAmount}</td>
            <td><span class="status-badge status-completed">${item.invoiceStatus}</span></td>
            <td>${item.relationTime}</td>
            <td>${item.relationUser}</td>
            <td>${item.remark}</td>
            <td>
                <button class="btn btn-sm" onclick="editRelation(${item.id})">编辑</button>
                <button class="btn btn-danger btn-sm" onclick="deleteRelation(${item.id})">解除</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// 渲染按发票分组表格
function renderInvoiceGroupTable() {
    const tbody = document.getElementById('invoiceGroupBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    mockInvoiceGroupData.forEach(item => {
        const row = document.createElement('tr');
        row.style.backgroundColor = item.bgColor;
        
        const contractListHtml = item.contractList.map(contract => 
            `<a href="#" class="action-link" onclick="viewContract('${contract}')">${contract}</a>`
        ).join(', ');
        
        const relationType = item.contractCount > 1 ? '多对一' : '一对一';
        
        row.innerHTML = `
            <td>
                <a href="#" class="action-link" onclick="viewInvoice('${item.invoiceNo}')">${item.invoiceNo}</a>
            </td>
            <td class="amount-highlight">${item.invoiceAmount}</td>
            <td><span class="status-badge status-completed">${item.invoiceStatus}</span></td>
            <td>
                <span class="relation-badge">${relationType}</span>
                <strong>${item.contractCount}</strong> 个合同
            </td>
            <td>${contractListHtml}</td>
            <td class="amount-highlight">${item.contractAmountSum}</td>
            <td><span class="status-badge status-completed">${item.matchStatus}</span></td>
            <td>
                <button class="btn btn-sm" onclick="viewInvoiceDetail('${item.invoiceNo}')">查看详情</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// 新增关联
function addRelation() {
    console.log('新增合同-发票关联');
    alert('打开新增关联界面...\n\n请选择：\n1. 合同编号\n2. 发票编号\n3. 关系类型（一对一/多对一）');
}

// 导出关联数据
function exportRelationData() {
    console.log('导出关联数据');
    alert('正在导出合同-发票关联数据...');
}

// 查看合同
function viewContract(contractNo) {
    console.log('查看合同：', contractNo);
    alert(`查看合同详情：${contractNo}`);
    return false;
}

// 查看发票
function viewInvoice(invoiceNo) {
    console.log('查看发票：', invoiceNo);
    alert(`查看发票详情：${invoiceNo}`);
    return false;
}

// 编辑关联
function editRelation(id) {
    console.log('编辑关联：', id);
    alert(`编辑关联关系 ID: ${id}\n\n可修改：\n- 关联的发票\n- 备注信息`);
}

// 解除关联
function deleteRelation(id) {
    const confirmed = confirm('确定要解除此关联关系吗？\n\n解除后，合同将变为未关联状态。');
    if (confirmed) {
        console.log('解除关联：', id);
        alert(`已解除关联关系 ID: ${id}`);
        // 实际应用中应该调用API删除关联
        // deleteRelationAPI(id).then(() => renderRelationTable());
    }
}

// 查看发票详情
function viewInvoiceDetail(invoiceNo) {
    console.log('查看发票详情：', invoiceNo);
    alert(`查看发票 ${invoiceNo} 的完整信息和关联的所有合同`);
}

// 返回首页
function goBack() {
    window.location.href = '../index.html';
}


