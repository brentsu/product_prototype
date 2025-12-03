package com.nsy.scm.match.dto;

import java.io.Serializable;

import com.nsy.scm.match.enums.MatchType;

import lombok.Data;

/**
 * SKU明细匹配请求对象（基础类）
 * 
 * 说明：
 * - 这是通用的匹配请求基础类，包含所有匹配场景的通用字段
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
     * SKU编码（SKU级别标识，最上层字段）
     * 说明：核心匹配逻辑在SKU级别执行，一个SKU可能匹配多个SKU明细（FIFO策略）
     */
    private String sku;

    /**
     * 需要匹配的数量（SKU级别的需求数量）
     */
    private Integer quantity;
}
