# 数据库设计总结

## 📋 设计完成情况

✅ **已完成所有表结构设计，共计8张表 + 1个视图**

---

## 🎯 核心表设计 (4张)

### 1. ✅ purchase_sku_detail - 采销SKU明细表

**作用：** 系统数据起点，记录所有采购SKU信息

**关键特性：**
- 记录采购数量、退货数量、可用数量
- 关联合同和发票
- 支持报关匹配时的可用库存扣减
- **核心公式：** `available_qty = quantity - return_qty - 已报关数量`

**前端对应：** 采销SKU明细页面

---

### 2. ✅ purchase_contract - 采销合同主表

**作用：** 记录采购合同信息，支持审核和签署流程

**关键特性：**
- 支持合同状态流转（待审核→审核通过→签署中→签署完成）
- 记录供应商、采购方信息
- 支持发票关联（一对一/多对一）
- 包含金额计算字段

**前端对应：** 采销合同页面

---

### 3. ✅ purchase_contract_item - 采销合同明细表

**作用：** 记录合同的每个明细项

**关键特性：**
- 一个合同可包含多个SKU
- 每个明细项有独立的项号（用于报关追溯）
- 关联到SKU明细表

**前端对应：** 采销合同明细展示

---

### 4. ✅ input_invoice - 进项发票表

**作用：** 记录供应商开具的增值税发票

**关键特性：**
- 发票代码+发票号码唯一
- 支持多个合同关联同一发票（多对一）
- 记录认证状态
- 包含发票附件URL

**前端对应：** 进项发票管理页面

---

## 🔗 关系匹配表 (3张)

### 5. ✅ sku_contract_match - SKU明细-合同匹配表

**作用：** 记录SKU明细与合同的关联关系

**关系类型：** 1:1 (一个SKU明细对应一个合同项)

**关键特性：**
- 自动匹配：在合同生成时自动创建
- 记录匹配数量
- 唯一约束：(sku_detail_id, contract_item_id)

**前端对应：** 后台逻辑，前端不直接展示

---

### 6. ✅ contract_invoice_match - 合同-发票匹配表

**作用：** 记录合同与发票的关联关系

**关系类型：** 1:1 或 N:1 (支持多个合同对应一张发票)

**关键特性：**
- 支持两种关系类型
  - 一对一：一个合同开一张发票
  - 多对一：多个合同合并开一张发票
- 金额匹配校验
- 关联类型标记

**前端对应：** 合同-发票关联页面

---

### 7. ✅ sku_customs_declare_match - SKU明细-报关匹配表

**作用：** 记录SKU明细与报关单的匹配关系（核心表）

**关系类型：** N:M (多对多，支持FIFO匹配)

**关键特性：**
- **FIFO匹配策略**：优先使用最早的库存
- 支持多明细匹配（一个报关项可能匹配多个SKU明细）
- 支持部分匹配（可用数量不足时）
- 记录匹配顺序、匹配前后的可用数量
- 继承合同信息和发票信息用于追溯

**匹配场景：**
```
场景A：单明细完全匹配
  报关需求 50件 → SKU001可用100件 → 匹配50件

场景B：多明细匹配 (FIFO)
  报关需求 120件 → SKU001(100件) + SKU003(20件) → 按创建时间先后匹配

场景C：部分匹配
  报关需求 100件 → SKU002可用80件 → 只能匹配80件，需人工介入
```

**前端对应：** 
- 报关匹配管理页面
- 三方映射关系页面

---

## 📊 视图设计 (1个)

### 8. ✅ v_declare_sku_contract_invoice_mapping - 映射关系视图

**作用：** 快速查询报关-SKU-合同-发票的完整链路

**包含信息：**
- 报关单信息（报关单号、项号、数量）
- SKU信息（SKU编码、商品名称、可用数量）
- 合同信息（合同编号、供应商、状态）
- 发票信息（发票号、金额、状态）
- 报关商品信息（报关品名、海关编码、成分）

**前端对应：** 三方映射关系页面（所有视图）

---

## 🌊 数据流转流程

```
┌─────────────────────────────────────────────────────┐
│                   业务流程全景                       │
└─────────────────────────────────────────────────────┘

1️⃣ 采购阶段
   录入 purchase_sku_detail (采销SKU明细)
        ↓
2️⃣ 合同阶段
   生成 purchase_contract + purchase_contract_item
   创建 sku_contract_match (自动关联)
        ↓
3️⃣ 发票阶段
   录入 input_invoice
   创建 contract_invoice_match (一对一或多对一)
        ↓
4️⃣ 出库报关阶段 (核心)
   WMS系统创建报关单
        ↓
   触发自动匹配算法 (FIFO)
        ↓
   创建 sku_customs_declare_match
        ↓
   更新 purchase_sku_detail.available_qty
```

---

## 🔍 核心业务逻辑

### FIFO匹配算法

```sql
-- 1. 查找可用SKU明细
SELECT * FROM purchase_sku_detail
WHERE sku = '目标SKU'
  AND contract_status = '签署完成'
  AND available_qty > 0
  AND is_deleted = 0
ORDER BY create_date ASC;  -- FIFO: 先进先出

-- 2. 依次扣减库存
FOR EACH 明细 IN 可用明细列表:
    IF 剩余需求数量 > 0:
        匹配数量 = MIN(明细.available_qty, 剩余需求数量)
        
        -- 记录匹配
        INSERT INTO sku_customs_declare_match (...)
        
        -- 更新可用数量
        UPDATE purchase_sku_detail 
        SET available_qty = available_qty - 匹配数量
        WHERE sku_detail_id = 明细.sku_detail_id
        
        剩余需求数量 -= 匹配数量
```

---

## 📈 索引策略

### 主键索引
所有表都有自增主键 `xxx_id`

### 唯一索引
- SKU明细：`uk_sku_contract (sku, contract_no, is_deleted)`
- 合同：`uk_contract_no (contract_no, is_deleted)`
- 发票：`uk_invoice_code_no (invoice_code, invoice_no, is_deleted)`
- SKU-合同匹配：`uk_sku_contract_item (sku_detail_id, contract_item_id)`

### 关联索引
- 外键字段都有索引（如 `idx_contract_id`, `idx_sku_detail_id`）
- 状态字段索引（如 `idx_status`, `idx_contract_status`）
- 时间字段组合索引（如 `idx_is_deleted_create_date`）

### 业务索引
- `idx_available_qty` - 可用库存查询
- `idx_sku` - SKU匹配查询
- `idx_match_date` - 时间范围查询

---

## 🎨 与前端页面的对应关系

| 前端页面 | 主要对应表 | 辅助表 |
|----------|------------|--------|
| 📦 采销SKU明细 | `purchase_sku_detail` | `purchase_contract` |
| 📄 采销合同 | `purchase_contract`, `purchase_contract_item` | `input_invoice` |
| 🧾 进项发票管理 | `input_invoice` | - |
| 🔗 合同-发票关联 | `contract_invoice_match` | `purchase_contract`, `input_invoice` |
| 🚢 报关匹配管理 | `sku_customs_declare_match` | `purchase_sku_detail`, 报关表 |
| 🔀 三方映射关系 | `v_declare_sku_contract_invoice_mapping` | 所有相关表 |

---

## 📝 数据示例

### 示例：LC788786-P3010-XL 的完整链路

```
1. SKU明细
   SKU001: LC788786-P3010-XL, 数量100, 可用100
   SKU003: LC788786-P3010-XL, 数量100, 可用100

2. 合同
   HT202511210001: SKU001, 项号1, 金额¥15,060
   HT202511210002: SKU003, 项号1, 金额¥15,060

3. 发票
   25352000: 关联 HT202511210001, 金额¥15,060 (一对一)
   25352001: 关联 HT202511210002, 金额¥15,060 (一对一)

4. 报关匹配 (FIFO)
   报关单 FBA194287Y1B, 项号1, 需求120件
   
   匹配结果:
   - SKU001 → 100件 (match_order=1, 最早创建)
   - SKU003 →  20件 (match_order=2, 较新创建)
   
   更新后:
   - SKU001.available_qty = 0
   - SKU003.available_qty = 80
```

---

## 🔧 性能优化建议

### 1. 分区策略
```sql
-- 报关匹配表按年分区
ALTER TABLE sku_customs_declare_match 
PARTITION BY RANGE (YEAR(match_date)) (...);
```

### 2. 归档策略
- 定期归档2年前的报关匹配数据
- 保持主表数据量在合理范围

### 3. 统计信息
- 定期执行 `ANALYZE TABLE`
- 定期执行 `OPTIMIZE TABLE`

### 4. 慢查询优化
- 启用慢查询日志
- 定期分析并优化慢查询

---

## 📚 相关文档

1. **finance_compliance_tables.sql** - 完整的建表SQL脚本
2. **DATABASE_DESIGN.md** - 详细的数据库设计文档（包含ER图、字段说明、业务规则）
3. **SQL_QUICK_REFERENCE.md** - 快速参考手册（包含常用查询、统计分析）

---

## ✅ 设计特点

1. **完整性** - 覆盖从采购到报关的完整业务流程
2. **可追溯** - 每个环节都有详细记录，支持全链路追溯
3. **灵活性** - 支持多种业务场景（一对一、多对一、FIFO匹配）
4. **扩展性** - 预留字段和索引，便于未来扩展
5. **性能** - 合理的索引设计，支持高效查询
6. **安全性** - 软删除、版本控制、时间戳记录

---

## 🎉 设计亮点

### 1. FIFO匹配算法
- 自动按先进先出原则匹配库存
- 支持多明细匹配
- 支持部分匹配
- 记录详细的匹配过程

### 2. 灵活的发票关联
- 支持一对一关系（标准场景）
- 支持多对一关系（合并开票）
- 自动金额校验

### 3. 完整的状态流转
- SKU明细：待处理 → 合同待生成 → 签署中 → 签署完成 → 已报关
- 合同：待审核 → 审核通过 → 签署中 → 签署完成
- 发票：待认证 → 已认证

### 4. 多维度查询支持
- 按报关单维度查看
- 按SKU明细维度查看
- 按合同维度查看
- 按发票维度查看

---

## 🚀 下一步工作

### 开发建议

1. **接口开发**
   - SKU明细CRUD接口
   - 合同生成接口
   - 报关自动匹配接口
   - 映射关系查询接口

2. **业务规则实现**
   - FIFO匹配算法实现
   - 金额校验逻辑
   - 状态流转控制

3. **数据初始化**
   - 导入现有报关数据
   - 创建测试数据
   - 数据一致性校验

4. **监控告警**
   - 可用库存预警
   - 部分匹配告警
   - 金额不匹配告警

---

**设计完成时间：** 2025-11-28  
**设计者：** AI Assistant  
**状态：** ✅ 已完成，可投入开发

