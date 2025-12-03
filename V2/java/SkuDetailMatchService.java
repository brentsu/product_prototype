package com.nsy.scm.match.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.nsy.scm.match.dto.CustomsDeclarationRequest;
import com.nsy.scm.match.dto.ReturnOrderRequest;
import com.nsy.scm.match.service.impl.CustomsDeclarationMatcher;
import com.nsy.scm.match.service.impl.ReturnOrderMatcher;

import lombok.extern.slf4j.Slf4j;

/**
 * SKU明细匹配服务门面
 * 统一入口，支持多种匹配类型（报关单、退货订单等）
 * 
 * @author system
 */
@Slf4j
@Service
public class SkuDetailMatchService {

    @Autowired
    private CustomsDeclarationMatcher customsDeclarationMatcher;

    @Autowired
    private ReturnOrderMatcher returnOrderMatcher;

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

    /**
     * 执行退货订单匹配（使用退货订单JSON格式）
     * 
     * @param returnOrderRequest 退货订单匹配请求
     * @return 匹配结果（结构类似ReturnOrderRequest）
     */
    public com.nsy.scm.match.dto.ReturnOrderMatchResponse matchReturnOrder(
            ReturnOrderRequest returnOrderRequest) {
        log.info("开始执行退货订单匹配, 退货单号: {}, 租户: {}",
                returnOrderRequest.getPurchase_return_order_no(),
                returnOrderRequest.getLocation());

        // 参数校验
        validateReturnOrderRequest(returnOrderRequest);

        // 直接调用退货订单匹配服务
        com.nsy.scm.match.dto.ReturnOrderMatchResponse result = returnOrderMatcher
                .matchReturnOrder(returnOrderRequest);

        log.info("退货订单匹配完成, 退货单号: {}", returnOrderRequest.getPurchase_return_order_no());

        return result;
    }

    /**
     * 退货订单请求参数校验
     * 
     * @param request 退货订单请求
     */
    private void validateReturnOrderRequest(ReturnOrderRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("退货订单请求不能为空");
        }

        if (request.getPurchase_return_order_no() == null || request.getPurchase_return_order_no().trim().isEmpty()) {
            throw new IllegalArgumentException("退货单号不能为空");
        }

        if (request.getLocation() == null || request.getLocation().trim().isEmpty()) {
            throw new IllegalArgumentException("租户不能为空");
        }

        if (request.getSkus() == null || request.getSkus().isEmpty()) {
            throw new IllegalArgumentException("SKU列表不能为空");
        }

        // 校验每个SKU
        for (ReturnOrderRequest.ReturnSku returnSku : request.getSkus()) {
            if (returnSku.getSku() == null || returnSku.getSku().trim().isEmpty()) {
                throw new IllegalArgumentException("SKU编码不能为空");
            }

            if (returnSku.getReturn_quantity() == null || returnSku.getReturn_quantity() <= 0) {
                throw new IllegalArgumentException("退货数量必须大于0");
            }
        }
    }
}
