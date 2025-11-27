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
                    "qty": 3
                },
                {
                    "sku": "LC788786-P3010-2XL",
                    "qty": 3
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
        supplier: '广州XX服饰有限公司',
        quantity: 100,
        deliveredQty: 0,
        returnQty: 0,
        availableQty: 100,
        contractStatus: '签署完成'
    },
    {
        id: 'SKU002',
        sku: 'LC788786-P3010-2XL',
        contractNo: 'HT202511210001',
        supplier: '广州XX服饰有限公司',
        quantity: 200,
        deliveredQty: 100,
        returnQty: 20,
        availableQty: 80,
        contractStatus: '签署完成'
    },
    {
        id: 'SKU003',
        sku: 'LC788786-P3010-S',
        contractNo: 'HT202511210002',
        supplier: '广州XX服饰有限公司',
        quantity: 100,
        deliveredQty: 0,
        returnQty: 0,
        availableQty: 100,
        contractStatus: '签署完成'
    },
    {
        id: 'SKU004',
        sku: 'LC628573-P105-M',
        contractNo: 'HT202511210003',
        supplier: '深圳YY制衣厂',
        quantity: 500,
        deliveredQty: 0,
        returnQty: 0,
        availableQty: 500,
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
            // 在采销明细中查找匹配的SKU
            const matchedDetail = mockSkuDetails.find(detail => 
                detail.sku === declareSku.sku && 
                detail.contractStatus === '签署完成' &&
                detail.availableQty >= declareSku.qty
            );
            
            const result = {
                gNo: item.g_no,
                declareSku: declareSku.sku,
                declareQty: declareSku.qty,
                matchStatus: matchedDetail ? '匹配成功' : '匹配失败',
                matchedDetailId: matchedDetail ? matchedDetail.id : '-',
                contractNo: matchedDetail ? matchedDetail.contractNo : '-',
                supplier: matchedDetail ? matchedDetail.supplier : '-',
                availableQty: matchedDetail ? matchedDetail.availableQty : 0,
                matchQty: matchedDetail ? declareSku.qty : 0,
                failReason: matchedDetail ? '' : getFailReason(declareSku.sku, declareSku.qty)
            };
            
            matchResults.push(result);
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
        return `可用数量不足（可用: ${detail.availableQty}，需要: ${qty}）`;
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
        const bgColor = result.matchStatus === '匹配成功' ? '#f6ffed' : '#fff1f0';
        row.style.backgroundColor = bgColor;
        
        const statusClass = result.matchStatus === '匹配成功' ? 'status-completed' : 'status-rejected';
        
        row.innerHTML = `
            <td>${result.gNo}</td>
            <td><strong>${result.declareSku}</strong></td>
            <td>${result.declareQty}</td>
            <td>
                <span class="status-badge ${statusClass}">${result.matchStatus}</span>
                ${result.failReason ? `<br><small style="color: #ff4d4f;">${result.failReason}</small>` : ''}
            </td>
            <td>${result.matchedDetailId}</td>
            <td>
                ${result.contractNo !== '-' ? 
                    `<a href="#" class="action-link" onclick="viewContract('${result.contractNo}')">${result.contractNo}</a>` : 
                    '-'}
            </td>
            <td>${result.supplier}</td>
            <td>${result.availableQty}</td>
            <td class="amount-highlight">${result.matchQty}</td>
            <td>
                <button class="btn btn-sm" onclick="viewMatchDetail(${index})">详情</button>
                ${result.matchStatus === '匹配失败' ? 
                    `<button class="btn btn-primary btn-sm" onclick="manualMatch(${index})">手动匹配</button>` : 
                    ''}
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

// 查看匹配详情
function viewMatchDetail(index) {
    const result = matchResults[index];
    console.log('查看匹配详情:', result);
    
    let message = `报关SKU: ${result.declareSku}\n`;
    message += `报关数量: ${result.declareQty}\n`;
    message += `匹配状态: ${result.matchStatus}\n\n`;
    
    if (result.matchStatus === '匹配成功') {
        message += `匹配的SKU明细ID: ${result.matchedDetailId}\n`;
        message += `合同编号: ${result.contractNo}\n`;
        message += `供应商: ${result.supplier}\n`;
        message += `可用数量: ${result.availableQty}\n`;
        message += `匹配数量: ${result.matchQty}`;
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

