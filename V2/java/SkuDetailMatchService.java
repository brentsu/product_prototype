package com.nsy.scm.match.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.nsy.scm.match.dto.CustomsDeclarationRequest;
import com.nsy.scm.match.dto.MatchRequest;
import com.nsy.scm.match.dto.MatchResult;
import com.nsy.scm.match.service.impl.CustomsDeclarationMatcher;

import lombok.extern.slf4j.Slf4j;

/**
 * SKU明细匹配服务门面
 * 统一入口，内部通过MatcherRouter路由到不同的匹配服务
 * 
 * @author system
 */
@Slf4j
@Service
public class SkuDetailMatchService {

    @Autowired
    private MatcherRouter matcherRouter;

    @Autowired
    private CustomsDeclarationMatcher customsDeclarationMatcher;

    /**
     * 执行SKU明细匹配
     * 根据MatchRequest中的matchType自动路由到对应的匹配服务
     * 
     * @param request 匹配请求
     * @return 匹配结果
     */
    public MatchResult match(MatchRequest request) {
        log.info("开始执行SKU明细匹配, 匹配类型: {}, 业务单据号: {}, 租户: {}",
                request.getMatchType().getDesc(),
                request.getBusinessDocumentNo(),
                request.getLocation());

        // 参数校验
        validateRequest(request);

        // 通过路由器路由到对应的匹配服务
        MatchResult result = matcherRouter.route(request);

        log.info("SKU明细匹配完成, 匹配类型: {}, 业务单据号: {}, 匹配状态: {}",
                request.getMatchType().getDesc(),
                request.getBusinessDocumentNo(),
                result.getMatchStatus() != null ? result.getMatchStatus().getDesc() : "未知");

        return result;
    }

    /**
     * 批量匹配
     * 
     * @param requests 匹配请求列表
     * @return 匹配结果列表
     */
    public java.util.List<MatchResult> batchMatch(java.util.List<MatchRequest> requests) {
        log.info("开始批量匹配, 数量: {}", requests.size());

        java.util.List<MatchResult> results = new java.util.ArrayList<>();

        for (MatchRequest request : requests) {
            try {
                MatchResult result = match(request);
                results.add(result);
            } catch (Exception e) {
                log.error("批量匹配失败, 业务单据号: {}", request.getBusinessDocumentNo(), e);
                // 创建失败结果
                MatchResult errorResult = new MatchResult();
                errorResult.setSuccess(false);
                errorResult.setBusinessDocumentNo(request.getBusinessDocumentNo());
                errorResult.setErrorMessage(e.getMessage());
                results.add(errorResult);
            }
        }

        log.info("批量匹配完成, 成功: {}, 失败: {}",
                results.stream().filter(MatchResult::getSuccess).count(),
                results.stream().filter(r -> !r.getSuccess()).count());

        return results;
    }

    /**
     * 参数校验
     * 
     * @param request 匹配请求
     */
    private void validateRequest(MatchRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("匹配请求不能为空");
        }

        if (request.getMatchType() == null) {
            throw new IllegalArgumentException("匹配类型不能为空");
        }

        if (request.getLocation() == null || request.getLocation().trim().isEmpty()) {
            throw new IllegalArgumentException("租户不能为空");
        }

        if (request.getBusinessDocumentNo() == null || request.getBusinessDocumentNo().trim().isEmpty()) {
            throw new IllegalArgumentException("业务单据号不能为空");
        }

        // SKU字段在最上层，直接校验
        if (request.getSku() == null || request.getSku().trim().isEmpty()) {
            throw new IllegalArgumentException("SKU编码不能为空");
        }

        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new IllegalArgumentException("匹配数量必须大于0");
        }
    }

    /**
     * 执行报关单匹配（使用报关单JSON格式）
     * 
     * @param customsRequest 报关单匹配请求
     * @return 匹配结果
     */
    public MatchResult matchCustomsDeclaration(CustomsDeclarationRequest customsRequest) {
        log.info("开始执行报关单匹配, 报关单号: {}, 租户: {}",
                customsRequest.getDeclare_document_no(),
                customsRequest.getLocation());

        // 参数校验
        validateCustomsRequest(customsRequest);

        // 直接调用报关单匹配服务
        MatchResult result = customsDeclarationMatcher.matchCustomsDeclaration(customsRequest);

        log.info("报关单匹配完成, 报关单号: {}, 匹配状态: {}",
                customsRequest.getDeclare_document_no(),
                result.getMatchStatus() != null ? result.getMatchStatus().getDesc() : "未知");

        return result;
    }

    /**
     * 报关单请求参数校验
     * 
     * @param request 报关单请求
     */
    private void validateCustomsRequest(CustomsDeclarationRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("报关单请求不能为空");
        }

        if (request.getDeclare_document_no() == null || request.getDeclare_document_no().trim().isEmpty()) {
            throw new IllegalArgumentException("报关单号不能为空");
        }

        if (request.getLocation() == null || request.getLocation().trim().isEmpty()) {
            throw new IllegalArgumentException("租户不能为空");
        }

        if (request.getDeclare_document_aggregated_item() == null
                || request.getDeclare_document_aggregated_item().isEmpty()) {
            throw new IllegalArgumentException("报关聚合项列表不能为空");
        }

        // 校验每个聚合项
        for (CustomsDeclarationRequest.DeclareDocumentAggregatedItem aggregatedItem : request
                .getDeclare_document_aggregated_item()) {

            if (aggregatedItem.getG_no() == null) {
                throw new IllegalArgumentException("报关项号(g_no)不能为空");
            }

            if (aggregatedItem.getSkus() == null || aggregatedItem.getSkus().isEmpty()) {
                throw new IllegalArgumentException("SKU列表不能为空");
            }

            // 校验每个SKU
            for (CustomsDeclarationRequest.DeclareSku declareSku : aggregatedItem.getSkus()) {
                if (declareSku.getSku() == null || declareSku.getSku().trim().isEmpty()) {
                    throw new IllegalArgumentException("SKU编码不能为空");
                }

                if (declareSku.getQty() == null || declareSku.getQty() <= 0) {
                    throw new IllegalArgumentException("报关数量必须大于0");
                }
            }
        }
    }
}
