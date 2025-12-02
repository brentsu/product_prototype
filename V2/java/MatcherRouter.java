package com.nsy.scm.match.service;

import com.nsy.scm.match.dto.MatchRequest;
import com.nsy.scm.match.dto.MatchResult;
import com.nsy.scm.match.enums.MatchType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 匹配服务路由器
 * 根据匹配类型路由到不同的匹配服务实现
 * 使用策略模式实现多态
 * 
 * @author system
 */
@Slf4j
@Component
public class MatcherRouter {
    
    /**
     * 匹配服务映射表
     * key: MatchType, value: SkuDetailMatcher实现
     */
    private final Map<MatchType, SkuDetailMatcher> matcherMap = new HashMap<>();
    
    /**
     * 注入所有匹配服务实现
     * Spring会自动注入所有实现了SkuDetailMatcher接口的Bean
     */
    @Autowired
    private List<SkuDetailMatcher> matchers;
    
    /**
     * 初始化匹配服务映射表
     */
    @PostConstruct
    public void init() {
        for (SkuDetailMatcher matcher : matchers) {
            MatchType matchType = matcher.getMatchType();
            matcherMap.put(matchType, matcher);
            log.info("注册匹配服务: {} -> {}", matchType.getDesc(), matcher.getClass().getSimpleName());
        }
    }
    
    /**
     * 根据匹配类型路由到对应的匹配服务
     * 
     * @param request 匹配请求
     * @return 匹配结果
     */
    public MatchResult route(MatchRequest request) {
        MatchType matchType = request.getMatchType();
        
        if (matchType == null) {
            throw new IllegalArgumentException("匹配类型不能为空");
        }
        
        SkuDetailMatcher matcher = matcherMap.get(matchType);
        
        if (matcher == null) {
            throw new UnsupportedOperationException(
                String.format("不支持的匹配类型: %s (%s)", matchType.getCode(), matchType.getDesc())
            );
        }
        
        log.info("路由到匹配服务: {} -> {}", matchType.getDesc(), matcher.getClass().getSimpleName());
        
        // 调用对应的匹配服务
        return matcher.match(request);
    }
    
    /**
     * 获取匹配服务
     * 
     * @param matchType 匹配类型
     * @return 匹配服务
     */
    public SkuDetailMatcher getMatcher(MatchType matchType) {
        return matcherMap.get(matchType);
    }
    
    /**
     * 检查是否支持该匹配类型
     * 
     * @param matchType 匹配类型
     * @return true-支持，false-不支持
     */
    public boolean supports(MatchType matchType) {
        return matcherMap.containsKey(matchType);
    }
}

