package com.nsy.scm.match.dto;

import java.io.Serializable;
import java.util.List;

import lombok.Data;

/**
 * 报关单匹配请求对象
 * 对应报关单JSON格式
 * 
 * @author system
 */
@Data
public class CustomsDeclarationRequest implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 报关单号
     */
    private String declare_document_no;

    /**
     * 报关单ID（可选，如果已有）
     */
    private Long declare_document_id;

    /**
     * 报关聚合项列表
     */
    private List<DeclareDocumentAggregatedItem> declare_document_aggregated_item;

    /**
     * 租户/地区
     */
    private String location;

    /**
     * 操作人
     */
    private String operator;

    /**
     * 报关聚合项
     */
    @Data
    public static class DeclareDocumentAggregatedItem implements Serializable {

        private static final long serialVersionUID = 1L;

        /**
         * 报关聚合项ID（可选，如果已有）
         */
        private Long declare_document_aggregated_item_id;

        /**
         * 报关项号（聚合项级别）
         */
        private Integer g_no;

        /**
         * 织造方式
         */
        private String spin_type;

        /**
         * 报关品名(中文)
         */
        private String customs_declare_cn;

        /**
         * 报关品名(英文)
         */
        private String customs_declare_en;

        /**
         * 成分
         */
        private String fabric_type;

        /**
         * 海关编码（可选）
         */
        private String hs_code;

        /**
         * SKU列表
         */
        private List<DeclareSku> skus;
    }

    /**
     * 报关SKU明细
     */
    @Data
    public static class DeclareSku implements Serializable {

        private static final long serialVersionUID = 1L;

        /**
         * 报关明细项ID（可选，如果已有）
         */
        private Long declare_document_item_id;

        /**
         * SKU编码
         */
        private String sku;

        /**
         * 报关数量
         */
        private Integer qty;
    }
}
