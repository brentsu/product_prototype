package com.nsy.scm.match.dto;

import java.io.Serializable;
import java.util.List;

import com.nsy.scm.match.enums.MatchStatus;

import lombok.Data;

/**
 * 报关单匹配响应对象
 * 结构类似CustomsDeclarationRequest，但包含匹配结果信息
 * 
 * @author system
 */
@Data
public class CustomsDeclarationMatchResponse implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 报关单号
     */
    private String declare_document_no;

    /**
     * 租户/地区
     */
    private String location;

    /**
     * 报关聚合项列表
     */
    private List<DeclareDocumentAggregatedItem> declare_document_aggregated_item;

    /**
     * 报关聚合项
     */
    @Data
    public static class DeclareDocumentAggregatedItem implements Serializable {

        private static final long serialVersionUID = 1L;

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
         * SKU列表（包含匹配结果）
         */
        private List<DeclareSku> skus;
    }

    /**
     * 报关SKU明细（包含匹配结果）
     */
    @Data
    public static class DeclareSku implements Serializable {

        private static final long serialVersionUID = 1L;

        /**
         * SKU编码
         */
        private String sku;

        /**
         * 需求数量（qty）
         */
        private Integer qty;

        /**
         * 匹配数量（match_qty）
         */
        private Integer match_qty;

        /**
         * 匹配状态（match_status）：完全匹配、部分匹配、匹配失败
         */
        private MatchStatus match_status;
    }
}

