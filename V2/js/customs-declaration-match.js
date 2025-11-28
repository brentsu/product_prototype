// 报关单数据
const declarationData = {
    "declare_document_no": "FBA194287Y1B",
    "declare_document_aggregated_item": [
        {
            "g_no": 1,
            "spin_type": "梭织",
            "customs_declare_cn": "女士外套",
            "customs_declare_en": "Women Coat",
            "fabric_type": "75%棉+25%涤纶",
            "skus": [
                {
                    "sku": "LC788786-P3010-XL",
                    "qty": 120
                },
                {
                    "sku": "LC788786-P3010-2XL",
                    "qty": 100
                },
                {
                    "sku": "LC788786-P3010-S",
                    "qty": 1
                }
            ]
        },
        {
            "g_no": 2,
            "spin_type": "针织",
            "customs_declare_cn": "裤装套装",
            "customs_declare_en": "Trouser Suit",
            "fabric_type": "65%涤纶+30%粘胶+5%氨纶",
            "skus": [
                {
                    "sku": "LC628573-P105-M",
                    "qty": 14
                }
            ]
        }
    ]
};

// 模拟采销SKU明细数据（从采销SKU明细页面引用）
const mockSkuDetails = [
    {
        id: 'SKU001',
        sku: 'LC788786-P3010-XL',
        contractNo: 'HT202511210001',
        contractItemNo: '1',
        invoiceNo: '25352000',
        supplier: '广州XX服饰有限公司',
        quantity: 100,
        returnQty: 0,
        availableQty: 100,
        contractStatus: '签署完成'
    },
    {
        id: 'SKU002',
        sku: 'LC788786-P3010-2XL',
        contractNo: 'HT202511210001',
        contractItemNo: '2',
        invoiceNo: '25352000',
        supplier: '广州XX服饰有限公司',
        quantity: 100,
        returnQty: 20,
        availableQty: 80,
        contractStatus: '签署完成'
    },
    {
        id: 'SKU003',
        sku: 'LC788786-P3010-XL',
        contractNo: 'HT202511210002',
        contractItemNo: '1',
        invoiceNo: '25352001',
        supplier: '广州XX服饰有限公司',
        quantity: 100,
        returnQty: 0,
        availableQty: 100,
        contractStatus: '签署完成'
    },
    {
        id: 'SKU004',
        sku: 'LC788786-P3010-S',
        contractNo: 'HT202511210002',
        contractItemNo: '2',
        invoiceNo: '25352001',
        supplier: '广州XX服饰有限公司',
        quantity: 100,
        returnQty: 0,
        availableQty: 100,
        contractStatus: '签署完成'
    },
    {
        id: 'SKU005',
        sku: 'LC628573-P105-M',
        contractNo: 'HT202511210003',
        contractItemNo: '1',
        invoiceNo: '25352002',
        supplier: '深圳YY制衣厂',
        quantity: 100,
        returnQty: 0,
        availableQty: 100,
        contractStatus: '签署完成'
    }
];

// 匹配结果
let matchResults = [];

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    renderDeclarationItems();
    performAutoMatch();
    displayJsonExample();
});

// 渲染报关项列表
function renderDeclarationItems() {
    const container = document.getElementById('declarationItemsContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    declarationData.declare_document_aggregated_item.forEach(item => {
        const itemCard = document.createElement('div');
        itemCard.className = 'declaration-item-card';
        
        const totalQty = item.skus.reduce((sum, sku) => sum + sku.qty, 0);
        
        itemCard.innerHTML = `
            <div class="item-header">
                <div class="item-title">
                    <span class="item-no">项号 ${item.g_no}</span>
                    <span class="item-name">${item.customs_declare_cn} / ${item.customs_declare_en}</span>
                </div>
                <div class="item-badges">
                    <span class="badge-info">${item.spin_type}</span>
                    <span class="badge-info">${item.skus.length} 个SKU</span>
                    <span class="badge-info">共 ${totalQty} 件</span>
                </div>
            </div>
            <div class="item-body">
                <div class="item-row">
                    <strong>面料成分：</strong>${item.fabric_type}
                </div>
                <div class="item-row">
                    <strong>SKU清单：</strong>
                </div>
                <div class="sku-list">
                    ${item.skus.map(sku => `
                        <div class="sku-item">
                            <span class="sku-code">${sku.sku}</span>
                            <span class="sku-qty">数量: <strong>${sku.qty}</strong></span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        container.appendChild(itemCard);
    });
}

// 自动匹配
function performAutoMatch() {
    matchResults = [];
    
    declarationData.declare_document_aggregated_item.forEach(item => {
        item.skus.forEach(declareSku => {
            // 查找所有符合条件的采销SKU明细
            // 匹配规则：1. SKU相同 2. 合同状态为"签署完成" 3. 可用数量 > 0
            // 匹配策略：LIFO（Last In First Out）后进先出，优先使用最新的明细
            const matchableDetails = mockSkuDetails.filter(detail => 
                detail.sku === declareSku.sku && 
                detail.contractStatus === '签署完成' &&
                detail.availableQty > 0
            ).reverse(); // LIFO: 反转数组，从最新的明细开始匹配
            
            if (matchableDetails.length === 0) {
                // 无可匹配明细
                const result = {
                    gNo: item.g_no,
                    declareSku: declareSku.sku,
                    declareQty: declareSku.qty,
                    matchStatus: '匹配失败',
                    matchedDetailId: '-',
                    contractNo: '-',
                    contractItemNo: '-',
                    invoiceNo: '-',
                    supplier: '-',
                    availableQty: 0,
                    matchQty: 0,
                    failReason: getFailReason(declareSku.sku, declareSku.qty),
                    isMultiMatch: false
                };
                matchResults.push(result);
            } else {
                // 有可匹配明细，进行分配（支持从多个明细中匹配）
                let remainingQty = declareSku.qty;
                let matchedDetailsList = [];
                
                for (let detail of matchableDetails) {
                    if (remainingQty <= 0) break;
                    
                    const matchQty = Math.min(remainingQty, detail.availableQty);
                    matchedDetailsList.push({
                        detailId: detail.id,
                        contractNo: detail.contractNo,
                        contractItemNo: detail.contractItemNo,
                        invoiceNo: detail.invoiceNo,
                        availableQty: detail.availableQty,
                        matchQty: matchQty,
                        supplier: detail.supplier
                    });
                    remainingQty -= matchQty;
                }
                
                const totalMatched = declareSku.qty - remainingQty;
                const matchStatus = remainingQty > 0 ? '部分匹配' : '完全匹配';
                
                // 创建结果记录（可能需要多条，每个匹配的明细一条）
                matchedDetailsList.forEach((matched, idx) => {
                    const result = {
                        gNo: item.g_no,
                        declareSku: declareSku.sku,
                        declareQty: idx === 0 ? declareSku.qty : '', // 只在第一行显示总数
                        matchStatus: idx === 0 ? matchStatus : '',  // 只在第一行显示状态
                        matchedDetailId: matched.detailId,
                        contractNo: matched.contractNo,
                        contractItemNo: matched.contractItemNo,
                        invoiceNo: matched.invoiceNo,
                        supplier: matched.supplier,
                        availableQty: matched.availableQty,
                        matchQty: matched.matchQty,
                        failReason: idx === 0 && remainingQty > 0 ? `还缺${remainingQty}件，需手动处理` : '',
                        isMultiMatch: matchedDetailsList.length > 1,
                        multiMatchIndex: idx,
                        multiMatchTotal: matchedDetailsList.length,
                        totalDeclareQty: declareSku.qty,
                        totalMatchedQty: totalMatched
                    };
                    matchResults.push(result);
                });
            }
        });
    });
    
    renderMatchResults();
}

// 获取匹配失败原因
function getFailReason(sku, qty) {
    const detail = mockSkuDetails.find(d => d.sku === sku);
    
    if (!detail) {
        return 'SKU不存在于采销明细中';
    }
    
    if (detail.contractStatus !== '签署完成') {
        return '对应合同尚未签署完成';
    }
    
    if (detail.availableQty < qty) {
        return `数量不足（明细可用: ${detail.availableQty}，报关需要: ${qty}）`;
    }
    
    return '未知原因';
}

// 渲染匹配结果
function renderMatchResults() {
    const tbody = document.getElementById('matchResultBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    matchResults.forEach((result, index) => {
        const row = document.createElement('tr');
        
        // 根据匹配状态设置背景色
        let bgColor = '#f6ffed'; // 完全匹配 - 绿色
        if (result.matchStatus === '部分匹配') {
            bgColor = '#fff7e6'; // 部分匹配 - 橙色
        } else if (result.matchStatus === '匹配失败') {
            bgColor = '#fff1f0'; // 匹配失败 - 红色
        }
        row.style.backgroundColor = bgColor;
        
        // 多明细匹配的样式
        if (result.isMultiMatch && result.multiMatchIndex > 0) {
            row.style.borderLeft = '3px solid #1890ff';
        }
        
        let statusClass = 'status-completed';
        if (result.matchStatus === '部分匹配') {
            statusClass = 'status-pending';
        } else if (result.matchStatus === '匹配失败') {
            statusClass = 'status-rejected';
        }
        
        row.innerHTML = `
            <td>${result.gNo || ''}</td>
            <td>
                <strong>${result.declareSku}</strong>
                ${result.isMultiMatch && result.multiMatchIndex > 0 ? 
                    '<br><small style="color: #1890ff;">↳ 续上</small>' : ''}
            </td>
            <td>
                ${result.declareQty !== '' ? 
                    `<strong>${result.declareQty}</strong>` : 
                    '<span style="color: #999;">-</span>'}
            </td>
            <td>
                ${result.matchStatus ? `
                    <span class="status-badge ${statusClass}">${result.matchStatus}</span>
                    ${result.isMultiMatch && result.multiMatchIndex === 0 ? 
                        `<br><small style="color: #1890ff;">从${result.multiMatchTotal}个明细匹配</small>` : ''}
                    ${result.failReason ? `<br><small style="color: #ff4d4f;">${result.failReason}</small>` : ''}
                ` : ''}
            </td>
            <td>${result.matchedDetailId}</td>
            <td>
                ${result.contractNo !== '-' ? 
                    `<a href="#" class="action-link" onclick="viewContract('${result.contractNo}')">${result.contractNo}</a>` : 
                    '-'}
            </td>
            <td>${result.contractItemNo || '-'}</td>
            <td>
                ${result.invoiceNo ? 
                    `<a href="#" class="action-link" onclick="viewInvoice('${result.invoiceNo}')">${result.invoiceNo}</a>` : 
                    '-'}
            </td>
            <td>${result.supplier}</td>
            <td>
                ${result.multiMatchIndex === 0 || !result.isMultiMatch ? `
                    <button class="btn btn-sm" onclick="viewMatchDetail(${index})">详情</button>
                    ${result.matchStatus === '匹配失败' || result.matchStatus === '部分匹配' ? 
                        `<button class="btn btn-primary btn-sm" onclick="manualMatch(${index})">手动处理</button>` : 
                        ''}
                ` : ''}
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// 显示JSON示例
function displayJsonExample() {
    const pre = document.getElementById('jsonExample');
    if (pre) {
        pre.textContent = JSON.stringify(declarationData, null, 2);
    }
}

// 自动匹配按钮
function autoMatch() {
    console.log('执行自动匹配...');
    performAutoMatch();
    showToast('自动匹配完成！');
}

// 确认匹配
function confirmMatch() {
    const successCount = matchResults.filter(r => r.matchStatus === '匹配成功').length;
    const failCount = matchResults.filter(r => r.matchStatus === '匹配失败').length;
    
    if (failCount > 0) {
        alert(`还有 ${failCount} 个SKU匹配失败，请先处理失败项！`);
        return;
    }
    
    const confirmed = confirm(`确认匹配 ${successCount} 个SKU？\n\n确认后将从采销明细中扣减相应数量。`);
    
    if (confirmed) {
        console.log('确认匹配，更新库存数量...');
        
        // 模拟更新库存
        matchResults.forEach(result => {
            if (result.matchStatus === '匹配成功') {
                const detail = mockSkuDetails.find(d => d.id === result.matchedDetailId);
                if (detail) {
                    detail.availableQty -= result.matchQty;
                }
            }
        });
        
        alert(`匹配确认成功！\n已从采销明细中扣减 ${successCount} 个SKU的报关数量。`);
    }
}

// 新建报关单
function createDeclaration() {
    console.log('新建报关单');
    alert('打开新建报关单界面...');
}

// 导出数据
function exportDeclarationData() {
    console.log('导出报关数据');
    alert('正在导出报关匹配数据...');
}

// 添加报关项
function addDeclarationItem() {
    console.log('添加报关项');
    alert('打开添加报关项界面...');
}

// 查看合同
function viewContract(contractNo) {
    console.log('查看合同:', contractNo);
    alert(`查看合同详情：${contractNo}`);
    return false;
}

// 查看发票
function viewInvoice(invoiceNo) {
    console.log('查看发票:', invoiceNo);
    alert(`查看发票详情：${invoiceNo}`);
    return false;
}

// 查看匹配详情
function viewMatchDetail(index) {
    const result = matchResults[index];
    console.log('查看匹配详情:', result);
    
    let message = `报关SKU: ${result.declareSku}\n`;
    message += `报关数量: ${result.declareQty}\n`;
    message += `匹配状态: ${result.matchStatus}\n\n`;
    
    if (result.matchStatus === '完全匹配' || result.matchStatus === '部分匹配') {
        message += `匹配的SKU明细ID: ${result.matchedDetailId}\n`;
        message += `合同编号: ${result.contractNo}\n`;
        message += `合同项号: ${result.contractItemNo || '-'}\n`;
        message += `关联发票: ${result.invoiceNo || '-'}\n`;
        message += `供应商: ${result.supplier}`;
        if (result.isMultiMatch && result.multiMatchIndex === 0) {
            message += `\n从${result.multiMatchTotal}个明细中匹配`;
        }
        if (result.failReason) {
            message += `\n\n${result.failReason}`;
        }
    } else {
        message += `失败原因: ${result.failReason}`;
    }
    
    alert(message);
}

// 手动匹配
function manualMatch(index) {
    const result = matchResults[index];
    console.log('手动匹配:', result);
    alert(`手动选择采销明细进行匹配...\n\nSKU: ${result.declareSku}\n需求数量: ${result.declareQty}`);
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
        if (document.body.contains(toast)) {
            document.body.removeChild(toast);
        }
    }, 2000);
}

// 返回首页
function goBack() {
    window.location.href = '../index.html';
}

