package com.nsy.scm.match.service.impl;

import java.util.ArrayList;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nsy.scm.match.dto.MatchRequest;
import com.nsy.scm.match.dto.MatchResult;
import com.nsy.scm.match.dto.ReturnOrderMatchResponse;
import com.nsy.scm.match.dto.ReturnOrderRequest;
import com.nsy.scm.match.enums.MatchType;

import lombok.extern.slf4j.Slf4j;

/**
 * 退货订单匹配服务实现
 * 匹配策略：FIFO（先进先出）
 * 
 * @author system
 */
@Slf4j
@Service
public class ReturnOrderMatcher extends AbstractSkuDetailMatcher {

    // 注入Mapper或Service
    // private PurchaseSkuDetailMapper skuDetailMapper;
    // private SkuDetailMatchMapper matchMapper;

    // 当前匹配上下文（用于 saveMatchRecord 方法）
    private ReturnOrderRequest currentReturnOrderRequest;
    private ReturnOrderRequest.ReturnSku currentReturnSku;

    /**
     * 执行退货订单匹配（使用退货订单专用请求对象）
     * 
     * @param returnOrderRequest 退货订单匹配请求
     * @return 匹配结果（结构类似ReturnOrderRequest）
     */
    @Transactional(rollbackFor = Exception.class)
    public ReturnOrderMatchResponse matchReturnOrder(ReturnOrderRequest returnOrderRequest) {
        log.info("开始执行退货订单匹配, 退货单号: {}, 租户: {}, SKU数量: {}",
                returnOrderRequest.getPurchase_return_order_no(),
                returnOrderRequest.getLocation(),
                returnOrderRequest.getSkus() != null ? returnOrderRequest.getSkus().size() : 0);

        // 构建返回结果（结构类似ReturnOrderRequest）
        ReturnOrderMatchResponse response = new ReturnOrderMatchResponse();
        response.setPurchase_return_order_no(returnOrderRequest.getPurchase_return_order_no());
        response.setLocation(returnOrderRequest.getLocation());
        response.setSkus(new ArrayList<>());

        // ========== 遍历SKU列表，调用核心匹配逻辑 ==========
        if (returnOrderRequest.getSkus() != null) {
            for (ReturnOrderRequest.ReturnSku returnSku : returnOrderRequest.getSkus()) {
                String sku = returnSku.getSku();
                Integer requiredQty = returnSku.getReturn_quantity();

                log.info("  ========== 处理SKU匹配, SKU: {}, 退货数量: {} ==========", sku, requiredQty);

                // 构造MatchRequest
                MatchRequest matchRequest = new MatchRequest();
                matchRequest.setMatchType(MatchType.RETURN_ORDER);
                matchRequest.setLocation(returnOrderRequest.getLocation());
                matchRequest.setSku(sku);
                matchRequest.setQuantity(requiredQty);

                // 保存匹配上下文到成员变量（用于 saveMatchRecord 方法）
                this.currentReturnOrderRequest = returnOrderRequest;
                this.currentReturnSku = returnSku;

                // 调用核心匹配方法 doMatch
                MatchResult matchResult = doMatch(matchRequest);

                // 构建SKU返回结果
                ReturnOrderMatchResponse.ReturnSku responseSku = new ReturnOrderMatchResponse.ReturnSku();
                responseSku.setSku(matchResult.getSku());
                responseSku.setReturn_quantity(matchResult.getQty());
                responseSku.setMatch_qty(matchResult.getMatch_qty());
                responseSku.setMatch_status(matchResult.getMatch_status());

                response.getSkus().add(responseSku);
            }
        }

        log.info("退货订单匹配完成, 退货单号: {}", returnOrderRequest.getPurchase_return_order_no());

        return response;
    }

    @Override
    protected Integer updateSkuDetail(Long skuDetailId, int matchedQty, Integer availableQty) {
        // 退货场景：增加可用数量，增加退货数量
        // PurchaseSkuDetail skuDetail =
        // skuDetailMapper.selectByIdForUpdate(skuDetailId);
        // skuDetail.setReturn_qty(skuDetail.getReturn_qty() + matchedQty);
        // skuDetail.setAvailable_qty(skuDetail.getAvailable_qty() + matchedQty); //
        // 退货后可用数量增加
        // skuDetailMapper.updateWithVersion(skuDetail);

        // 返回更新后的可用数量（退货场景：可用数量增加）
        Integer updatedAvailableQty = availableQty + matchedQty;
        log.debug("    更新SKU明细 {}: 退货数量 +{}, 可用数量 {} -> {}",
                skuDetailId, matchedQty, availableQty, updatedAvailableQty);
        return updatedAvailableQty;
    }

    @Override
    protected void saveMatchRecord(
            String location,
            Long skuDetailId,
            String sku,
            int matchedQty) {

        // 从成员变量获取匹配上下文
        ReturnOrderRequest returnOrderRequest = this.currentReturnOrderRequest;
        ReturnOrderRequest.ReturnSku returnSku = this.currentReturnSku;

        // 保存匹配记录到 sku_detail_match 表
        // SkuDetailMatch matchRecord = new SkuDetailMatch();
        // matchRecord.setLocation(location);
        // matchRecord.setSku_detail_id(skuDetailId);
        // matchRecord.setProduct_sku(sku);
        // matchRecord.setPurchase_return_order_id(returnOrderRequest.getPurchase_return_order_id());
        // matchRecord.setPurchase_return_order_no(returnOrderRequest.getPurchase_return_order_no());
        // matchRecord.setReturn_order_item_id(returnSku.getReturn_order_item_id());
        // matchRecord.setMatched_quantity(matchedQty);
        // matchRecord.setMatch_type(MatchType.RETURN_ORDER.getCode());
        // matchRecord.setCreate_by(returnOrderRequest.getOperator());
        // matchMapper.insert(matchRecord);

        log.info("    保存退货匹配记录: skuDetailId={}, 退货单号={}, 匹配数量={}",
                skuDetailId, returnOrderRequest.getPurchase_return_order_no(), matchedQty);
    }
}
