// 发票基础数据（从进项发票管理页面引用）
const invoiceBaseData = {
    '25352000': { date: '2025-11-24', supplier: '广州XX服饰有限公司' },
    '25352001': { date: '2025-11-24', supplier: '广州XX服饰有限公司' },
    '25352002': { date: '2025-11-25', supplier: '深圳YY制衣厂' }
};

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
                    { sku: "LC788786-P3010-S", qty: 1 },
                    { sku: "LC788786-P3010-M", qty: 50 }  // 未匹配的SKU
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
    // 报关项1：女士外套 - LC788786-P3010-XL (120件，FIFO多明细匹配)
    {
        declarationNo: 'FBA194287Y1B',
        gNo: 1,
        declareName: '女士外套',
        declareSku: 'LC788786-P3010-XL',
        declareQty: 120,
        skuDetailId: 'SKU001',
        contractItemNo: '1',
        availableQty: 100,
        matchQty: 100,
        contractNo: 'HT202511210001',
        supplier: '广州XX服饰有限公司',
        contractAmount: '¥15,060',
        invoiceNo: '25352000',
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
        skuDetailId: 'SKU003',
        contractItemNo: '1',
        availableQty: 100,
        matchQty: 20,
        contractNo: 'HT202511210002',
        supplier: '广州XX服饰有限公司',
        contractAmount: '¥15,060',
        invoiceNo: '25352001',
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

// SKU明细基础数据（包含退货数等信息）
const skuDetailBaseData = {
    'SKU001': { returnQty: 0, contractQty: 100 },
    'SKU002': { returnQty: 20, contractQty: 100 },
    'SKU003': { returnQty: 0, contractQty: 100 },
    'SKU004': { returnQty: 0, contractQty: 100 },
    'SKU005': { returnQty: 0, contractQty: 100 }
};

// 当前视图
let currentView = 'all';

// 筛选条件
let filterConditions = {
    declareNo: '',
    matchStatus: '',
    contractNo: '',
    invoiceNo: '',
    matchDate: ''
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function () {
    // 检查是否有TAB导航
    const hasTabs = document.querySelector('.tabs-navigation');
    if (hasTabs) {
        // 有TAB导航，切换到完整映射表视图
        switchView('all');
    } else {
        // 没有TAB导航，直接渲染完整映射表
        renderMappingTable();
    }
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
    switch (view) {
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
        case 'invoice':
            renderInvoiceGroups();
            break;
    }
}

// 渲染完整映射表
function renderMappingTable() {
    const tbody = document.getElementById('mappingTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    // 应用筛选条件
    const filteredData = mappingData.filter(item => {
        if (filterConditions.declareNo && !item.declarationNo.includes(filterConditions.declareNo)) {
            return false;
        }
        if (filterConditions.matchStatus && item.matchStatus !== filterConditions.matchStatus) {
            return false;
        }
        if (filterConditions.contractNo && !item.contractNo.includes(filterConditions.contractNo)) {
            return false;
        }
        if (filterConditions.invoiceNo && item.invoiceNo && !item.invoiceNo.includes(filterConditions.invoiceNo)) {
            return false;
        }
        return true;
    });

    filteredData.forEach((item, index) => {
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
        if (item.isMultiMatch && index > 0 && filteredData[index - 1] && filteredData[index - 1].declareSku === item.declareSku) {
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
        const fullyMatchedCount = allSkuList.filter(s => s.isMatched && s.matched.matchStatus === '完全匹配').length;
        const partialMatchedCount = allSkuList.filter(s => s.isMatched && s.matched.matchStatus === '部分匹配').length;
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
                    ${fullyMatchedCount > 0 ? `<span class="group-badge" style="background-color: #52c41a; color: white;">完全匹配: ${fullyMatchedCount}</span>` : ''}
                    ${partialMatchedCount > 0 ? `<span class="group-badge" style="background-color: #fa8c16; color: white;">部分匹配: ${partialMatchedCount}</span>` : ''}
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
                // 已匹配的行 - 区分完全匹配和部分匹配
                const isPartialMatch = item.matched.matchStatus === '部分匹配';
                const bgColor = isPartialMatch ? '#fff7e6' : '#f6ffed';
                const statusClass = isPartialMatch ? 'status-pending' : 'status-completed';
                const statusText = isPartialMatch ? '部分匹配' : '完全匹配';
                const lackQty = item.declareQty - item.matched.matchQty;

                return `
                                    <tr style="background-color: ${bgColor};">
                                        <td>${item.gNo}</td>
                                        <td>${item.declareName}</td>
                                        <td><strong>${item.declareSku}</strong></td>
                                        <td>${item.declareQty}</td>
                                        <td>
                                            <span class="status-badge ${statusClass}">${statusText}</span>
                                            ${isPartialMatch ? `<br><small style="color: #fa8c16;">缺${lackQty}件</small>` : ''}
                                        </td>
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
            // 从基础数据中获取合同数量和退货数
            const baseData = skuDetailBaseData[item.skuDetailId] || { returnQty: 0, contractQty: 100 };
            const contractQty = baseData.contractQty;
            const returnQty = baseData.returnQty;

            skuUsageMap[item.skuDetailId] = {
                skuDetailId: item.skuDetailId,
                sku: item.declareSku,
                contractNo: item.contractNo,
                contractItemNo: item.contractItemNo,
                supplier: item.supplier,
                contractQty: contractQty,
                returnQty: returnQty,
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
            <td>${sku.contractQty}</td>
            <td class="highlight-value">${sku.returnQty}</td>
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

// 渲染按发票分组
function renderInvoiceGroups() {
    const tbody = document.getElementById('invoiceGroupBody');
    if (!tbody) return;

    // 按发票号分组
    const grouped = {};
    mappingData.forEach(item => {
        if (item.invoiceNo) {
            if (!grouped[item.invoiceNo]) {
                grouped[item.invoiceNo] = {
                    invoiceNo: item.invoiceNo,
                    invoiceAmount: item.invoiceAmount,
                    supplier: item.supplier,
                    contracts: new Set(),
                    skus: new Set(),
                    declarations: new Set(),
                    skuQtyMap: {},
                    items: []
                };
            }
            grouped[item.invoiceNo].contracts.add(item.contractNo);
            grouped[item.invoiceNo].skus.add(item.declareSku);
            grouped[item.invoiceNo].declarations.add(item.declarationNo);
            grouped[item.invoiceNo].items.push(item);

            // 避免相同SKU重复计算报关数量
            if (!grouped[item.invoiceNo].skuQtyMap[item.declareSku]) {
                grouped[item.invoiceNo].skuQtyMap[item.declareSku] = item.declareQty;
            }
        }
    });

    tbody.innerHTML = '';

    Object.values(grouped).forEach(group => {
        const row = document.createElement('tr');

        // 从发票基础数据中获取日期
        const invoiceDate = invoiceBaseData[group.invoiceNo] ? invoiceBaseData[group.invoiceNo].date : '-';

        const contractDisplay = Array.from(group.contracts).map(c =>
            `<a href="#" class="action-link" onclick="viewContract('${c}')">${c}</a>`
        ).join(', ');

        const declarationList = Array.from(group.declarations).map(d =>
            `<a href="#" class="action-link" onclick="viewDeclaration('${d}')">${d}</a>`
        ).join(', ');

        // 计算总报关数量（去重）
        const totalQty = Object.values(group.skuQtyMap).reduce((sum, qty) => sum + qty, 0);

        row.innerHTML = `
            <td><a href="#" class="action-link" onclick="viewInvoice('${group.invoiceNo}')">${group.invoiceNo}</a></td>
            <td class="amount-highlight">${group.invoiceAmount}</td>
            <td>${invoiceDate}</td>
            <td>${group.supplier}</td>
            <td>${contractDisplay}</td>
            <td><strong>${group.skus.size}</strong> 个</td>
            <td>${declarationList}</td>
            <td class="amount-highlight"><strong>${totalQty}</strong> 件</td>
            <td>
                <button class="btn btn-sm" onclick="viewInvoiceDetail('${group.invoiceNo}')">查看详情</button>
            </td>
        `;

        tbody.appendChild(row);
    });
}

// 导出映射数据
// 查询数据
function queryData() {
    // 获取筛选条件
    filterConditions.declareNo = document.getElementById('filterDeclareNo')?.value.trim() || '';
    filterConditions.matchStatus = document.getElementById('filterMatchStatus')?.value || '';
    filterConditions.contractNo = document.getElementById('filterContractNo')?.value.trim() || '';
    filterConditions.invoiceNo = document.getElementById('filterInvoiceNo')?.value.trim() || '';
    filterConditions.matchDate = document.getElementById('filterMatchDate')?.value.trim() || '';

    // 重新渲染表格
    renderMappingTable();
}

// 重置筛选条件
function resetFilter() {
    filterConditions = {
        declareNo: '',
        matchStatus: '',
        contractNo: '',
        invoiceNo: '',
        matchDate: ''
    };

    // 清空输入框
    const filterDeclareNo = document.getElementById('filterDeclareNo');
    const filterMatchStatus = document.getElementById('filterMatchStatus');
    const filterContractNo = document.getElementById('filterContractNo');
    const filterInvoiceNo = document.getElementById('filterInvoiceNo');
    const filterMatchDate = document.getElementById('filterMatchDate');

    if (filterDeclareNo) filterDeclareNo.value = '';
    if (filterMatchStatus) filterMatchStatus.value = '';
    if (filterContractNo) filterContractNo.value = '';
    if (filterInvoiceNo) filterInvoiceNo.value = '';
    if (filterMatchDate) filterMatchDate.value = '';

    // 重新渲染表格
    renderMappingTable();
}

// 导出数据
function exportData() {
    const filteredData = mappingData.filter(item => {
        if (filterConditions.declareNo && !item.declarationNo.includes(filterConditions.declareNo)) {
            return false;
        }
        if (filterConditions.matchStatus && item.matchStatus !== filterConditions.matchStatus) {
            return false;
        }
        if (filterConditions.contractNo && !item.contractNo.includes(filterConditions.contractNo)) {
            return false;
        }
        if (filterConditions.invoiceNo && item.invoiceNo && !item.invoiceNo.includes(filterConditions.invoiceNo)) {
            return false;
        }
        return true;
    });

    // 转换为CSV格式
    const headers = ['报关单号', '报关项号', '报关品名', '报关SKU', '报关数量', '匹配状态', '明细ID', '可用数量', '匹配数量', '合同编号', '合同项号', '供应商', '合同金额', '发票编号', '发票金额'];
    const rows = filteredData.map(item => [
        item.declarationNo,
        item.gNo,
        item.declareName,
        item.declareSku,
        item.declareQty,
        item.matchStatus,
        item.skuDetailId,
        item.availableQty,
        item.matchQty,
        item.contractNo,
        item.contractItemNo,
        item.supplier,
        item.contractAmount,
        item.invoiceNo || '未关联',
        item.invoiceAmount || ''
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `三方映射关系_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert(`已导出 ${filteredData.length} 条数据`);
}

// 导出Excel
function exportExcel() {
    // 这里可以调用后端API导出Excel，或者使用前端库如SheetJS
    alert('Excel导出功能需要后端支持，当前导出为CSV格式');
    exportData(); // 暂时使用CSV导出
}

function exportMappingData() {
    exportData();
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

// 查看发票详情（带映射信息）
function viewInvoiceDetail(invoiceNo) {
    const relatedItems = mappingData.filter(item => item.invoiceNo === invoiceNo);

    if (relatedItems.length === 0) {
        alert('未找到该发票的映射记录');
        return;
    }

    const firstItem = relatedItems[0];
    const uniqueContracts = [...new Set(relatedItems.map(item => item.contractNo))];
    const uniqueSkus = [...new Set(relatedItems.map(item => item.declareSku))];
    const totalQty = relatedItems.reduce((sum, item) => {
        if (!sum.skuMap) sum.skuMap = {};
        if (!sum.skuMap[item.declareSku]) {
            sum.skuMap[item.declareSku] = item.declareQty;
            sum.total += item.declareQty;
        }
        return sum;
    }, { total: 0, skuMap: {} }).total;

    let message = `发票编号：${invoiceNo}\n`;
    message += `发票金额：${firstItem.invoiceAmount}\n`;
    message += `供应商：${firstItem.supplier}\n`;
    message += `关联合同：${uniqueContracts.join(', ')}\n`;
    message += `关联SKU数：${uniqueSkus.length} 个\n`;
    message += `已报关数量：${totalQty} 件\n\n`;
    message += `详细SKU清单（${relatedItems.length}条）：\n\n`;

    relatedItems.forEach((item, index) => {
        message += `${index + 1}. SKU: ${item.declareSku}\n`;
        message += `   明细ID: ${item.skuDetailId}\n`;
        message += `   合同: ${item.contractNo}-项${item.contractItemNo}\n`;
        message += `   报关: ${item.declarationNo}(${item.matchQty}件)\n\n`;
    });

    alert(message);
}

// 返回首页
function goBack() {
    window.location.href = '../index.html';
}

