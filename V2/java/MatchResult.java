package com.nsy.scm.match.dto;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

import com.nsy.scm.match.enums.MatchStatus;

import lombok.Data;

/**
 * SKU明细匹配结果对象
 * 
 * @author system
 */
@Data
public class MatchResult implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 是否成功
     */
    private Boolean success;

    /**
     * 匹配状态
     */
    private MatchStatus matchStatus;

    /**
     * 业务单据号
     */
    private String businessDocumentNo;

    /**
     * 总需求数量
     */
    private Integer totalRequiredQty;

    /**
     * 总匹配数量
     */
    private Integer totalMatchedQty;

    /**
     * 未匹配数量
     */
    private Integer unmatchedQty;

    /**
     * 匹配明细列表
     */
    private List<MatchDetail> matchDetails = new ArrayList<>();

    /**
     * 错误信息
     */
    private String errorMessage;

    /**
     * 匹配明细
     */
    @Data
    public static class MatchDetail implements Serializable {

        private static final long serialVersionUID = 1L;

        /**
         * SKU编码
         */
        private String sku;

        /**
         * SKU明细ID
         */
        private Long skuDetailId;

        /**
         * 需求数量
         */
        private Integer requiredQty;

        /**
         * 匹配数量
         */
        private Integer matchedQty;

        /**
         * 匹配状态（完全匹配/部分匹配/匹配失败）
         */
        private MatchStatus detailStatus;

        /**
         * 合同编号
         */
        private String contractNo;

        /**
         * 合同项号
         */
        private String contractItemNo;

        /**
         * 匹配顺序（多明细匹配时的序号）
         */
        private Integer matchOrder;

    }
}
