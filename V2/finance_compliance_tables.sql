-- ==========================================
-- 财务合规管理系统 - 数据库表设计
-- 版本: V2.0
-- 创建日期: 2025-11-28
-- 说明: 结合报关流程的完整财务合规数据模型
-- 
-- 数据库说明:
-- - nsy_scm: 财务合规系统主库，包含所有业务表
-- - nsy_wms: 仓储管理系统库，包含报关相关表和匹配表冗余
-- ==========================================

-- ==========================================
-- 使用数据库: nsy_scm
-- ==========================================
USE `nsy_scm`;

-- ==========================================
-- 1. 采销SKU明细表
-- 说明: 记录采购SKU的详细信息，是整个业务流程的起点
-- ==========================================
CREATE TABLE `nsy_scm`.`purchase_sku_detail` (
  `sku_detail_id` int NOT NULL AUTO_INCREMENT COMMENT 'SKU明细ID',
  `location` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '地区/租户',
  `sku` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'SKU编码',
  `product_id` int NOT NULL DEFAULT '0' COMMENT '商品ID',
  `product_sku` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '产品SKU编码',
  `category_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '商品类别',
  `declare_category_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '报关商品类别',
  -- 供应商信息
  `supplier_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '供应商编码',
  `supplier_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '供应商名称',
  
  -- 采购主体信息
  `purchase_company_id` int NOT NULL COMMENT '采购主体公司ID',
  `purchase_company_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '采购主体名称',
  
  -- 数量相关
  `quantity` int NOT NULL DEFAULT '0' COMMENT '采购数量',
  `return_qty` int NOT NULL DEFAULT '0' COMMENT '退货数量',
  `declared_qty` int NOT NULL DEFAULT '0' COMMENT '已报关数量',
  `available_qty` int NOT NULL DEFAULT '0' COMMENT '报关可用数量(quantity - return_qty - declared_qty)',
  
  -- 价格相关
  `unit_price` decimal(18,4) NOT NULL DEFAULT '0.0000' COMMENT '单价',
  `total_amount` decimal(18,2) NOT NULL DEFAULT '0.00' COMMENT '总金额',
  `currency` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CNY' COMMENT '币种',
  
  -- 对账单相关
  `statement_id` int DEFAULT NULL COMMENT '关联往来对账单ID',
  
  -- 采购单和接收单信息
  `purchase_order_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '采购单号',
  `receive_order_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '接收单号',
  
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
  KEY `idx_location` (`location`),
  KEY `idx_sku` (`sku`),
  KEY `idx_product_id` (`product_id`),
  KEY `idx_supplier_code` (`supplier_code`),
  KEY `idx_status` (`status`),
  KEY `idx_is_deleted_create_date` (`is_deleted`, `create_date`),
  KEY `idx_available_qty` (`available_qty`),
  KEY `idx_location_sku` (`location`, `sku`),
  KEY `idx_purchase_order_no` (`purchase_order_no`),
  KEY `idx_receive_order_no` (`receive_order_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='采销SKU明细表';


-- ==========================================
-- 2. 采销合同表
-- 说明: 记录采购合同的主表信息
-- ==========================================
CREATE TABLE `nsy_scm`.`purchase_contract` (
  `contract_id` int NOT NULL AUTO_INCREMENT COMMENT '合同ID',
  `location` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '地区/租户',
  `contract_no` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '合同编号',
  
  -- 合同主体信息
  `supplier_id` int NOT NULL DEFAULT '0' COMMENT '供应商ID',
  `supplier_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '供方名称(供应商)',
  `supplier_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '供方编码',
  `supplier_full_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '供方全称',
  `company_id` int NOT NULL DEFAULT '0' COMMENT '公司ID',
  `company_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '公司名称(采购方)',
  `company_full_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '公司全称',
  `supplier_agent_phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '供应商经办人电话',
  `company_agent_phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '公司经办人电话',
  
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
  `status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '' COMMENT '状态',
  
  -- 签署信息
  `supplier_sign_date` timestamp NULL DEFAULT NULL COMMENT '工厂签署时间',
  `company_sign_date` timestamp NULL DEFAULT NULL COMMENT '公司签署时间',
  `attachment_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '附件地址',
  `has_supplier_sign_contract` tinyint unsigned NOT NULL DEFAULT '0' COMMENT '是否工厂签署合同 0-否 1-是',
  `has_company_sign_contract` tinyint unsigned NOT NULL DEFAULT '0' COMMENT '是否公司签署合同 0-否 1-是',
  `company_sign_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '公司签署链接',
  `supplier_sign_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '工厂签署链接',
  `excel_preview_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Excel合同文件预览链接',
  `sign_flow_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '签署流程ID',
  `file_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '文件ID',
  `file_upload_status` tinyint(1) NOT NULL DEFAULT '0' COMMENT '合同上传e签宝状态 0-上传中 1-已上传',
  `contract_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '合同链接',
  
  -- 对账单关联
  `statement_id` int DEFAULT NULL COMMENT '关联往来对账单ID',
  
  -- 审核和签署时间
  `audit_date` timestamp NULL DEFAULT NULL COMMENT '审核时间(兼容字段)',
  `auditor` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '审核人',
  
  -- 其他
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否已删除 0-否 1-是',
  
  -- 时间信息
  `create_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `create_by` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '创建者',
  `update_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `update_by` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '更新者',
  `version` bigint NOT NULL DEFAULT '0' COMMENT '版本号',
  
  PRIMARY KEY (`contract_id`),
  UNIQUE KEY `uk_contract_no` (`location`, `contract_no`, `is_deleted`),
  KEY `idx_location` (`location`),
  KEY `idx_contract_no` (`contract_no`),
  KEY `idx_supplier_id` (`supplier_id`),
  KEY `idx_supplier_code` (`supplier_code`),
  KEY `idx_company_id` (`company_id`),
  KEY `idx_status` (`status`),
  KEY `idx_supplier_sign_date` (`supplier_sign_date`),
  KEY `idx_company_sign_date` (`company_sign_date`),
  KEY `idx_audit_date` (`audit_date`),
  KEY `idx_create_date` (`create_date`),
  KEY `idx_sign_flow_id` (`sign_flow_id`),
  KEY `idx_file_upload_status` (`file_upload_status`),
  KEY `idx_file_id` (`file_id`),
  KEY `idx_is_deleted_create_date` (`is_deleted`, `create_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='采销合同主表';


-- ==========================================
-- 3. 采销合同明细表
-- 说明: 记录合同的明细项，一个合同可以有多个明细项
-- 注意: 维度参考纸质合同红框，只到“产品名称/品类”这一层，不到具体SKU；
--       具体SKU明细通过 purchase_sku_detail_contract_item_match 表与本表的合同项进行匹配
-- ==========================================
CREATE TABLE `nsy_scm`.`purchase_contract_item` (
  `contract_item_id` int NOT NULL AUTO_INCREMENT COMMENT '合同项ID',
  `location` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '地区/租户',
  `contract_id` int NOT NULL COMMENT '合同ID',
  `contract_no` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '合同编号',
  `item_no` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '合同项号',
  
  -- 产品信息（合同红框中的“产品名称/品类 + 计量单位”）
  `declare_category_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '报关品类',
  `unit` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '件' COMMENT '计量单位，如：件/箱/套',
  
  -- 数量和价格（合同红框中的"数量、含税单价、金额"）
  `quantity` int NOT NULL DEFAULT '0' COMMENT '数量',
  `unit_price` decimal(18,4) NOT NULL DEFAULT '0.0000' COMMENT '含税单价',
  `amount_without_tax` decimal(18,2) NOT NULL DEFAULT '0.00' COMMENT '不含税金额',
  `tax_amount` decimal(18,2) NOT NULL DEFAULT '0.00' COMMENT '税额',
  `amount_with_tax` decimal(18,2) NOT NULL DEFAULT '0.00' COMMENT '含税金额',
  
  -- 交付信息
  `delivery_date` date DEFAULT NULL COMMENT '交货日期',
  
  -- 时间信息
  `create_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `create_by` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '创建者',
  `update_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `update_by` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '更新者',
  `version` bigint NOT NULL DEFAULT '0' COMMENT '版本号',
  
  PRIMARY KEY (`contract_item_id`),
  KEY `idx_location` (`location`),
  KEY `idx_contract_id` (`contract_id`),
  KEY `idx_contract_no` (`contract_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='采销合同明细表';


-- ==========================================
-- 4. SKU明细-合同明细匹配表
-- 说明: 记录SKU明细与合同明细项的关联关系
-- 业务场景: 一个合同项可能对应多个SKU明细(分批采购)，一个SKU明细通常对应一个合同项
-- ==========================================
CREATE TABLE `nsy_scm`.`purchase_sku_detail_contract_item_match` (
  `match_id` int NOT NULL AUTO_INCREMENT COMMENT '匹配ID',
  `location` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '地区/租户',
  
  -- SKU明细信息
  `sku_detail_id` int NOT NULL COMMENT 'SKU明细ID',
  `sku` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'SKU编码',
  
  -- 合同信息
  `contract_id` int NOT NULL COMMENT '合同ID',
  `contract_no` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '合同编号',
  `contract_item_id` int NOT NULL COMMENT '合同项ID',
  `contract_item_no` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '合同项号',
  
  -- 匹配数量
  `matched_quantity` int NOT NULL DEFAULT '0' COMMENT '匹配数量(从SKU明细匹配到合同项的数量)',
  
  -- 匹配状态
  `match_status` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '已匹配' COMMENT '匹配状态:已匹配/已取消',
  `match_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '自动匹配' COMMENT '匹配类型:自动匹配/手动匹配',
  
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
  UNIQUE KEY `uk_sku_detail_contract_item` (`location`, `sku_detail_id`, `contract_item_id`, `is_deleted`),
  KEY `idx_location` (`location`),
  KEY `idx_sku_detail_id` (`sku_detail_id`),
  KEY `idx_sku` (`sku`),
  KEY `idx_contract_id` (`contract_id`),
  KEY `idx_contract_no` (`contract_no`),
  KEY `idx_contract_item_id` (`contract_item_id`),
  KEY `idx_contract_item_no` (`contract_item_no`),
  KEY `idx_match_date` (`match_date`),
  KEY `idx_is_deleted` (`is_deleted`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='采购SKU明细-合同明细匹配表';


-- ==========================================
-- 5. 进项发票表
-- 说明: 记录供应商开具的增值税发票
-- ==========================================
CREATE TABLE `nsy_scm`.`input_invoice` (
  `invoice_id` int NOT NULL AUTO_INCREMENT COMMENT '发票ID',
  `location` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '地区/租户',
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
  
  -- 说明: 关联合同信息通过 contract_invoice_match 表关联查询获取
  
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
  UNIQUE KEY `uk_invoice_code_no` (`location`, `invoice_code`, `invoice_no`, `is_deleted`),
  KEY `idx_location` (`location`),
  KEY `idx_invoice_no` (`invoice_no`),
  KEY `idx_seller_tax_no` (`seller_tax_no`),
  KEY `idx_buyer_tax_no` (`buyer_tax_no`),
  KEY `idx_status` (`status`),
  KEY `idx_invoice_date` (`invoice_date`),
  KEY `idx_is_deleted_create_date` (`is_deleted`, `create_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='进项发票表';


-- ==========================================
-- 6. 合同-发票匹配表
-- 说明: 记录合同与发票的关联关系(支持一对一和多对一)
-- ==========================================
CREATE TABLE `nsy_scm`.`contract_invoice_match` (
  `match_id` int NOT NULL AUTO_INCREMENT COMMENT '匹配ID',
  `location` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '地区/租户',
  `contract_id` int NOT NULL COMMENT '合同ID',
  `contract_no` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '合同编号',
  `invoice_id` int NOT NULL COMMENT '发票ID',
  `invoice_no` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '发票号码',
  
  -- 时间信息
  `match_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '关联时间',
  `create_by` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '创建者',
  `update_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  `update_by` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '更新者',
  `version` bigint NOT NULL DEFAULT '0' COMMENT '版本号',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否已删除 0-否 1-是',
  PRIMARY KEY (`match_id`),
  KEY `idx_location` (`location`),
  KEY `idx_contract_id` (`contract_id`),
  KEY `idx_contract_no` (`contract_no`),
  KEY `idx_invoice_id` (`invoice_id`),
  KEY `idx_invoice_no` (`invoice_no`),
  KEY `idx_match_date` (`match_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='合同-发票匹配表';


-- ==========================================
-- 7. SKU明细-报关匹配表
-- 说明: 记录SKU明细与报关单的匹配关系(FIFO原则)
-- ==========================================
CREATE TABLE `nsy_scm`.`sku_customs_declare_match` (
  `match_id` int NOT NULL AUTO_INCREMENT COMMENT '匹配ID',
  `location` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '地区/租户',
  
  -- SKU明细信息
  `sku_detail_id` int NOT NULL COMMENT 'SKU明细ID',
  `sku` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'SKU编码',

  -- 冗余合同信息
  `contract_id` int NOT NULL COMMENT '合同ID',
  `contract_no` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '合同编号',
  `contract_item_no` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '合同项号',
  
  -- 报关单信息（三级结构：报关单 -> 报关聚合项 -> 报关明细）
  `declare_document_id` int NOT NULL COMMENT '报关单ID',
  `declare_document_no` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '报关单号',
  `declare_document_aggregated_item_id` int NOT NULL COMMENT '报关聚合项ID',
  `g_no` int NOT NULL COMMENT '报关项号（聚合项级别）',
  `declare_document_item_id` int NOT NULL COMMENT '报关明细项ID',
  
  -- 匹配数量
  `matched_quantity` int NOT NULL DEFAULT '0' COMMENT '匹配数量',  
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
  KEY `idx_location` (`location`),
  KEY `idx_sku_detail_id` (`sku_detail_id`),
  KEY `idx_sku` (`sku`),
  KEY `idx_contract_id` (`contract_id`),
  KEY `idx_declare_document_id` (`declare_document_id`),
  KEY `idx_declare_document_no` (`declare_document_no`),
  KEY `idx_declare_document_item_id` (`declare_document_item_id`),
  KEY `idx_declare_aggregated_item_id` (`declare_document_aggregated_item_id`),
  KEY `idx_match_date` (`match_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='SKU明细-报关单匹配表';


-- ==========================================
-- 使用数据库: nsy_wms
-- 说明: 在WMS库中冗余报关匹配表，便于WMS系统直接查询匹配关系
-- ==========================================
USE `nsy_wms`;

-- ==========================================
-- WMS库 - SKU明细-报关匹配表（冗余表）
-- 说明: 从nsy_scm库同步的报关匹配数据，供WMS系统使用
-- ==========================================
CREATE TABLE `nsy_wms`.`sku_customs_declare_match` (
  `match_id` int NOT NULL AUTO_INCREMENT COMMENT '匹配ID',
  `location` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '地区/租户',
  
  -- SKU明细信息
  `sku_detail_id` int NOT NULL COMMENT 'SKU明细ID',
  `sku` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'SKU编码',
  
  -- 冗余合同信息
  `contract_id` int NOT NULL COMMENT '合同ID',
  `contract_no` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '合同编号',
  `contract_item_no` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '合同项号',
  
  -- 报关单信息（三级结构：报关单 -> 报关聚合项 -> 报关明细）
  `declare_document_id` int NOT NULL COMMENT '报关单ID',
  `declare_document_no` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '报关单号',
  `declare_document_aggregated_item_id` int NOT NULL COMMENT '报关聚合项ID',
  `g_no` int NOT NULL COMMENT '报关项号（聚合项级别）',
  `declare_document_item_id` int NOT NULL COMMENT '报关明细项ID',
  
  -- 匹配数量
  `matched_quantity` int NOT NULL DEFAULT '0' COMMENT '匹配数量',
  
  -- 冗余发票信息
  `invoice_id` int DEFAULT NULL COMMENT '发票ID',
  `invoice_no` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '发票号码',
  `attachment_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '发票附件URL',
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
  KEY `idx_location` (`location`),
  KEY `idx_sku_detail_id` (`sku_detail_id`),
  KEY `idx_sku` (`sku`),
  KEY `idx_contract_id` (`contract_id`),
  KEY `idx_declare_document_id` (`declare_document_id`),
  KEY `idx_declare_document_no` (`declare_document_no`),
  KEY `idx_declare_document_item_id` (`declare_document_item_id`),
  KEY `idx_declare_aggregated_item_id` (`declare_document_aggregated_item_id`),
  KEY `idx_match_date` (`match_date`),
  KEY `idx_is_deleted` (`is_deleted`),
  KEY `idx_invoice_no` (`invoice_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='SKU明细-报关单匹配表(WMS库冗余表)';