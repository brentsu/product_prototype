# 数据库快速参考手册

## 📊 表结构总览

### 核心业务表 (4张)

| 表名 | 中文名 | 主要用途 | 核心字段 |
|------|--------|----------|----------|
| `purchase_sku_detail` | 采销SKU明细表 | 记录采购SKU信息 | `sku`, `quantity`, `available_qty`, `contract_no` |
| `purchase_contract` | 采销合同主表 | 记录合同信息 | `contract_no`, `status`, `invoice_no` |
| `purchase_contract_item` | 采销合同明细表 | 记录合同明细项 | `contract_id`, `item_no`, `sku` |
| `input_invoice` | 进项发票表 | 记录供应商发票 | `invoice_no`, `amount_with_tax`, `related_contracts` |

### 关系匹配表 (3张)

| 表名 | 中文名 | 关系类型 | 业务含义 |
|------|--------|----------|----------|
| `sku_contract_match` | SKU-合同匹配表 | 1:1 | SKU明细生成合同时的关联 |
| `contract_invoice_match` | 合同-发票匹配表 | 1:1或N:1 | 合同与发票的开票关系 |
| `sku_customs_declare_match` | SKU-报关匹配表 | N:M | 报关出库时的FIFO匹配 |

### 已有报关表 (3张)

| 表名 | 中文名 | 说明 |
|------|--------|------|
| `stockout_customs_declare_document` | 报关单据表 | WMS系统已有 |
| `stockout_customs_declare_document_item` | 报关明细表 | WMS系统已有 |
| `stockout_customs_declare_document_aggregated_item` | 报关聚合明细表 | WMS系统已有 |

---

## 🔗 关系图谱

```
采购SKU明细 (purchase_sku_detail)
    ↓ 1:1
采销合同 (purchase_contract) + 合同明细 (purchase_contract_item)
    ↓ 1:1 或 N:1
进项发票 (input_invoice)
    ↓
    关联到SKU明细
    ↓ N:M (FIFO)
报关单 (stockout_customs_declare_document)
```

---

## 🎯 核心字段说明

### purchase_sku_detail (关键字段)

```sql
sku_detail_id       INT           -- 主键
sku                 VARCHAR(100)  -- SKU编码 ⭐
quantity            INT           -- 采购数量
return_qty          INT           -- 退货数量
available_qty       INT           -- 报关可用数量 ⭐⭐⭐
contract_no         VARCHAR(100)  -- 合同编号
invoice_no          VARCHAR(100)  -- 发票号
contract_status     VARCHAR(50)   -- 合同状态
```

**核心公式：**
```
available_qty = quantity - return_qty - SUM(已报关数量)
```

---

### purchase_contract (关键字段)

```sql
contract_id                 INT           -- 主键
contract_no                 VARCHAR(100)  -- 合同编号 ⭐
status                      VARCHAR(50)   -- 合同状态
audit_status                VARCHAR(50)   -- 审核状态
signing_status              VARCHAR(50)   -- 签署状态
invoice_no                  VARCHAR(100)  -- 关联发票号
invoice_relation_type       VARCHAR(20)   -- 一对一/多对一
total_amount_with_tax       DECIMAL(18,2) -- 含税总额
```

**状态流转：**
```
待审核 → 审核通过 → 签署中 → 签署完成
```

---

### sku_customs_declare_match (关键字段)

```sql
match_id                        INT           -- 主键
sku_detail_id                   INT           -- SKU明细ID ⭐
declare_document_id             INT           -- 报关单ID ⭐
declare_document_aggregated_item_id INT       -- 报关聚合项ID
g_no                            INT           -- 报关项号
declare_quantity                INT           -- 报关数量
matched_quantity                INT           -- 匹配数量 ⭐⭐⭐
match_status                    VARCHAR(50)   -- 完全匹配/部分匹配
match_strategy                  VARCHAR(50)   -- FIFO/LIFO
match_order                     INT           -- 匹配顺序
contract_no                     VARCHAR(100)  -- 合同编号
contract_item_no                VARCHAR(50)   -- 合同项号
invoice_no                      VARCHAR(100)  -- 发票号
```

**匹配逻辑：**
1. 按SKU查找可用明细
2. 按create_date ASC排序（FIFO）
3. 依次扣减直到满足报关数量
4. 记录每次匹配的详细信息

---

## 💡 常用查询

### 1. 查询SKU可用库存

```sql
SELECT 
    sku,
    product_name,
    SUM(available_qty) AS total_available,
    COUNT(*) AS detail_count
FROM purchase_sku_detail
WHERE is_deleted = 0
  AND contract_status = '签署完成'
  AND available_qty > 0
GROUP BY sku, product_name
ORDER BY sku;
```

---

### 2. 查询合同发票关联

```sql
SELECT 
    pc.contract_no,
    pc.supplier_name,
    pc.total_amount_with_tax AS contract_amount,
    ii.invoice_no,
    ii.amount_with_tax AS invoice_amount,
    cim.relation_type,
    CASE 
        WHEN cim.relation_type = '一对一' 
            THEN IF(pc.total_amount_with_tax = ii.amount_with_tax, '匹配', '不匹配')
        ELSE '多对一'
    END AS amount_check
FROM purchase_contract pc
LEFT JOIN contract_invoice_match cim 
    ON pc.contract_id = cim.contract_id
LEFT JOIN input_invoice ii 
    ON cim.invoice_id = ii.invoice_id
WHERE pc.is_deleted = 0;
```

---

### 3. 查询报关单完整链路

```sql
SELECT 
    cd.declare_document_no AS '报关单号',
    cda.g_no AS '项号',
    cda.customs_declare_cn AS '报关品名',
    cda.qty AS '报关数量',
    sdm.sku AS 'SKU',
    sdm.matched_quantity AS '匹配数量',
    sdm.match_order AS '匹配顺序',
    sdm.match_status AS '匹配状态',
    psd.supplier_name AS '供应商',
    pc.contract_no AS '合同编号',
    sdm.contract_item_no AS '合同项号',
    ii.invoice_no AS '发票号',
    ii.invoice_date AS '开票日期'
FROM stockout_customs_declare_document cd
JOIN stockout_customs_declare_document_aggregated_item cda 
    ON cd.declare_document_id = cda.declare_document_id
LEFT JOIN sku_customs_declare_match sdm 
    ON cda.declare_document_aggregated_item_id = sdm.declare_document_aggregated_item_id
    AND sdm.is_deleted = 0
LEFT JOIN purchase_sku_detail psd 
    ON sdm.sku_detail_id = psd.sku_detail_id
LEFT JOIN purchase_contract pc 
    ON sdm.contract_id = pc.contract_id
LEFT JOIN input_invoice ii 
    ON sdm.invoice_no = ii.invoice_no
WHERE cd.declare_document_no = 'FBA194287Y1B'
  AND cd.is_deleted = 0
ORDER BY cda.g_no, sdm.match_order;
```

---

### 4. 查询SKU的报关使用情况

```sql
SELECT 
    psd.sku,
    psd.product_name,
    psd.quantity AS '合同数量',
    psd.return_qty AS '退货数量',
    COALESCE(SUM(sdm.matched_quantity), 0) AS '已报关数量',
    psd.available_qty AS '可用数量',
    COUNT(DISTINCT sdm.declare_document_no) AS '报关单数'
FROM purchase_sku_detail psd
LEFT JOIN sku_customs_declare_match sdm 
    ON psd.sku_detail_id = sdm.sku_detail_id
    AND sdm.is_deleted = 0
WHERE psd.is_deleted = 0
  AND psd.contract_status = '签署完成'
GROUP BY psd.sku_detail_id, psd.sku, psd.product_name, 
         psd.quantity, psd.return_qty, psd.available_qty
ORDER BY psd.sku;
```

---

### 5. 查询发票的合同关联明细

```sql
SELECT 
    ii.invoice_no AS '发票号',
    ii.amount_with_tax AS '发票金额',
    ii.related_contract_count AS '关联合同数',
    GROUP_CONCAT(DISTINCT pc.contract_no) AS '合同列表',
    SUM(pc.total_amount_with_tax) AS '合同金额汇总',
    CASE 
        WHEN SUM(pc.total_amount_with_tax) = ii.amount_with_tax 
            THEN '金额匹配'
        ELSE '金额不匹配'
    END AS '金额状态'
FROM input_invoice ii
LEFT JOIN contract_invoice_match cim 
    ON ii.invoice_id = cim.invoice_id
    AND cim.is_deleted = 0
LEFT JOIN purchase_contract pc 
    ON cim.contract_id = pc.contract_id
WHERE ii.is_deleted = 0
GROUP BY ii.invoice_id, ii.invoice_no, ii.amount_with_tax, ii.related_contract_count
ORDER BY ii.invoice_no;
```

---

## 📈 统计分析查询

### 1. 按供应商统计

```sql
SELECT 
    supplier_name AS '供应商',
    COUNT(DISTINCT contract_no) AS '合同数',
    SUM(quantity) AS '总采购数量',
    SUM(available_qty) AS '可用数量',
    SUM(total_amount) AS '采购金额'
FROM purchase_sku_detail
WHERE is_deleted = 0
GROUP BY supplier_name
ORDER BY SUM(total_amount) DESC;
```

---

### 2. 按月统计报关数量

```sql
SELECT 
    DATE_FORMAT(cd.export_date, '%Y-%m') AS '月份',
    COUNT(DISTINCT cd.declare_document_no) AS '报关单数',
    SUM(cda.qty) AS '报关总件数',
    COUNT(DISTINCT sdm.sku) AS 'SKU种类数'
FROM stockout_customs_declare_document cd
JOIN stockout_customs_declare_document_aggregated_item cda 
    ON cd.declare_document_id = cda.declare_document_id
LEFT JOIN sku_customs_declare_match sdm 
    ON cda.declare_document_aggregated_item_id = sdm.declare_document_aggregated_item_id
WHERE cd.is_deleted = 0
  AND cd.export_date IS NOT NULL
GROUP BY DATE_FORMAT(cd.export_date, '%Y-%m')
ORDER BY DATE_FORMAT(cd.export_date, '%Y-%m') DESC;
```

---

### 3. 匹配状态分布

```sql
SELECT 
    match_status AS '匹配状态',
    COUNT(*) AS '记录数',
    SUM(matched_quantity) AS '匹配总数量',
    COUNT(DISTINCT declare_document_no) AS '涉及报关单数'
FROM sku_customs_declare_match
WHERE is_deleted = 0
GROUP BY match_status
ORDER BY COUNT(*) DESC;
```

---

## 🔧 维护脚本

### 1. 更新SKU可用数量

```sql
-- 重新计算SKU明细的可用数量
UPDATE purchase_sku_detail psd
SET available_qty = (
    psd.quantity 
    - psd.return_qty 
    - COALESCE((
        SELECT SUM(matched_quantity)
        FROM sku_customs_declare_match
        WHERE sku_detail_id = psd.sku_detail_id
          AND is_deleted = 0
    ), 0)
)
WHERE psd.is_deleted = 0;
```

---

### 2. 同步合同的发票关联数量

```sql
-- 更新合同表中的发票关联信息
UPDATE purchase_contract pc
SET invoice_relation_type = (
    SELECT 
        CASE 
            WHEN COUNT(DISTINCT cim.invoice_id) = 0 THEN NULL
            WHEN COUNT(DISTINCT cim.contract_id) = 1 THEN '一对一'
            ELSE '多对一'
        END
    FROM contract_invoice_match cim
    WHERE cim.contract_id = pc.contract_id
      AND cim.is_deleted = 0
)
WHERE pc.is_deleted = 0;
```

---

### 3. 检查数据一致性

```sql
-- 检查发票金额与关联合同金额是否匹配
SELECT 
    ii.invoice_no,
    ii.amount_with_tax AS invoice_amount,
    SUM(pc.total_amount_with_tax) AS contract_total,
    ii.amount_with_tax - SUM(pc.total_amount_with_tax) AS diff
FROM input_invoice ii
JOIN contract_invoice_match cim 
    ON ii.invoice_id = cim.invoice_id
JOIN purchase_contract pc 
    ON cim.contract_id = pc.contract_id
WHERE ii.is_deleted = 0
  AND cim.is_deleted = 0
  AND pc.is_deleted = 0
GROUP BY ii.invoice_id, ii.invoice_no, ii.amount_with_tax
HAVING ABS(diff) > 0.01;  -- 允许0.01的误差
```

---

## ⚠️ 重要提示

### 数据操作注意事项

1. **软删除**
   - 所有表使用 `is_deleted` 字段进行软删除
   - 查询时务必添加 `WHERE is_deleted = 0`

2. **版本控制**
   - 所有表都有 `version` 字段用于乐观锁
   - 更新时需要校验版本号

3. **时间戳**
   - `create_date` 自动记录创建时间
   - `update_date` 自动更新修改时间

4. **金额字段**
   - 使用 `DECIMAL(18,2)` 存储金额
   - 计算时注意精度问题

---

## 📞 技术支持

如有疑问，请参考：
- **详细设计文档：** `DATABASE_DESIGN.md`
- **SQL脚本：** `finance_compliance_tables.sql`

---

**版本：** V2.0  
**更新时间：** 2025-11-28

