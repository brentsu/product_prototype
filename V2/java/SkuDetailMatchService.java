package com.nsy.scm.match.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.nsy.scm.match.dto.CustomsDeclarationRequest;
import com.nsy.scm.match.service.impl.CustomsDeclarationMatcher;

import lombok.extern.slf4j.Slf4j;

/**
 * SKU明细匹配服务门面
 * 报关单匹配服务入口
 * 
 * @author system
 */
@Slf4j
@Service
public class SkuDetailMatchService {

    @Autowired
    private CustomsDeclarationMatcher customsDeclarationMatcher;

    /**
     * 执行报关单匹配（使用报关单JSON格式）
     * 
     * @param customsRequest 报关单匹配请求
     * @return 匹配结果（结构类似CustomsDeclarationRequest）
     */
    public com.nsy.scm.match.dto.CustomsDeclarationMatchResponse matchCustomsDeclaration(
            CustomsDeclarationRequest customsRequest) {
        log.info("开始执行报关单匹配, 报关单号: {}, 租户: {}",
                customsRequest.getDeclare_document_no(),
                customsRequest.getLocation());

        // 参数校验
        validateCustomsRequest(customsRequest);

        // 直接调用报关单匹配服务
        com.nsy.scm.match.dto.CustomsDeclarationMatchResponse result = customsDeclarationMatcher
                .matchCustomsDeclaration(customsRequest);

        log.info("报关单匹配完成, 报关单号: {}", customsRequest.getDeclare_document_no());

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
