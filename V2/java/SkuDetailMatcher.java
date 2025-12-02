package com.nsy.scm.match.service;

import com.nsy.scm.match.dto.MatchRequest;
import com.nsy.scm.match.dto.MatchResult;

/**
 * SKU明细匹配服务接口
 * 使用策略模式，不同匹配类型实现不同的匹配逻辑
 * 
 * @author system
 */
public interface SkuDetailMatcher {

    /**
     * 执行匹配
     * 
     * @param request 匹配请求
     * @return 匹配结果
     */
    MatchResult match(MatchRequest request);

    /**
     * 获取匹配类型
     * 
     * @return 匹配类型
     */
    com.nsy.scm.match.enums.MatchType getMatchType();

    /**
     * 是否支持该匹配类型
     * 
     * @param matchType 匹配类型
     * @return true-支持，false-不支持
     */
    default boolean supports(com.nsy.scm.match.enums.MatchType matchType) {
        return getMatchType().equals(matchType);
    }
}
