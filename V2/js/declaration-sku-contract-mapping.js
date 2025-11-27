// 完整映射关系数据
const mappingData = [
    {
        declarationNo: 'FBA194287Y1B',
        gNo: 1,
        declareName: '女士外套',
        declareSku: 'LC788786-P3010-XL',
        declareQty: 3,
        skuDetailId: 'SKU001',
        availableQty: 100,
        matchQty: 3,
        contractNo: 'HT202511210001',
        supplier: '广州XX服饰有限公司',
        contractAmount: '¥226,000',
        invoiceNo: '25352000',
        invoiceAmount: '¥226,000'
    },
    {
        declarationNo: 'FBA194287Y1B',
        gNo: 1,
        declareName: '女士外套',
        declareSku: 'LC788786-P3010-2XL',
        declareQty: 3,
        skuDetailId: 'SKU002',
        availableQty: 80,
        matchQty: 3,
        contractNo: 'HT202511210001',
        supplier: '广州XX服饰有限公司',
        contractAmount: '¥226,000',
        invoiceNo: '25352000',
        invoiceAmount: '¥226,000'
    },
    {
        declarationNo: 'FBA194287Y1B',
        gNo: 1,
        declareName: '女士外套',
        declareSku: 'LC788786-P3010-S',
        declareQty: 1,
        skuDetailId: 'SKU003',
        availableQty: 100,
        matchQty: 1,
        contractNo: 'HT202511210002',
        supplier: '广州XX服饰有限公司',
        contractAmount: '¥124,300',
        invoiceNo: '25352001',
        invoiceAmount: '¥226,000'
    },
    {
        declarationNo: 'FBA194287Y1B',
        gNo: 2,
        declareName: '裤装套装',
        declareSku: 'LC628573-P105-M',
        declareQty: 14,
        skuDetailId: 'SKU004',
        availableQty: 500,
        matchQty: 14,
        contractNo: 'HT202511210003',
        supplier: '深圳YY制衣厂',
        contractAmount: '¥101,700',
        invoiceNo: '25352001',
        invoiceAmount: '¥226,000'
    },
    {
        declarationNo: 'FBA195328Z2C',
        gNo: 1,
        declareName: '男士T恤',
        declareSku: 'MC25002-P2-L',
        declareQty: 10,
        skuDetailId: 'SKU005',
        availableQty: 100,
        matchQty: 10,
        contractNo: 'HT202511210004',
        supplier: '东莞ZZ服装厂',
        contractAmount: '¥153,680',
        invoiceNo: '25352002',
        invoiceAmount: '¥76,840'
    },
    {
        declarationNo: 'FBA195328Z2C',
        gNo: 2,
        declareName: '女士连衣裙',
        declareSku: 'LC25003-P1-S',
        declareQty: 5,
        skuDetailId: 'SKU006',
        availableQty: 10,
        matchQty: 5,
        contractNo: 'HT202511210005',
        supplier: '广州XX服饰有限公司',
        contractAmount: '¥1,090',
        invoiceNo: '-',
        invoiceAmount: '-'
    },
    {
        declarationNo: 'FBA196439A3D',
        gNo: 1,
        declareName: '女士套头衫',
        declareSku: 'LC25004-P1-L',
        declareQty: 8,
        skuDetailId: 'SKU007',
        availableQty: 10,
        matchQty: 8,
        contractNo: 'HT202511210005',
        supplier: '广州XX服饰有限公司',
        contractAmount: '¥1,090',
        invoiceNo: '-',
        invoiceAmount: '-'
    },
    {
        declarationNo: 'FBA196439A3D',
        gNo: 2,
        declareName: '男士衬衫',
        declareSku: 'MC25005-P2-XL',
        declareQty: 12,
        skuDetailId: 'SKU008',
        availableQty: 50,
        matchQty: 12,
        contractNo: 'HT202511210004',
        supplier: '东莞ZZ服装厂',
        contractAmount: '¥153,680',
        invoiceNo: '25352002',
        invoiceAmount: '¥76,840'
    }
];

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    renderMappingTable();
    renderDeclarationGroups();
    renderContractGroups();
});

// 渲染完整映射表
function renderMappingTable() {
    const tbody = document.getElementById('mappingTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    mappingData.forEach((item, index) => {
        const row = document.createElement('tr');
        
        // 交替背景色
        if (index % 2 === 0) {
            row.style.backgroundColor = '#fafafa';
        }
        
        row.innerHTML = `
            <td><a href="#" class="action-link" onclick="viewDeclaration('${item.declarationNo}')">${item.declarationNo}</a></td>
            <td>${item.gNo}</td>
            <td>${item.declareName}</td>
            <td><strong>${item.declareSku}</strong></td>
            <td>${item.declareQty}</td>
            <td style="background-color: #fffaec;">${item.skuDetailId}</td>
            <td style="background-color: #fffaec;">${item.availableQty}</td>
            <td style="background-color: #fffaec;" class="amount-highlight">${item.matchQty}</td>
            <td style="background-color: #e6f4ff;">
                <a href="#" class="action-link" onclick="viewContract('${item.contractNo}')">${item.contractNo}</a>
            </td>
            <td style="background-color: #e6f4ff;">${item.supplier}</td>
            <td style="background-color: #e6f4ff;">${item.contractAmount}</td>
            <td style="background-color: #f0ffe6;">
                ${item.invoiceNo !== '-' ? 
                    `<a href="#" class="action-link" onclick="viewInvoice('${item.invoiceNo}')">${item.invoiceNo}</a>` : 
                    '<span style="color: #999;">未关联</span>'}
            </td>
            <td style="background-color: #f0ffe6;">${item.invoiceAmount}</td>
        `;
        
        tbody.appendChild(row);
    });
}

// 渲染按报关单分组
function renderDeclarationGroups() {
    const container = document.getElementById('declarationGroupContainer');
    if (!container) return;
    
    // 按报关单号分组
    const grouped = {};
    mappingData.forEach(item => {
        if (!grouped[item.declarationNo]) {
            grouped[item.declarationNo] = [];
        }
        grouped[item.declarationNo].push(item);
    });
    
    container.innerHTML = '';
    
    Object.keys(grouped).forEach(declarationNo => {
        const items = grouped[declarationNo];
        const totalQty = items.reduce((sum, item) => sum + item.declareQty, 0);
        const uniqueContracts = [...new Set(items.map(item => item.contractNo))];
        const uniqueSuppliers = [...new Set(items.map(item => item.supplier))];
        
        const groupCard = document.createElement('div');
        groupCard.className = 'declaration-group-card';
        
        groupCard.innerHTML = `
            <div class="group-header">
                <div class="group-title">
                    <span class="declaration-icon">📋</span>
                    报关单号：<strong>${declarationNo}</strong>
                </div>
                <div class="group-stats">
                    <span class="group-badge">${items.length} 个SKU</span>
                    <span class="group-badge">总计 ${totalQty} 件</span>
                    <span class="group-badge">${uniqueContracts.length} 个合同</span>
                </div>
            </div>
            <div class="group-body">
                <div class="group-info-row">
                    <strong>关联供应商：</strong>${uniqueSuppliers.join(', ')}
                </div>
                <div class="group-info-row">
                    <strong>关联合同：</strong>${uniqueContracts.map(c => 
                        `<a href="#" class="action-link" onclick="viewContract('${c}')">${c}</a>`
                    ).join(', ')}
                </div>
                <table class="group-table">
                    <thead>
                        <tr>
                            <th>项号</th>
                            <th>报关品名</th>
                            <th>SKU</th>
                            <th>数量</th>
                            <th>明细ID</th>
                            <th>合同</th>
                            <th>发票</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map(item => `
                            <tr>
                                <td>${item.gNo}</td>
                                <td>${item.declareName}</td>
                                <td><strong>${item.declareSku}</strong></td>
                                <td>${item.declareQty}</td>
                                <td>${item.skuDetailId}</td>
                                <td><a href="#" class="action-link" onclick="viewContract('${item.contractNo}')">${item.contractNo}</a></td>
                                <td>${item.invoiceNo !== '-' ? 
                                    `<a href="#" class="action-link" onclick="viewInvoice('${item.invoiceNo}')">${item.invoiceNo}</a>` : 
                                    '<span style="color: #999;">-</span>'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        container.appendChild(groupCard);
    });
}

// 渲染按合同分组
function renderContractGroups() {
    const tbody = document.getElementById('contractGroupBody');
    if (!tbody) return;
    
    // 按合同号分组
    const grouped = {};
    mappingData.forEach(item => {
        if (!grouped[item.contractNo]) {
            grouped[item.contractNo] = {
                contractNo: item.contractNo,
                supplier: item.supplier,
                contractAmount: item.contractAmount,
                invoices: new Set(),
                skus: new Set(),
                declarations: new Set(),
                totalQty: 0
            };
        }
        grouped[item.contractNo].skus.add(item.declareSku);
        grouped[item.contractNo].declarations.add(item.declarationNo);
        if (item.invoiceNo !== '-') {
            grouped[item.contractNo].invoices.add(item.invoiceNo);
        }
        grouped[item.contractNo].totalQty += item.declareQty;
    });
    
    tbody.innerHTML = '';
    
    Object.values(grouped).forEach(group => {
        const row = document.createElement('tr');
        
        const invoiceDisplay = group.invoices.size > 0 ?
            Array.from(group.invoices).map(inv => 
                `<a href="#" class="action-link" onclick="viewInvoice('${inv}')">${inv}</a>`
            ).join(', ') :
            '<span style="color: #999;">未关联</span>';
        
        row.innerHTML = `
            <td><a href="#" class="action-link" onclick="viewContract('${group.contractNo}')">${group.contractNo}</a></td>
            <td>${group.supplier}</td>
            <td class="amount-highlight">${group.contractAmount}</td>
            <td>${invoiceDisplay}</td>
            <td><strong>${group.skus.size}</strong> 个</td>
            <td><strong>${group.declarations.size}</strong> 个</td>
            <td class="amount-highlight"><strong>${group.totalQty}</strong> 件</td>
            <td>
                <button class="btn btn-sm" onclick="viewContractDetail('${group.contractNo}')">查看详情</button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// 导出映射数据
function exportMappingData() {
    console.log('导出映射数据');
    alert('正在导出报关-SKU-合同映射数据...');
}

// 查询功能
function queryByDeclaration() {
    const input = document.getElementById('queryByDeclaration').value.trim();
    if (!input) {
        alert('请输入报关单号');
        return;
    }
    
    const results = mappingData.filter(item => item.declarationNo.includes(input));
    showQueryResults('报关单', input, results);
}

function queryBySku() {
    const input = document.getElementById('queryBySku').value.trim();
    if (!input) {
        alert('请输入SKU编号');
        return;
    }
    
    const results = mappingData.filter(item => item.declareSku.includes(input));
    showQueryResults('SKU', input, results);
}

function queryByContract() {
    const input = document.getElementById('queryByContract').value.trim();
    if (!input) {
        alert('请输入合同编号');
        return;
    }
    
    const results = mappingData.filter(item => item.contractNo.includes(input));
    showQueryResults('合同', input, results);
}

function queryByInvoice() {
    const input = document.getElementById('queryByInvoice').value.trim();
    if (!input) {
        alert('请输入发票编号');
        return;
    }
    
    const results = mappingData.filter(item => item.invoiceNo.includes(input));
    showQueryResults('发票', input, results);
}

// 显示查询结果
function showQueryResults(type, keyword, results) {
    if (results.length === 0) {
        alert(`未找到与"${keyword}"相关的${type}记录`);
        return;
    }
    
    let message = `查询到 ${results.length} 条记录：\n\n`;
    results.forEach((item, index) => {
        message += `${index + 1}. ${item.declarationNo} - ${item.declareSku} (${item.declareQty}件)\n`;
        message += `   合同: ${item.contractNo} | 发票: ${item.invoiceNo}\n\n`;
    });
    
    alert(message);
}

// 查看报关单
function viewDeclaration(declarationNo) {
    console.log('查看报关单:', declarationNo);
    alert(`查看报关单详情：${declarationNo}\n点击确定跳转到报关匹配页面`);
    return false;
}

// 查看合同
function viewContract(contractNo) {
    console.log('查看合同:', contractNo);
    alert(`查看合同详情：${contractNo}\n点击确定跳转到合同管理页面`);
    return false;
}

// 查看合同详情（带映射信息）
function viewContractDetail(contractNo) {
    const relatedItems = mappingData.filter(item => item.contractNo === contractNo);
    
    let message = `合同编号：${contractNo}\n\n`;
    message += `关联的报关记录（${relatedItems.length}条）：\n\n`;
    
    relatedItems.forEach((item, index) => {
        message += `${index + 1}. 报关单: ${item.declarationNo}\n`;
        message += `   SKU: ${item.declareSku}, 数量: ${item.declareQty}\n`;
        message += `   明细ID: ${item.skuDetailId}\n\n`;
    });
    
    alert(message);
}

// 查看发票
function viewInvoice(invoiceNo) {
    console.log('查看发票:', invoiceNo);
    alert(`查看发票详情：${invoiceNo}\n点击确定跳转到发票管理页面`);
    return false;
}

// 返回首页
function goBack() {
    window.location.href = '../index.html';
}

