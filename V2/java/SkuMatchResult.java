package com.nsy.scm.match.dto;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

import com.nsy.scm.match.enums.MatchStatus;

import lombok.Data;

/**
 * 单个SKU的匹配结果
 * 
 * @author system
 */
@Data
public class SkuMatchResult implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * SKU编码
     */
    private String sku;

    /**
     * 需求数量
     */
    private Integer requiredQty;

    /**
     * 总匹配数量
     */
    private Integer totalMatchedQty;

    /**
     * 未匹配数量
     */
    private Integer unmatchedQty;

    /**
     * 匹配状态
     */
    private MatchStatus matchStatus;

    /**
     * 匹配明细列表（一个SKU可能匹配多个SKU明细）
     */
    private List<SkuDetailMatchRecord> matchRecords = new ArrayList<>();

    /**
     * 错误信息
     */
    private String errorMessage;

    /**
     * SKU明细匹配记录
     */
    @Data
    public static class SkuDetailMatchRecord implements Serializable {

        private static final long serialVersionUID = 1L;

        /**
         * SKU明细ID
         */
        private Long skuDetailId;

        /**
         * 匹配数量
         */
        private Integer matchedQty;

        /**
         * 匹配顺序
         */
        private Integer matchOrder;

        /**
         * 匹配前可用数量
         */
        private Integer availableQtyBefore;

        /**
         * 匹配后可用数量
         */
        private Integer availableQtyAfter;

        /**
         * 合同编号
         */
        private String contractNo;

        /**
         * 合同项号
         */
        private String contractItemNo;
    }
}
