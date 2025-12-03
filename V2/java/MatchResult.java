package com.nsy.scm.match.dto;

import java.io.Serializable;

import com.nsy.scm.match.enums.MatchStatus;

import lombok.Data;

/**
 * SKU明细匹配结果对象（简化版）
 * 只包含：sku, qty, match_qty, match_status
 * 
 * @author system
 */
@Data
public class MatchResult implements Serializable {

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
