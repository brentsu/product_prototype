package com.nsy.scm.match.dto;

import java.io.Serializable;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * SKU匹配上下文
 * 包含匹配所需的所有上下文信息
 * 
 * @author system
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SkuMatchContext implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 租户/地区
     */
    private String location;

    /**
     * SKU编码
     */
    private String sku;

    /**
     * 需求数量
     */
    private Integer requiredQty;

    /**
     * 报关单号
     */
    private String declareDocumentNo;

    /**
     * 报关单ID
     */
    private Long declareDocumentId;

    /**
     * 报关聚合项ID
     */
    private Long declareDocumentAggregatedItemId;

    /**
     * 报关项号（g_no）
     */
    private Integer gNo;

    /**
     * 报关明细项ID
     */
    private Long declareDocumentItemId;

    /**
     * 报关品名(中文)
     */
    private String customsDeclareCn;

    /**
     * 报关品名(英文)
     */
    private String customsDeclareEn;

    /**
     * 织造方式
     */
    private String spinType;

    /**
     * 成分
     */
    private String fabricType;

    /**
     * 海关编码
     */
    private String hsCode;

    /**
     * 操作人
     */
    private String operator;
}
