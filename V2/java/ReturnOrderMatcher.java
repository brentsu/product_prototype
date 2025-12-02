package com.nsy.scm.match.service.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nsy.scm.match.dto.MatchRequest;
import com.nsy.scm.match.dto.MatchResult;
import com.nsy.scm.match.enums.MatchStatus;
import com.nsy.scm.match.enums.MatchType;
import com.nsy.scm.match.service.SkuDetailMatcher;
import com.nsy.wms.common.lock.annotation.JLock;

import lombok.extern.slf4j.Slf4j;

/**
 * 退货匹配服务实现
 * 退货场景：将退货数量关联到对应的SKU明细，增加退货数量
 * 
 * @author system
 */
@Slf4j
@Service
public class ReturnOrderMatcher implements SkuDetailMatcher {

    // 注入Mapper或Service
    // private PurchaseSkuDetailMapper skuDetailMapper;
    // private SkuDetailMatchMapper matchMapper;

    @Override
    public MatchType getMatchType() {
        return MatchType.RETURN_ORDER;
    }

    /**
     * 执行退货匹配
     * 退货匹配逻辑：根据退货单中的SKU，匹配到对应的SKU明细，增加退货数量
     * 
     * @param request 匹配请求
     * @return 匹配结果
     */
    @Override
    @JLock(lockModel = com.nsy.wms.common.lock.enums.LockModel.REENTRANT, lockKey = { "#request.sku",
            "#request.location" }, expireSeconds = 30L, waitTime = 10L, failMsg = "退货匹配正在处理中，请稍后重试")
    @Transactional(rollbackFor = Exception.class)
    public MatchResult match(MatchRequest request) {
        log.info("开始执行退货匹配, 退货单号: {}, SKU: {}, 租户: {}",
                request.getBusinessDocumentNo(), request.getSku(), request.getLocation());

        MatchResult result = new MatchResult();
        result.setBusinessDocumentNo(request.getBusinessDocumentNo());
        result.setSuccess(true);
        result.setMatchDetails(new ArrayList<>());

        // SKU字段在最上层，直接使用
        String sku = request.getSku();
        Integer requiredQty = request.getQuantity();

        // 查找可匹配的SKU明细（退货场景：匹配已出库的SKU明细）
        // 可以根据采购单号、接收单号等关联信息匹配
        // List<PurchaseSkuDetail> matchedDetails =
        // skuDetailMapper.findMatchedSkuDetail(
        // request.getLocation(),
        // sku,
        // request.getBusinessDocumentNo() // 退货单关联的原始单据号
        // );

        // 模拟：实际应该从数据库查询
        List<Object> matchedDetails = new ArrayList<>();

        int remainingQty = requiredQty;
        int matchOrder = 1;
        int totalMatchedQty = 0;

        // 匹配SKU明细
        for (Object detail : matchedDetails) {
            if (remainingQty <= 0) {
                break;
            }

            // 获取SKU明细ID
            // Long skuDetailId = detail.getSkuDetailId();
            Long skuDetailId = 1L; // 示例

            // 使用分布式锁保护单个SKU明细的匹配操作
            int matchedQty = matchReturnWithLock(
                    request.getLocation(),
                    skuDetailId,
                    sku,
                    remainingQty,
                    request);

            if (matchedQty > 0) {
                // 创建匹配明细记录
                MatchResult.MatchDetail matchDetail = new MatchResult.MatchDetail();
                matchDetail.setSku(sku);
                matchDetail.setSkuDetailId(skuDetailId);
                matchDetail.setRequiredQty(requiredQty);
                matchDetail.setMatchedQty(matchedQty);
                matchDetail.setMatchOrder(matchOrder++);

                // 保存匹配记录到 sku_detail_match 表
                // saveReturnMatchRecord(request, matchDetail);

                result.getMatchDetails().add(matchDetail);
                totalMatchedQty += matchedQty;
                remainingQty -= matchedQty;
            }
        }

        // 判断该SKU的匹配状态
        if (remainingQty > 0) {
            if (totalMatchedQty == 0) {
                result.setMatchStatus(MatchStatus.MATCH_FAILED);
                result.setSuccess(false);
                result.setErrorMessage("SKU " + sku + " 无法匹配到对应的SKU明细");
            } else {
                result.setMatchStatus(MatchStatus.PARTIALLY_MATCHED);
                log.warn("SKU {} 部分匹配，需求: {}, 已匹配: {}, 未匹配: {}",
                        sku, requiredQty, totalMatchedQty, remainingQty);
            }
        } else {
            result.setMatchStatus(MatchStatus.FULLY_MATCHED);
        }

        result.setTotalRequiredQty(requiredQty);
        result.setTotalMatchedQty(totalMatchedQty);
        result.setUnmatchedQty(remainingQty);

        log.info("退货匹配完成, 退货单号: {}, SKU: {}, 总需求: {}, 总匹配: {}, 未匹配: {}",
                request.getBusinessDocumentNo(), sku, requiredQty, totalMatchedQty, remainingQty);

        return result;
    }

    /**
     * 在分布式锁保护下匹配退货
     * 
     * @param location    租户
     * @param skuDetailId SKU明细ID
     * @param sku         SKU编码
     * @param returnQty   退货数量
     * @param request     匹配请求
     * @return 实际匹配数量
     */
    @JLock(lockModel = com.nsy.wms.common.lock.enums.LockModel.REENTRANT, lockKey = {
            "'sku_detail_match:' + #location + ':' + #skuDetailId" }, expireSeconds = 30L, waitTime = 10L, failMsg = "SKU明细正在被其他匹配操作占用，请稍后重试")
    private int matchReturnWithLock(
            String location,
            Long skuDetailId,
            String sku,
            Integer returnQty,
            MatchRequest request) {
        // 在锁内再次查询SKU明细，确保数据最新
        // PurchaseSkuDetail skuDetail =
        // skuDetailMapper.selectByIdForUpdate(skuDetailId);

        // 验证SKU是否匹配
        // if (!sku.equals(skuDetail.getSku())) {
        // log.warn("SKU不匹配, 期望: {}, 实际: {}", sku, skuDetail.getSku());
        // return 0;
        // }

        // 退货场景：增加退货数量，同时增加可用数量
        // int currentReturnQty = skuDetail.getReturnQty();
        // int currentAvailableQty = skuDetail.getAvailableQty();

        // 计算可退货数量（不能超过已出库数量）
        // int maxReturnQty = skuDetail.getQuantity() - currentReturnQty -
        // skuDetail.getDeclaredQty();
        // int matchedQty = Math.min(returnQty, maxReturnQty);

        int matchedQty = returnQty; // 示例

        // 更新SKU明细的退货数量
        // skuDetail.setReturnQty(currentReturnQty + matchedQty);
        // skuDetail.setAvailableQty(currentAvailableQty + matchedQty); // 退货后可用数量增加
        // skuDetailMapper.updateWithVersion(skuDetail);

        log.info("SKU明细 {} 退货匹配成功, 退货数量: {}", skuDetailId, matchedQty);

        return matchedQty;
    }
}
