# 数据库表结构更新日志

## 更新日期：2025-11-28 (第五次更新)

### 更新内容：恢复 contract_invoice_match 表

---

## ✅ 恢复的表

### `contract_invoice_match` - 合同-发票匹配表

**恢复原因：**
- 用户确认"合同与发票关联管理"功能需要保留
- 该表用于记录合同与发票的关联关系，支持一对一和多对一关系
- 提供金额匹配状态、关联类型等业务字段

**表结构：**
- 支持一对一关系：一个合同对应一个发票
- 支持多对一关系：多个合同对应一个发票
- 记录金额匹配状态（匹配/不匹配/待核验）
- 记录关联类型（自动关联/手动关联）

---

## 📝 相关更新

### 1. 注释更新
- ✅ 更新 `purchase_sku_detail` 表的注释，说明发票信息通过 `contract_invoice_match` 表关联查询

### 2. 表编号调整
- ✅ `contract_invoice_match` 恢复为第5个表
- ✅ `sku_customs_declare_match` 调整为第6个表
- ✅ `v_declare_sku_contract_invoice_mapping` 视图调整为第7个

---

## 📊 当前表结构（恢复后）

### 核心业务表（4张）
1. `purchase_sku_detail` - 采销SKU明细表
2. `purchase_contract` - 采销合同主表
3. `purchase_contract_item` - 采销合同明细表
4. `input_invoice` - 进项发票表

### 关系匹配表（2张）
5. `contract_invoice_match` - 合同-发票匹配表
6. `sku_customs_declare_match` - SKU明细-报关匹配表

### 视图（1个）
7. `v_declare_sku_contract_invoice_mapping` - 映射关系视图

**总计：6张表 + 1个视图**

---

## 🔗 数据关联关系

### 合同与发票关联
```sql
-- 查询合同关联的发票信息
SELECT 
    pc.*,
    cim.invoice_id,
    cim.invoice_no,
    cim.relation_type,
    cim.amount_match_status,
    ii.amount_with_tax AS invoice_amount,
    ii.status AS invoice_status
FROM purchase_contract pc
LEFT JOIN contract_invoice_match cim 
    ON pc.contract_id = cim.contract_id 
    AND pc.location = cim.location
LEFT JOIN input_invoice ii 
    ON cim.invoice_id = ii.invoice_id 
    AND cim.location = ii.location
WHERE pc.location = 'CN' 
  AND pc.is_deleted = 0
  AND cim.is_deleted = 0;
```

### 发票关联的合同
```sql
-- 查询发票关联的合同信息（支持多对一）
SELECT 
    ii.*,
    cim.contract_id,
    cim.contract_no,
    cim.relation_type,
    pc.total_amount_with_tax AS contract_amount,
    pc.status AS contract_status
FROM input_invoice ii
LEFT JOIN contract_invoice_match cim 
    ON ii.invoice_id = cim.invoice_id 
    AND ii.location = cim.location
LEFT JOIN purchase_contract pc 
    ON cim.contract_id = pc.contract_id 
    AND cim.location = pc.location
WHERE ii.location = 'CN' 
  AND ii.is_deleted = 0
  AND cim.is_deleted = 0;
```

---

**更新完成时间：** 2025-11-28  
**更新者：** AI Assistant

---

---

## 更新日期：2025-11-28 (第四次更新)

### 更新内容：删除 contract_invoice_match 表（合同与发票关联管理不需要）

---

## ❌ 删除的表

### `contract_invoice_match` - 合同-发票匹配表

**删除原因：**
- 用户明确表示"合同与发票关联管理可以不需要"
- 发票信息已经通过 `sku_customs_declare_match.invoice_no` 字段直接关联
- 视图 `v_declare_sku_contract_invoice_mapping` 中发票信息通过 `sku_customs_declare_match` 表获取，不依赖匹配表

**替代方案：**
发票信息通过 `sku_customs_declare_match` 表直接关联：
```sql
-- 查询报关匹配中的发票信息
SELECT 
    scdm.*,
    ii.invoice_code,
    ii.amount_with_tax AS invoice_amount,
    ii.status AS invoice_status
FROM sku_customs_declare_match scdm
LEFT JOIN input_invoice ii 
    ON scdm.invoice_no = ii.invoice_no 
    AND scdm.location = ii.location
WHERE scdm.location = 'CN' 
  AND scdm.is_deleted = 0;
```

---

## 📝 相关更新

### 1. 注释更新
- ✅ 更新 `purchase_sku_detail` 表的注释，说明发票信息通过 `sku_customs_declare_match` 表关联查询

### 2. 表编号调整
- ✅ `sku_customs_declare_match` 从第6个表调整为第5个表
- ✅ `v_declare_sku_contract_invoice_mapping` 视图从第7个调整为第6个

---

## 📊 当前表结构（删除后）

### 核心业务表（4张）
1. `purchase_sku_detail` - 采销SKU明细表
2. `purchase_contract` - 采销合同主表
3. `purchase_contract_item` - 采销合同明细表
4. `input_invoice` - 进项发票表

### 关系匹配表（1张）
5. `sku_customs_declare_match` - SKU明细-报关匹配表

### 视图（1个）
6. `v_declare_sku_contract_invoice_mapping` - 映射关系视图

**总计：5张表 + 1个视图**

---

## ⚠️ 注意事项

### 数据迁移
如果已有 `contract_invoice_match` 表的数据，需要：
1. 将发票信息更新到 `sku_customs_declare_match.invoice_no` 字段
2. 删除 `contract_invoice_match` 表

### 应用层修改
- 所有查询 `contract_invoice_match` 的代码需要改为查询 `sku_customs_declare_match.invoice_no`
- 所有插入 `contract_invoice_match` 的操作需要改为更新 `sku_customs_declare_match.invoice_no`

---

**更新完成时间：** 2025-11-28  
**更新者：** AI Assistant

---

---

## 更新日期：2025-11-28 (第三次更新)

### 更新内容：删除冗余的 sku_contract_match 表

---

## ❌ 删除的表

### `sku_contract_match` - SKU明细-合同匹配表

**删除原因：**
- `purchase_contract_item` 表已经包含 `sku_detail_id` 字段，可以直接关联SKU明细
- `purchase_contract_item.quantity` 已经表示合同数量
- SKU明细与合同的关联关系已经通过 `purchase_contract_item` 表建立，无需额外的匹配表

**替代方案：**
合同信息通过 `purchase_contract_item` 表关联查询：
```sql
-- 查询SKU明细的合同信息
SELECT 
    psd.*,
    pci.contract_id,
    pci.contract_no,
    pci.contract_item_id,
    pci.item_no AS contract_item_no,
    pci.quantity AS contract_quantity,
    pc.status AS contract_status
FROM purchase_sku_detail psd
LEFT JOIN purchase_contract_item pci 
    ON psd.sku_detail_id = pci.sku_detail_id 
    AND psd.location = pci.location
LEFT JOIN purchase_contract pc 
    ON pci.contract_id = pc.contract_id 
    AND pci.location = pc.location
WHERE psd.location = 'CN' 
  AND psd.is_deleted = 0;
```

---

## 📝 相关更新

### 1. 注释更新
- ✅ 更新 `purchase_sku_detail` 表的注释，说明合同信息通过 `purchase_contract_item` 表关联查询

### 2. 表编号调整
- ✅ `contract_invoice_match` 从第6个表调整为第5个表
- ✅ `sku_customs_declare_match` 从第7个表调整为第6个表
- ✅ `v_declare_sku_contract_invoice_mapping` 视图从第8个调整为第7个

---

## 📊 当前表结构（删除后）

### 核心业务表（4张）
1. `purchase_sku_detail` - 采销SKU明细表
2. `purchase_contract` - 采销合同主表
3. `purchase_contract_item` - 采销合同明细表
4. `input_invoice` - 进项发票表

### 关系匹配表（2张）
5. `contract_invoice_match` - 合同-发票匹配表
6. `sku_customs_declare_match` - SKU明细-报关匹配表

### 视图（1个）
7. `v_declare_sku_contract_invoice_mapping` - 映射关系视图

**总计：6张表 + 1个视图**

---

## ⚠️ 注意事项

### 数据迁移
如果已有 `sku_contract_match` 表的数据，需要：
1. 将数据迁移到 `purchase_contract_item` 表
2. 确保 `purchase_contract_item.sku_detail_id` 正确关联
3. 删除 `sku_contract_match` 表

### 应用层修改
- 所有查询 `sku_contract_match` 的代码需要改为查询 `purchase_contract_item`
- 所有插入 `sku_contract_match` 的操作需要改为更新 `purchase_contract_item.sku_detail_id`

---

**更新完成时间：** 2025-11-28  
**更新者：** AI Assistant

---

---

## 更新日期：2025-11-28 (第二次更新)

### 更新内容：为所有表添加租户字段 location

---

## ✅ 新增字段

### 所有表统一添加
- ✅ `location` varchar(50) NOT NULL COMMENT '地区/租户'

**涉及的表（共7个）：**
1. `purchase_sku_detail` - 采销SKU明细表
2. `purchase_contract` - 采销合同主表
3. `purchase_contract_item` - 采销合同明细表
4. `input_invoice` - 进项发票表
5. `sku_contract_match` - SKU明细-合同匹配表
6. `contract_invoice_match` - 合同-发票匹配表
7. `sku_customs_declare_match` - SKU明细-报关匹配表

---

## 🔧 索引更新

### 1. 新增索引
每个表都添加了：
- ✅ `KEY idx_location (location)` - 租户索引

### 2. 唯一索引更新
以下表的唯一索引已包含 `location` 字段：
- ✅ `purchase_contract`: `uk_contract_no` → `(location, contract_no, is_deleted)`
- ✅ `input_invoice`: `uk_invoice_code_no` → `(location, invoice_code, invoice_no, is_deleted)`
- ✅ `sku_contract_match`: `uk_sku_contract_item` → `(location, sku_detail_id, contract_item_id)`

### 3. 组合索引
- ✅ `purchase_sku_detail`: 新增 `idx_location_sku (location, sku)` - 租户+SKU组合索引

---

## 🔗 视图更新

### `v_declare_sku_contract_invoice_mapping` 视图
- ✅ 添加 `location` 字段到 SELECT 列表
- ✅ 更新 JOIN 条件，包含 `location` 字段匹配：
  ```sql
  LEFT JOIN purchase_sku_detail psd 
    ON scdm.sku_detail_id = psd.sku_detail_id 
    AND scdm.location = psd.location
  LEFT JOIN purchase_contract pc 
    ON scdm.contract_id = pc.contract_id 
    AND scdm.location = pc.location
  LEFT JOIN input_invoice ii 
    ON scdm.invoice_no = ii.invoice_no 
    AND scdm.location = ii.location
  ```

---

## 📊 设计说明

### 多租户支持
通过 `location` 字段实现数据隔离：
- 每个租户的数据通过 `location` 字段区分
- 所有查询都需要包含 `location` 条件
- 唯一约束包含 `location`，确保同一租户内数据唯一性

### 查询示例
```sql
-- 查询指定租户的SKU明细
SELECT * FROM purchase_sku_detail 
WHERE location = 'CN' AND is_deleted = 0;

-- 查询指定租户的合同
SELECT * FROM purchase_contract 
WHERE location = 'CN' AND status = '已签署';

-- 跨表关联查询（必须包含location匹配）
SELECT 
    psd.*,
    scm.contract_no,
    pc.status AS contract_status
FROM purchase_sku_detail psd
LEFT JOIN sku_contract_match scm 
    ON psd.sku_detail_id = scm.sku_detail_id 
    AND psd.location = scm.location
LEFT JOIN purchase_contract pc 
    ON scm.contract_id = pc.contract_id 
    AND scm.location = pc.location
WHERE psd.location = 'CN' 
  AND psd.is_deleted = 0;
```

---

## ⚠️ 注意事项

### 1. **数据迁移**
如果已有数据，需要：
1. 为所有现有记录设置 `location` 值（根据业务规则）
2. 更新所有唯一索引约束
3. 更新所有关联查询，包含 `location` 条件

### 2. **应用层修改**
- 所有 INSERT 操作必须包含 `location` 值
- 所有 SELECT 查询必须包含 `location` 条件（或通过 JOIN 匹配）
- 所有 UPDATE/DELETE 操作必须包含 `location` 条件

### 3. **性能考虑**
- `location` 字段已建立索引，查询性能良好
- 组合索引 `idx_location_sku` 可优化按租户+SKU的查询
- 建议在 WHERE 条件中优先使用 `location` 进行过滤

---

## 📝 更新文件清单

- ✅ `finance_compliance_tables.sql` - 已更新所有表结构
- ✅ `SQL_UPDATE_LOG.md` - 已更新日志

---

**更新完成时间：** 2025-11-28  
**更新者：** AI Assistant

---

---

## 更新日期：2025-11-28 (第一次更新)

### 更新内容：清理 purchase_sku_detail 表冗余字段

---

## 📋 删除的字段

### 1. **数量相关字段**
- ❌ `delivered_qty` - 已交货数量（不需要）

### 2. **报关相关属性字段**
- ❌ `hs_code` - 海关编码
- ❌ `customs_declare_cn` - 报关品名(中文)
- ❌ `customs_declare_en` - 报关品名(英文)
- ❌ `spin_type` - 织造方式
- ❌ `fabric_type` - 成分

**说明：** 报关相关信息从 `sku_customs_declare_match` 表关联查询获取

### 3. **合同相关字段**
- ❌ `contract_id` - 关联合同ID
- ❌ `contract_no` - 合同编号
- ❌ `contract_status` - 合同状态

**说明：** 合同相关信息从 `sku_contract_match` 表关联查询获取

### 4. **发票相关字段**
- ❌ `is_invoiced` - 是否已开票
- ❌ `invoice_no` - 关联发票号

**说明：** 发票相关信息从 `contract_invoice_match` 表关联查询获取

---

## 🔧 删除的索引

- ❌ `uk_sku_contract` - 唯一索引（因为contract_no字段被删除）
- ❌ `idx_contract_id` - 合同ID索引
- ❌ `idx_contract_no` - 合同编号索引
- ❌ `idx_contract_status` - 合同状态索引

---

## ✅ 保留的字段

### 核心字段
- ✅ `sku_detail_id` - SKU明细ID（主键）
- ✅ `sku` - SKU编码
- ✅ `product_id` - 商品ID
- ✅ `spu` - SPU编码
- ✅ `product_name` - 商品名称
- ✅ `category` - 商品类别

### 供应商信息
- ✅ `supplier_code` - 供应商编码
- ✅ `supplier_name` - 供应商名称

### 采购主体信息
- ✅ `purchase_company_id` - 采购主体公司ID
- ✅ `purchase_company_name` - 采购主体名称

### 数量相关
- ✅ `quantity` - 采购数量
- ✅ `return_qty` - 退货数量
- ✅ `available_qty` - 报关可用数量

### 价格相关
- ✅ `unit_price` - 单价
- ✅ `total_amount` - 总金额
- ✅ `currency` - 币种

### 其他
- ✅ `statement_id` - 关联往来对账单ID
- ✅ `status` - 明细状态
- ✅ `shelf_date` - 上架日期
- ✅ `delivery_date` - 交货日期
- ✅ 时间戳字段（create_date, update_date等）

---

## 🔗 关联查询方式

### 查询合同信息
```sql
SELECT 
    psd.*,
    scm.contract_id,
    scm.contract_no,
    scm.contract_item_no,
    pc.status AS contract_status
FROM purchase_sku_detail psd
LEFT JOIN sku_contract_match scm ON psd.sku_detail_id = scm.sku_detail_id
LEFT JOIN purchase_contract pc ON scm.contract_id = pc.contract_id
WHERE psd.sku_detail_id = ?;
```

### 查询发票信息
```sql
SELECT 
    psd.*,
    cim.invoice_id,
    cim.invoice_no,
    ii.amount_with_tax AS invoice_amount,
    ii.status AS invoice_status
FROM purchase_sku_detail psd
LEFT JOIN sku_contract_match scm ON psd.sku_detail_id = scm.sku_detail_id
LEFT JOIN contract_invoice_match cim ON scm.contract_id = cim.contract_id
LEFT JOIN input_invoice ii ON cim.invoice_id = ii.invoice_id
WHERE psd.sku_detail_id = ?;
```

### 查询报关信息
```sql
SELECT 
    psd.*,
    scdm.declare_document_no,
    scdm.declare_quantity,
    scdm.matched_quantity,
    scdm.match_status,
    scdm.hs_code,
    scdm.customs_declare_cn,
    scdm.spin_type,
    scdm.fabric_type
FROM purchase_sku_detail psd
LEFT JOIN sku_customs_declare_match scdm ON psd.sku_detail_id = scdm.sku_detail_id
WHERE psd.sku_detail_id = ?;
```

### 完整关联查询（列表展示）
```sql
SELECT 
    psd.sku_detail_id,
    psd.sku,
    psd.product_name,
    psd.quantity,
    psd.return_qty,
    psd.available_qty,
    psd.supplier_name,
    psd.purchase_company_name,
    -- 合同信息（从映射表获取）
    scm.contract_no,
    scm.contract_item_no,
    pc.status AS contract_status,
    -- 发票信息（从映射表获取）
    cim.invoice_no,
    ii.amount_with_tax AS invoice_amount,
    -- 报关信息（从映射表获取）
    scdm.declare_document_no,
    scdm.match_status AS declare_match_status
FROM purchase_sku_detail psd
LEFT JOIN sku_contract_match scm ON psd.sku_detail_id = scm.sku_detail_id
LEFT JOIN purchase_contract pc ON scm.contract_id = pc.contract_id
LEFT JOIN contract_invoice_match cim ON scm.contract_id = cim.contract_id
LEFT JOIN input_invoice ii ON cim.invoice_id = ii.invoice_id
LEFT JOIN sku_customs_declare_match scdm ON psd.sku_detail_id = scdm.sku_detail_id
WHERE psd.is_deleted = 0;
```

---

## 📊 表结构对比

### 修改前
- 字段数：约 30+ 个字段
- 包含：合同、发票、报关冗余字段
- 索引：包含合同相关索引

### 修改后
- 字段数：约 20 个字段
- 只保留：核心业务字段
- 索引：仅保留核心查询索引
- **数据来源：** 通过关联表查询获取合同、发票、报关信息

---

## 🎯 设计优势

### 1. **数据规范化**
- 避免数据冗余
- 符合数据库设计第三范式
- 单一数据源原则

### 2. **数据一致性**
- 合同、发票、报关信息统一从映射表获取
- 避免数据不一致问题
- 便于数据维护

### 3. **查询灵活性**
- 支持一个SKU关联多个合同
- 支持一个合同关联多个发票
- 支持一个SKU关联多个报关单

### 4. **性能优化**
- 减少表字段数量
- 减少索引维护成本
- 查询时按需关联

---

## ⚠️ 注意事项

### 1. **可用数量计算**
`available_qty` 字段需要通过以下方式计算：
```sql
-- 方式1：通过触发器自动计算
-- 方式2：通过定时任务更新
-- 方式3：查询时实时计算

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
);
```

### 2. **列表查询性能**
由于需要关联多个表，建议：
- 使用合适的索引
- 考虑使用视图简化查询
- 对于高频查询，可以考虑物化视图或缓存

### 3. **数据迁移**
如果已有数据，需要：
1. 备份现有数据
2. 将合同、发票、报关信息迁移到对应的映射表
3. 删除冗余字段
4. 更新相关查询代码

---

## 📝 更新文件清单

- ✅ `finance_compliance_tables.sql` - 已更新表结构
- ⚠️ `DATABASE_DESIGN.md` - 需要更新文档说明
- ⚠️ 前端页面 - 需要更新查询逻辑（通过关联表获取数据）

---

**更新完成时间：** 2025-11-28  
**更新者：** AI Assistant

