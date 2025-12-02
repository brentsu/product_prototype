package com.nsy.scm.match.dto;

import java.io.Serializable;
import java.math.BigDecimal;

import com.nsy.scm.match.enums.MatchType;

import lombok.Data;

/**
 * SKU明细匹配请求对象
 * 
 * 说明：
 * - 这是通用的匹配请求，支持不同匹配类型（报关单、退货、销售订单等）
 * - 核心匹配逻辑在SKU级别执行，每个SKU独立进行匹配
 * - SKU字段在最上层，直接体现SKU级别的匹配需求
 * 
 * @author system
 */
@Data
public class MatchRequest implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 匹配类型
     */
    private MatchType matchType;

    /**
     * 租户/地区
     */
    private String location;

    /**
     * 业务单据号（报关单号/退货单号/销售订单号）
     */
    private String businessDocumentNo;

    /**
     * 业务单据ID
     */
    private Long businessDocumentId;

    /**
     * SKU编码（SKU级别标识，最上层字段）
     * 说明：核心匹配逻辑在SKU级别执行，一个SKU可能匹配多个SKU明细（FIFO策略）
     */
    private String sku;

    /**
     * 需要匹配的数量（SKU级别的需求数量）
     */
    private Integer quantity;

    /**
     * 单价（可选）
     */
    private BigDecimal unitPrice;

    /**
     * 操作人
     */
    private String operator;

    /**
     * 备注
     */
    private String remark;

    /**
     * 其他业务属性（根据匹配类型不同而不同）
     * 例如：报关单场景可能包含报关项号、报关品名等信息
     */
    private Object extraData;
}
