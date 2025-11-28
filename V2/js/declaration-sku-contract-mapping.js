// 报关单原始数据（包含所有报关SKU）
const declarationRawData = {
    "FBA194287Y1B": {
        declarationNo: "FBA194287Y1B",
        items: [
            {
                gNo: 1,
                declareName: "女士外套",
                skus: [
                    { sku: "LC788786-P3010-XL", qty: 120 },
                    { sku: "LC788786-P3010-2XL", qty: 100 },
                    { sku: "LC788786-P3010-S", qty: 1 }
                ]
            },
            {
                gNo: 2,
                declareName: "裤装套装",
                skus: [
                    { sku: "LC628573-P105-M", qty: 14 }
                ]
            }
        ]
    }
};

// 完整映射关系数据
const mappingData = [
    // 报关项1：女士外套 - LC788786-P3010-XL (120件，LIFO多明细匹配)
    {
        declarationNo: 'FBA194287Y1B',
        gNo: 1,
        declareName: '女士外套',
        declareSku: 'LC788786-P3010-XL',
        declareQty: 120,
        skuDetailId: 'SKU003',
        contractItemNo: '1',
        availableQty: 100,
        matchQty: 100,
        contractNo: 'HT202511210002',
        supplier: '广州XX服饰有限公司',
        contractAmount: '¥15,060',
        invoiceNo: '25352001',
        invoiceAmount: '¥15,060',
        matchStatus: '完全匹配',
        isMultiMatch: true
    },
    {
        declarationNo: 'FBA194287Y1B',
        gNo: 1,
        declareName: '女士外套',
        declareSku: 'LC788786-P3010-XL',
        declareQty: 120,
        skuDetailId: 'SKU001',
        contractItemNo: '1',
        availableQty: 100,
        matchQty: 20,
        contractNo: 'HT202511210001',
        supplier: '广州XX服饰有限公司',
        contractAmount: '¥15,060',
        invoiceNo: '25352000',
        invoiceAmount: '¥15,060',
        matchStatus: '完全匹配',
        isMultiMatch: true
    },
    // 报关项1：女士外套 - LC788786-P3010-2XL (100件，部分匹配80件)
    {
        declarationNo: 'FBA194287Y1B',
        gNo: 1,
        declareName: '女士外套',
        declareSku: 'LC788786-P3010-2XL',
        declareQty: 100,
        skuDetailId: 'SKU002',
        contractItemNo: '2',
        availableQty: 80,
        matchQty: 80,
        contractNo: 'HT202511210001',
        supplier: '广州XX服饰有限公司',
        contractAmount: '¥15,060',
        invoiceNo: '25352000',
        invoiceAmount: '¥15,060',
        matchStatus: '部分匹配',
        isMultiMatch: false
    },
    // 报关项1：女士外套 - LC788786-P3010-S (1件)
    {
        declarationNo: 'FBA194287Y1B',
        gNo: 1,
        declareName: '女士外套',
        declareSku: 'LC788786-P3010-S',
        declareQty: 1,
        skuDetailId: 'SKU004',
        contractItemNo: '2',
        availableQty: 100,
        matchQty: 1,
        contractNo: 'HT202511210002',
        supplier: '广州XX服饰有限公司',
        contractAmount: '¥15,060',
        invoiceNo: '25352001',
        invoiceAmount: '¥15,060',
        matchStatus: '完全匹配',
        isMultiMatch: false
    },
    // 报关项2：裤装套装 - LC628573-P105-M (14件)
    {
        declarationNo: 'FBA194287Y1B',
        gNo: 2,
        declareName: '裤装套装',
        declareSku: 'LC628573-P105-M',
        declareQty: 14,
        skuDetailId: 'SKU005',
        contractItemNo: '1',
        availableQty: 100,
        matchQty: 14,
        contractNo: 'HT202511210003',
        supplier: '深圳YY制衣厂',
        contractAmount: '¥8,900',
        invoiceNo: '25352002',
        invoiceAmount: '¥8,900',
        matchStatus: '完全匹配',
        isMultiMatch: false
    }
];

// 当前视图
let currentView = 'all';

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    switchView('all');
});

// 视图切换
function switchView(view) {
    currentView = view;
    
    // 更新标签页状态
    document.querySelectorAll('.tab-item').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-view="${view}"]`).classList.add('active');
    
    // 隐藏所有视图
    document.querySelectorAll('.view-content').forEach(content => {
        content.style.display = 'none';
    });
    
    // 显示当前视图并渲染数据
    const currentViewElement = document.getElementById(`view-${view}`);
    if (currentViewElement) {
        currentViewElement.style.display = 'block';
    }
    
    // 根据视图渲染对应数据
    switch(view) {
        case 'all':
            renderMappingTable();
            break;
        case 'declaration':
            renderDeclarationGroups();
            break;
        case 'sku':
            renderSkuGroups();
            break;
        case 'contract':
            renderContractGroups();
            break;
    }
}

// 渲染完整映射表
function renderMappingTable() {
    const tbody = document.getElementById('mappingTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    mappingData.forEach((item, index) => {
        const row = document.createElement('tr');
        
        // 根据匹配状态设置背景色
        let rowBgColor = '#fafafa';
        if (item.matchStatus === '完全匹配') {
            rowBgColor = '#f6ffed';
        } else if (item.matchStatus === '部分匹配') {
            rowBgColor = '#fff7e6';
        }
        row.style.backgroundColor = rowBgColor;
        
        // 多明细匹配标识
        if (item.isMultiMatch && index > 0 && mappingData[index-1].declareSku === item.declareSku) {
            row.style.borderLeft = '3px solid #1890ff';
        }
        
        // 状态徽章样式
        let statusClass = 'status-completed';
        if (item.matchStatus === '部分匹配') {
            statusClass = 'status-pending';
        }
        
        row.innerHTML = `
            <td><a href="#" class="action-link" onclick="viewDeclaration('${item.declarationNo}')">${item.declarationNo}</a></td>
            <td>${item.gNo}</td>
            <td>${item.declareName}</td>
            <td><strong>${item.declareSku}</strong></td>
            <td>${item.declareQty}</td>
            <td>
                <span class="status-badge ${statusClass}">${item.matchStatus}</span>
                ${item.isMultiMatch ? '<br><small style="color: #1890ff;">多明细</small>' : ''}
            </td>
            <td style="background-color: #fffaec;">${item.skuDetailId}</td>
            <td style="background-color: #fffaec;">${item.availableQty}</td>
            <td style="background-color: #fffaec;" class="amount-highlight">${item.matchQty}</td>
            <td style="background-color: #e6f4ff;">
                <a href="#" class="action-link" onclick="viewContract('${item.contractNo}')">${item.contractNo}</a>
            </td>
            <td style="background-color: #e6f4ff;">${item.contractItemNo}</td>
            <td style="background-color: #e6f4ff;">${item.supplier}</td>
            <td style="background-color: #e6f4ff;">${item.contractAmount}</td>
            <td style="background-color: #f0ffe6;">
                ${item.invoiceNo ? 
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
    
    container.innerHTML = '';
    
    // 遍历每个报关单
    Object.keys(declarationRawData).forEach(declarationNo => {
        const declaration = declarationRawData[declarationNo];
        
        // 获取该报关单的所有匹配数据
        const matchedItems = mappingData.filter(item => item.declarationNo === declarationNo);
        
        // 构建完整的SKU列表（包含未匹配的）
        const allSkuList = [];
        declaration.items.forEach(item => {
            item.skus.forEach(sku => {
                const matchedList = matchedItems.filter(m => m.declareSku === sku.sku);
                
                if (matchedList.length > 0) {
                    // 已匹配的SKU
                    matchedList.forEach(matched => {
                        allSkuList.push({
                            gNo: item.gNo,
                            declareName: item.declareName,
                            declareSku: sku.sku,
                            declareQty: sku.qty,
                            matched: matched,
                            isMatched: true
                        });
                    });
                } else {
                    // 未匹配的SKU
                    allSkuList.push({
                        gNo: item.gNo,
                        declareName: item.declareName,
                        declareSku: sku.sku,
                        declareQty: sku.qty,
                        matched: null,
                        isMatched: false
                    });
                }
            });
        });
        
        // 统计信息
        const matchedCount = allSkuList.filter(s => s.isMatched).length;
        const unmatchedCount = allSkuList.filter(s => !s.isMatched).length;
        const totalQty = declaration.items.reduce((sum, item) => 
            sum + item.skus.reduce((s, sku) => s + sku.qty, 0), 0);
        const uniqueContracts = [...new Set(matchedItems.map(item => item.contractNo))];
        const uniqueSuppliers = [...new Set(matchedItems.map(item => item.supplier))];
        
        const groupCard = document.createElement('div');
        groupCard.className = 'declaration-group-card';
        
        groupCard.innerHTML = `
            <div class="group-header">
                <div class="group-title">
                    <span class="declaration-icon">📋</span>
                    报关单号：<strong>${declarationNo}</strong>
                </div>
                <div class="group-stats">
                    <span class="group-badge" style="background-color: #52c41a; color: white;">已匹配: ${matchedCount}</span>
                    ${unmatchedCount > 0 ? `<span class="group-badge" style="background-color: #ff4d4f; color: white;">未匹配: ${unmatchedCount}</span>` : ''}
                    <span class="group-badge">总计 ${totalQty} 件</span>
                    <span class="group-badge">${uniqueContracts.length} 个合同</span>
                </div>
            </div>
            <div class="group-body">
                ${uniqueSuppliers.length > 0 ? `
                <div class="group-info-row">
                    <strong>关联供应商：</strong>${uniqueSuppliers.join(', ')}
                </div>
                ` : ''}
                ${uniqueContracts.length > 0 ? `
                <div class="group-info-row">
                    <strong>关联合同：</strong>${uniqueContracts.map(c => 
                        `<a href="#" class="action-link" onclick="viewContract('${c}')">${c}</a>`
                    ).join(', ')}
                </div>
                ` : ''}
                <table class="group-table">
                    <thead>
                        <tr>
                            <th>项号</th>
                            <th>报关品名</th>
                            <th>SKU</th>
                            <th>报关数量</th>
                            <th>匹配状态</th>
                            <th>匹配数量</th>
                            <th>明细ID</th>
                            <th>合同</th>
                            <th>合同项号</th>
                            <th>发票</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${allSkuList.map(item => {
                            if (item.isMatched) {
                                // 已匹配的行
                                return `
                                    <tr style="background-color: #f6ffed;">
                                        <td>${item.gNo}</td>
                                        <td>${item.declareName}</td>
                                        <td><strong>${item.declareSku}</strong></td>
                                        <td>${item.declareQty}</td>
                                        <td><span class="status-badge status-completed">已匹配</span></td>
                                        <td class="amount-highlight">${item.matched.matchQty}</td>
                                        <td>${item.matched.skuDetailId}</td>
                                        <td><a href="#" class="action-link" onclick="viewContract('${item.matched.contractNo}')">${item.matched.contractNo}</a></td>
                                        <td>${item.matched.contractItemNo}</td>
                                        <td>${item.matched.invoiceNo ? 
                                            `<a href="#" class="action-link" onclick="viewInvoice('${item.matched.invoiceNo}')">${item.matched.invoiceNo}</a>` : 
                                            '<span style="color: #999;">-</span>'}</td>
                                    </tr>
                                `;
                            } else {
                                // 未匹配的行
                                return `
                                    <tr style="background-color: #fff1f0;">
                                        <td>${item.gNo}</td>
                                        <td>${item.declareName}</td>
                                        <td><strong>${item.declareSku}</strong></td>
                                        <td>${item.declareQty}</td>
                                        <td><span class="status-badge status-rejected">未匹配</span></td>
                                        <td><span style="color: #999;">-</span></td>
                                        <td><span style="color: #999;">-</span></td>
                                        <td><span style="color: #999;">-</span></td>
                                        <td><span style="color: #999;">-</span></td>
                                        <td><span style="color: #999;">-</span></td>
                                    </tr>
                                `;
                            }
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        container.appendChild(groupCard);
    });
}

// 渲染按SKU明细分组
function renderSkuGroups() {
    const tbody = document.getElementById('skuGroupBody');
    if (!tbody) return;
    
    // 构建SKU明细使用情况
    const skuUsageMap = {};
    
    // 收集所有SKU明细的基本信息
    mappingData.forEach(item => {
        if (!skuUsageMap[item.skuDetailId]) {
            skuUsageMap[item.skuDetailId] = {
                skuDetailId: item.skuDetailId,
                sku: item.declareSku,
                contractNo: item.contractNo,
                contractItemNo: item.contractItemNo,
                supplier: item.supplier,
                availableQty: item.availableQty,
                contractAmount: item.contractAmount,
                invoiceNo: item.invoiceNo,
                declarations: [],
                totalDeclaredQty: 0
            };
        }
        
        // 记录报关使用情况
        skuUsageMap[item.skuDetailId].declarations.push({
            declarationNo: item.declarationNo,
            gNo: item.gNo,
            matchQty: item.matchQty
        });
        skuUsageMap[item.skuDetailId].totalDeclaredQty += item.matchQty;
    });
    
    tbody.innerHTML = '';
    
    Object.values(skuUsageMap).forEach(sku => {
        const row = document.createElement('tr');
        
        const remainingQty = sku.availableQty - sku.totalDeclaredQty;
        const isFullyUsed = remainingQty <= 0;
        
        const bgColor = isFullyUsed ? '#fff1f0' : '#f6ffed';
        row.style.backgroundColor = bgColor;
        
        const declarationList = sku.declarations.map(d => 
            `${d.declarationNo}(项${d.gNo}:${d.matchQty}件)`
        ).join(', ');
        
        row.innerHTML = `
            <td>${sku.skuDetailId}</td>
            <td><strong>${sku.sku}</strong></td>
            <td><a href="#" class="action-link" onclick="viewContract('${sku.contractNo}')">${sku.contractNo}</a></td>
            <td>${sku.contractItemNo}</td>
            <td>${sku.supplier}</td>
            <td>${sku.availableQty + sku.totalDeclaredQty}</td>
            <td>${sku.availableQty}</td>
            <td class="amount-highlight"><strong>${sku.totalDeclaredQty}</strong></td>
            <td style="${isFullyUsed ? 'color: #ff4d4f; font-weight: bold;' : ''}">${remainingQty}</td>
            <td>${declarationList}</td>
            <td>${sku.invoiceNo ? 
                `<a href="#" class="action-link" onclick="viewInvoice('${sku.invoiceNo}')">${sku.invoiceNo}</a>` : 
                '<span style="color: #999;">-</span>'}</td>
            <td>
                <button class="btn btn-sm" onclick="viewSkuDetail('${sku.skuDetailId}')">详情</button>
            </td>
        `;
        
        tbody.appendChild(row);
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
                skuQtyMap: {}
            };
        }
        grouped[item.contractNo].skus.add(item.declareSku);
        grouped[item.contractNo].declarations.add(item.declarationNo);
        if (item.invoiceNo && item.invoiceNo !== '-') {
            grouped[item.contractNo].invoices.add(item.invoiceNo);
        }
        // 避免相同SKU重复计算报关数量
        if (!grouped[item.contractNo].skuQtyMap[item.declareSku]) {
            grouped[item.contractNo].skuQtyMap[item.declareSku] = item.declareQty;
        }
    });
    
    tbody.innerHTML = '';
    
    Object.values(grouped).forEach(group => {
        const row = document.createElement('tr');
        
        const invoiceDisplay = group.invoices.size > 0 ?
            Array.from(group.invoices).map(inv => 
                `<a href="#" class="action-link" onclick="viewInvoice('${inv}')">${inv}</a>`
            ).join(', ') :
            '<span style="color: #999;">未关联</span>';
        
        // 计算总数量
        const totalQty = Object.values(group.skuQtyMap).reduce((sum, qty) => sum + qty, 0);
        
        row.innerHTML = `
            <td><a href="#" class="action-link" onclick="viewContract('${group.contractNo}')">${group.contractNo}</a></td>
            <td>${group.supplier}</td>
            <td class="amount-highlight">${group.contractAmount}</td>
            <td>${invoiceDisplay}</td>
            <td><strong>${group.skus.size}</strong> 个</td>
            <td><strong>${group.declarations.size}</strong> 个</td>
            <td class="amount-highlight"><strong>${totalQty}</strong> 件</td>
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

// 查看SKU明细详情
function viewSkuDetail(skuDetailId) {
    const relatedItems = mappingData.filter(item => item.skuDetailId === skuDetailId);
    
    if (relatedItems.length === 0) {
        alert('未找到该SKU明细的报关记录');
        return;
    }
    
    const firstItem = relatedItems[0];
    const totalDeclaredQty = relatedItems.reduce((sum, item) => sum + item.matchQty, 0);
    
    let message = `SKU明细ID：${skuDetailId}\n`;
    message += `SKU编号：${firstItem.declareSku}\n`;
    message += `合同编号：${firstItem.contractNo}\n`;
    message += `供应商：${firstItem.supplier}\n`;
    message += `可用数量：${firstItem.availableQty}\n`;
    message += `已报关数量：${totalDeclaredQty}\n`;
    message += `剩余数量：${firstItem.availableQty - totalDeclaredQty}\n\n`;
    message += `关联的报关记录（${relatedItems.length}条）：\n\n`;
    
    relatedItems.forEach((item, index) => {
        message += `${index + 1}. 报关单: ${item.declarationNo}\n`;
        message += `   项号: ${item.gNo}, 数量: ${item.matchQty}件\n\n`;
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

