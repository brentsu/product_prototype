-- ==========================================
-- 财务合规管理系统 - 数据库表设计
-- 版本: V2.0
-- 创建日期: 2025-11-28
-- 说明: 结合报关流程的完整财务合规数据模型
-- ==========================================

-- ==========================================
-- 1. 采销SKU明细表
-- 说明: 记录采购SKU的详细信息，是整个业务流程的起点
-- ==========================================
CREATE TABLE `purchase_sku_detail` (
  `sku_detail_id` int NOT NULL AUTO_INCREMENT COMMENT 'SKU明细ID',
  `sku` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'SKU编码',
  `product_id` int NOT NULL DEFAULT '0' COMMENT '商品ID',
  `spu` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'SPU编码',
  `product_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '商品名称',
  `category` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '商品类别',
  
  -- 供应商信息
  `supplier_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '供应商编码',
  `supplier_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '供应商名称',
  
  -- 采购主体信息
  `purchase_company_id` int NOT NULL COMMENT '采购主体公司ID',
  `purchase_company_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '采购主体名称',
  
  -- 数量相关
  `quantity` int NOT NULL DEFAULT '0' COMMENT '采购数量',
  `delivered_qty` int NOT NULL DEFAULT '0' COMMENT '已交货数量',
  `return_qty` int NOT NULL DEFAULT '0' COMMENT '退货数量',
  `available_qty` int NOT NULL DEFAULT '0' COMMENT '报关可用数量(quantity - return_qty - 已报关数量)',
  
  -- 价格相关
  `unit_price` decimal(18,4) NOT NULL DEFAULT '0.0000' COMMENT '单价',
  `total_amount` decimal(18,2) NOT NULL DEFAULT '0.00' COMMENT '总金额',
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CNY' COMMENT '币种',
  
  -- 报关相关属性
  `hs_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '海关编码',
  `customs_declare_cn` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '报关品名(中文)',
  `customs_declare_en` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '报关品名(英文)',
  `spin_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '织造方式(针织/梭织)',
  `fabric_type` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '成分',
  
  -- 合同相关
  `contract_id` int DEFAULT NULL COMMENT '关联合同ID',
  `contract_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '合同编号',
  `contract_status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '待生成' COMMENT '合同状态:待生成/签署中/签署完成',
  
  -- 发票相关
  `is_invoiced` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否已开票 0-否 1-是',
  `invoice_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '关联发票号',
  
  -- 对账单相关
  `statement_id` int DEFAULT NULL COMMENT '关联往来对账单ID',
  
  -- 业务状态
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '待处理' COMMENT '明细状态',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否已删除 0-否 1-是',
  
  -- 时间信息
  `shelf_date` timestamp NULL DEFAULT NULL COMMENT '上架日期',
  `delivery_date` timestamp NULL DEFAULT NULL COMMENT '交货日期',
  `create_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `create_by` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '创建者',
  `update_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `update_by` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '更新者',
  `version` bigint NOT NULL DEFAULT '0' COMMENT '版本号',
  
  PRIMARY KEY (`sku_detail_id`),
  UNIQUE KEY `uk_sku_contract` (`sku`, `contract_no`, `is_deleted`),
  KEY `idx_sku` (`sku`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_supplier_code` (`supplier_code`),
  KEY `idx_contract_id` (`contract_id`),
  KEY `idx_contract_no` (`contract_no`),
  KEY `idx_contract_status` (`contract_status`),
  KEY `idx_status` (`status`),
  KEY `idx_is_deleted_create_date` (`is_deleted`, `create_date`),
  KEY `idx_available_qty` (`available_qty`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='采销SKU明细表';


-- ==========================================
-- 2. 采销合同表
-- 说明: 记录采购合同的主表信息
-- ==========================================
CREATE TABLE `purchase_contract` (
  `contract_id` int NOT NULL AUTO_INCREMENT COMMENT '合同ID',
  `contract_no` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '合同编号',
  
  -- 合同主体信息
  `supplier_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '供方名称(供应商)',
  `supplier_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '供方编码',
  `buyer_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '需方名称(采购方)',
  `buyer_company_id` int NOT NULL COMMENT '需方公司ID',
  
  -- 金额信息
  `total_amount_without_tax` decimal(18,2) NOT NULL DEFAULT '0.00' COMMENT '不含税总额',
  `tax_rate` decimal(5,4) NOT NULL DEFAULT '0.0000' COMMENT '税率',
  `tax_amount` decimal(18,2) NOT NULL DEFAULT '0.00' COMMENT '税额',
  `total_amount_with_tax` decimal(18,2) NOT NULL DEFAULT '0.00' COMMENT '含税总额',
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CNY' COMMENT '币种',
  
  -- 数量信息
  `total_quantity` int NOT NULL DEFAULT '0' COMMENT '合同总数量',
  `total_item_count` int NOT NULL DEFAULT '0' COMMENT '合同项数',
  
  -- 合同状态
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '待审核' COMMENT '合同状态',
  `audit_status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '待审核' COMMENT '审核状态:待审核/审核通过/审核不通过',
  `signing_status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '未签署' COMMENT '签署状态:未签署/签署中/已签署',
  
  -- 签署信息
  `supplier_signing_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '供方签署链接',
  `buyer_signing_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '需方签署链接',
  `supplier_contract_file` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '供方签署合同文件',
  `buyer_contract_file` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '需方签署合同文件',
  
  -- 发票关联
  `invoice_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '关联发票号',
  `invoice_status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '未开票' COMMENT '开票状态',
  `invoice_relation_type` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '发票关系类型:一对一/多对一',
  
  -- 对账单关联
  `statement_id` int DEFAULT NULL COMMENT '关联往来对账单ID',
  
  -- 审核和签署时间
  `audit_time` timestamp NULL DEFAULT NULL COMMENT '审核时间',
  `auditor` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '审核人',
  `supplier_sign_time` timestamp NULL DEFAULT NULL COMMENT '供方签署时间',
  `buyer_sign_time` timestamp NULL DEFAULT NULL COMMENT '需方签署时间',
  
  -- 其他
  `remark` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '备注',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否已删除 0-否 1-是',
  
  -- 时间信息
  `create_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `create_by` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '创建者',
  `update_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `update_by` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '更新者',
  `version` bigint NOT NULL DEFAULT '0' COMMENT '版本号',
  
  PRIMARY KEY (`contract_id`),
  UNIQUE KEY `uk_contract_no` (`contract_no`, `is_deleted`),
  KEY `idx_supplier_code` (`supplier_code`),
  KEY `idx_buyer_company_id` (`buyer_company_id`),
  KEY `idx_status` (`status`),
  KEY `idx_audit_status` (`audit_status`),
  KEY `idx_signing_status` (`signing_status`),
  KEY `idx_invoice_no` (`invoice_no`),
  KEY `idx_is_deleted_create_date` (`is_deleted`, `create_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='采销合同主表';


-- ==========================================
-- 3. 采销合同明细表
-- 说明: 记录合同的明细项，一个合同可以有多个明细项
-- ==========================================
CREATE TABLE `purchase_contract_item` (
  `contract_item_id` int NOT NULL AUTO_INCREMENT COMMENT '合同项ID',
  `contract_id` int NOT NULL COMMENT '合同ID',
  `contract_no` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '合同编号',
  `item_no` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '合同项号',
  
  -- SKU信息
  `sku` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'SKU编码',
  `product_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '商品名称',
  
  -- 数量和价格
  `quantity` int NOT NULL DEFAULT '0' COMMENT '数量',
  `unit_price` decimal(18,4) NOT NULL DEFAULT '0.0000' COMMENT '单价',
  `amount_without_tax` decimal(18,2) NOT NULL DEFAULT '0.00' COMMENT '不含税金额',
  `tax_amount` decimal(18,2) NOT NULL DEFAULT '0.00' COMMENT '税额',
  `amount_with_tax` decimal(18,2) NOT NULL DEFAULT '0.00' COMMENT '含税金额',
  
  -- 关联SKU明细
  `sku_detail_id` int DEFAULT NULL COMMENT '关联SKU明细ID',
  
  -- 时间信息
  `create_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `create_by` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '创建者',
  `update_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `update_by` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '更新者',
  `version` bigint NOT NULL DEFAULT '0' COMMENT '版本号',
  
  PRIMARY KEY (`contract_item_id`),
  KEY `idx_contract_id` (`contract_id`),
  KEY `idx_contract_no` (`contract_no`),
  KEY `idx_sku` (`sku`),
  KEY `idx_sku_detail_id` (`sku_detail_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='采销合同明细表';


-- ==========================================
-- 4. 进项发票表
-- 说明: 记录供应商开具的增值税发票
-- ==========================================
CREATE TABLE `input_invoice` (
  `invoice_id` int NOT NULL AUTO_INCREMENT COMMENT '发票ID',
  `invoice_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '发票代码',
  `invoice_no` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '发票号码',
  `invoice_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '增值税专用发票' COMMENT '发票类型',
  
  -- 开票信息
  `seller_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '销方名称(供应商)',
  `seller_tax_no` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '销方税号',
  `buyer_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '购方名称',
  `buyer_tax_no` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '购方税号',
  
  -- 金额信息
  `amount_without_tax` decimal(18,2) NOT NULL DEFAULT '0.00' COMMENT '不含税金额',
  `tax_rate` decimal(5,4) NOT NULL DEFAULT '0.0000' COMMENT '税率',
  `tax_amount` decimal(18,2) NOT NULL DEFAULT '0.00' COMMENT '税额',
  `amount_with_tax` decimal(18,2) NOT NULL DEFAULT '0.00' COMMENT '价税合计',
  
  -- 发票状态
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '待认证' COMMENT '发票状态:待认证/已认证/已作废',
  `certification_status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '未认证' COMMENT '认证状态',
  
  -- 关联信息
  `related_contract_count` int NOT NULL DEFAULT '0' COMMENT '关联合同数量',
  `related_contracts` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '关联合同列表(JSON或逗号分隔)',
  
  -- 附件
  `attachment_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '发票附件URL',
  
  -- 时间信息
  `invoice_date` date NOT NULL COMMENT '开票日期',
  `certification_date` date DEFAULT NULL COMMENT '认证日期',
  `create_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `create_by` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '创建者',
  `update_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `update_by` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '更新者',
  `version` bigint NOT NULL DEFAULT '0' COMMENT '版本号',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否已删除 0-否 1-是',
  
  PRIMARY KEY (`invoice_id`),
  UNIQUE KEY `uk_invoice_code_no` (`invoice_code`, `invoice_no`, `is_deleted`),
  KEY `idx_invoice_no` (`invoice_no`),
  KEY `idx_seller_tax_no` (`seller_tax_no`),
  KEY `idx_buyer_tax_no` (`buyer_tax_no`),
  KEY `idx_status` (`status`),
  KEY `idx_invoice_date` (`invoice_date`),
  KEY `idx_is_deleted_create_date` (`is_deleted`, `create_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='进项发票表';


-- ==========================================
-- 5. SKU明细-合同匹配表
-- 说明: 记录SKU明细与合同的关联关系
-- ==========================================
CREATE TABLE `sku_contract_match` (
  `match_id` int NOT NULL AUTO_INCREMENT COMMENT '匹配ID',
  `sku_detail_id` int NOT NULL COMMENT 'SKU明细ID',
  `contract_id` int NOT NULL COMMENT '合同ID',
  `contract_no` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '合同编号',
  `contract_item_id` int NOT NULL COMMENT '合同项ID',
  `contract_item_no` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '合同项号',
  
  -- SKU信息
  `sku` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'SKU编码',
  
  -- 匹配数量
  `matched_quantity` int NOT NULL DEFAULT '0' COMMENT '匹配数量',
  
  -- 匹配状态
  `match_status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '已匹配' COMMENT '匹配状态',
  `match_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '自动匹配' COMMENT '匹配类型:自动匹配/手动匹配',
  
  -- 时间信息
  `match_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '匹配时间',
  `create_by` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '创建者',
  `update_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `update_by` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '更新者',
  `version` bigint NOT NULL DEFAULT '0' COMMENT '版本号',
  
  PRIMARY KEY (`match_id`),
  UNIQUE KEY `uk_sku_contract_item` (`sku_detail_id`, `contract_item_id`),
  KEY `idx_sku_detail_id` (`sku_detail_id`),
  KEY `idx_contract_id` (`contract_id`),
  KEY `idx_contract_no` (`contract_no`),
  KEY `idx_sku` (`sku`),
  KEY `idx_match_date` (`match_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='SKU明细-合同匹配表';


-- ==========================================
-- 6. 合同-发票匹配表
-- 说明: 记录合同与发票的关联关系(支持一对一和多对一)
-- ==========================================
CREATE TABLE `contract_invoice_match` (
  `match_id` int NOT NULL AUTO_INCREMENT COMMENT '匹配ID',
  `contract_id` int NOT NULL COMMENT '合同ID',
  `contract_no` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '合同编号',
  `invoice_id` int NOT NULL COMMENT '发票ID',
  `invoice_no` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '发票号码',
  
  -- 关联类型
  `relation_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '关系类型:一对一/多对一',
  
  -- 金额匹配
  `contract_amount` decimal(18,2) NOT NULL DEFAULT '0.00' COMMENT '合同金额',
  `invoice_amount` decimal(18,2) NOT NULL DEFAULT '0.00' COMMENT '发票金额',
  `amount_match_status` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '待核验' COMMENT '金额匹配状态:匹配/不匹配/待核验',
  
  -- 匹配状态
  `match_status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '已关联' COMMENT '匹配状态',
  `match_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '手动关联' COMMENT '匹配类型:自动关联/手动关联',
  
  -- 备注
  `remark` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '备注',
  
  -- 时间信息
  `match_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '关联时间',
  `create_by` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '创建者',
  `update_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `update_by` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '更新者',
  `version` bigint NOT NULL DEFAULT '0' COMMENT '版本号',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否已删除 0-否 1-是',
  
  PRIMARY KEY (`match_id`),
  KEY `idx_contract_id` (`contract_id`),
  KEY `idx_contract_no` (`contract_no`),
  KEY `idx_invoice_id` (`invoice_id`),
  KEY `idx_invoice_no` (`invoice_no`),
  KEY `idx_relation_type` (`relation_type`),
  KEY `idx_match_date` (`match_date`),
  KEY `idx_is_deleted` (`is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='合同-发票匹配表';


-- ==========================================
-- 7. SKU明细-报关匹配表
-- 说明: 记录SKU明细与报关单的匹配关系(FIFO原则)
-- ==========================================
CREATE TABLE `sku_customs_declare_match` (
  `match_id` int NOT NULL AUTO_INCREMENT COMMENT '匹配ID',
  
  -- SKU明细信息
  `sku_detail_id` int NOT NULL COMMENT 'SKU明细ID',
  `sku` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'SKU编码',
  `contract_id` int NOT NULL COMMENT '合同ID',
  `contract_no` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '合同编号',
  `contract_item_no` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '合同项号',
  
  -- 报关单信息
  `declare_document_id` int NOT NULL COMMENT '报关单ID',
  `declare_document_no` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '报关单号',
  `declare_document_aggregated_item_id` int NOT NULL COMMENT '报关聚合项ID',
  `g_no` int NOT NULL COMMENT '报关项号',
  
  -- 匹配数量
  `declare_quantity` int NOT NULL DEFAULT '0' COMMENT '报关数量',
  `matched_quantity` int NOT NULL DEFAULT '0' COMMENT '匹配数量',
  `available_quantity_before_match` int NOT NULL DEFAULT '0' COMMENT '匹配前可用数量',
  `available_quantity_after_match` int NOT NULL DEFAULT '0' COMMENT '匹配后可用数量',
  
  -- 匹配状态
  `match_status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '完全匹配' COMMENT '匹配状态:完全匹配/部分匹配',
  `match_strategy` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'FIFO' COMMENT '匹配策略:FIFO/LIFO',
  `match_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '自动匹配' COMMENT '匹配类型:自动匹配/手动匹配',
  `match_order` int NOT NULL DEFAULT '0' COMMENT '匹配顺序(用于多明细匹配)',
  
  -- 发票信息(从SKU明细继承)
  `invoice_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '关联发票号',
  
  -- 报关商品信息
  `customs_declare_cn` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '报关品名(中文)',
  `customs_declare_en` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '报关品名(英文)',
  `hs_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '海关编码',
  `spin_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '织造方式',
  `fabric_type` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '成分',
  
  -- 备注
  `remark` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '备注',
  
  -- 时间信息
  `match_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '匹配时间',
  `create_by` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '创建者',
  `update_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `update_by` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '更新者',
  `version` bigint NOT NULL DEFAULT '0' COMMENT '版本号',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否已删除 0-否 1-是',
  
  PRIMARY KEY (`match_id`),
  KEY `idx_sku_detail_id` (`sku_detail_id`),
  KEY `idx_sku` (`sku`),
  KEY `idx_contract_id` (`contract_id`),
  KEY `idx_declare_document_id` (`declare_document_id`),
  KEY `idx_declare_document_no` (`declare_document_no`),
  KEY `idx_declare_aggregated_item_id` (`declare_document_aggregated_item_id`),
  KEY `idx_match_status` (`match_status`),
  KEY `idx_match_date` (`match_date`),
  KEY `idx_is_deleted` (`is_deleted`),
  KEY `idx_invoice_no` (`invoice_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='SKU明细-报关单匹配表';


-- ==========================================
-- 8. 报关-SKU-合同-发票映射视图
-- 说明: 用于快速查询完整的映射关系链路
-- ==========================================
CREATE OR REPLACE VIEW `v_declare_sku_contract_invoice_mapping` AS
SELECT 
    -- 报关单信息
    scdm.declare_document_id,
    scdm.declare_document_no,
    scdm.g_no,
    scdm.declare_quantity,
    scdm.matched_quantity,
    scdm.match_status AS declare_match_status,
    
    -- SKU明细信息
    scdm.sku_detail_id,
    scdm.sku,
    psd.product_name,
    psd.quantity AS sku_total_quantity,
    psd.available_qty AS sku_available_quantity,
    
    -- 合同信息
    scdm.contract_id,
    scdm.contract_no,
    scdm.contract_item_no,
    pc.supplier_name,
    pc.status AS contract_status,
    
    -- 发票信息
    scdm.invoice_no,
    ii.invoice_code,
    ii.amount_with_tax AS invoice_amount,
    ii.status AS invoice_status,
    
    -- 报关商品信息
    scdm.customs_declare_cn,
    scdm.hs_code,
    scdm.spin_type,
    scdm.fabric_type,
    
    -- 时间信息
    scdm.match_date AS declare_match_date
FROM 
    sku_customs_declare_match scdm
    LEFT JOIN purchase_sku_detail psd ON scdm.sku_detail_id = psd.sku_detail_id
    LEFT JOIN purchase_contract pc ON scdm.contract_id = pc.contract_id
    LEFT JOIN input_invoice ii ON scdm.invoice_no = ii.invoice_no
WHERE 
    scdm.is_deleted = 0 
    AND psd.is_deleted = 0;


-- ==========================================
-- 索引优化建议
-- ==========================================
-- 1. 对于高频查询的组合条件，建议创建组合索引
-- 2. 对于JSON字段查询，MySQL 8.0+ 可以使用生成列+索引
-- 3. 对于大表的分页查询，建议使用覆盖索引优化


-- ==========================================
-- 分区建议 (可选，针对大数据量场景)
-- ==========================================
-- 对于历史数据量大的表，可以考虑按时间分区
-- 例如: 按年或按月对 sku_customs_declare_match 表分区
-- ALTER TABLE sku_customs_declare_match 
-- PARTITION BY RANGE (YEAR(match_date)) (
--     PARTITION p2024 VALUES LESS THAN (2025),
--     PARTITION p2025 VALUES LESS THAN (2026),
--     PARTITION p_future VALUES LESS THAN MAXVALUE
-- );


-- ==========================================
-- 初始化示例数据 (可选)
-- ==========================================
-- 插入示例数据用于测试...

