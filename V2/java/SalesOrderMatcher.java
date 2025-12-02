package com.nsy.scm.match.service.impl;

import com.nsy.scm.match.dto.MatchRequest;
import com.nsy.scm.match.dto.MatchResult;
import com.nsy.scm.match.enums.MatchStatus;
import com.nsy.scm.match.enums.MatchType;
import com.nsy.scm.match.service.SkuDetailMatcher;
import com.nsy.wms.common.lock.annotation.JLock;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * 销售订单匹配服务实现
 * 销售订单场景：从SKU明细中扣减可用数量，用于销售出库
 * 匹配策略：FIFO（先进先出）
 * 
 * @author system
 */
@Slf4j
@Service
public class SalesOrderMatcher implements SkuDetailMatcher {
    
    // 注入Mapper或Service
    // private PurchaseSkuDetailMapper skuDetailMapper;
    // private SkuDetailMatchMapper matchMapper;
    
    @Override
    public MatchType getMatchType() {
        return MatchType.SALES_ORDER;
    }
    
    /**
     * 执行销售订单匹配
     * 销售订单匹配逻辑：从SKU明细中扣减可用数量
     * 
     * @param request 匹配请求
     * @return 匹配结果
     */
    @Override
    @JLock(
        lockModel = com.nsy.wms.common.lock.enums.LockModel.REENTRANT,
        lockKey = {"#request.sku", "#request.location"},
        expireSeconds = 30L,
        waitTime = 10L,
        failMsg = "销售订单匹配正在处理中，请稍后重试"
    )
    @Transactional(rollbackFor = Exception.class)
    public MatchResult match(MatchRequest request) {
        log.info("开始执行销售订单匹配, 销售订单号: {}, SKU: {}, 租户: {}", 
            request.getBusinessDocumentNo(), request.getSku(), request.getLocation());
        
        MatchResult result = new MatchResult();
        result.setBusinessDocumentNo(request.getBusinessDocumentNo());
        result.setSuccess(true);
        result.setMatchDetails(new ArrayList<>());
        
        // SKU字段在最上层，直接使用
        String sku = request.getSku();
        Integer requiredQty = request.getQuantity();
        
        // 查找可匹配的SKU明细（FIFO策略：按创建时间升序）
        // List<PurchaseSkuDetail> availableDetails = skuDetailMapper.findAvailableSkuDetail(
        //     request.getLocation(),
        //     sku,
        //     "签署完成",  // 合同状态
        //     "ASC"  // FIFO排序
        // );
        
        // 模拟：实际应该从数据库查询
        List<Object> availableDetails = new ArrayList<>();
        
        int remainingQty = requiredQty;
        int matchOrder = 1;
        int totalMatchedQty = 0;
        
        // 按FIFO顺序匹配
        for (Object detail : availableDetails) {
            if (remainingQty <= 0) {
                break;
            }
            
            // 获取SKU明细ID和可用数量
            // Long skuDetailId = detail.getSkuDetailId();
            // Integer availableQty = detail.getAvailableQty();
            
            // 使用分布式锁保护单个SKU明细的匹配操作
            Long skuDetailId = 1L; // 示例
            Integer availableQty = 100; // 示例
            
            // 在锁内执行匹配逻辑
            int matchedQty = matchSalesOrderWithLock(
                request.getLocation(),
                skuDetailId,
                sku,
                remainingQty,
                availableQty,
                request
            );
            
            if (matchedQty > 0) {
                // 创建匹配明细记录
                MatchResult.MatchDetail matchDetail = new MatchResult.MatchDetail();
                matchDetail.setSku(sku);
                matchDetail.setSkuDetailId(skuDetailId);
                matchDetail.setRequiredQty(requiredQty);
                matchDetail.setMatchedQty(matchedQty);
                matchDetail.setMatchOrder(matchOrder++);
                matchDetail.setAvailableQtyBefore(availableQty);
                matchDetail.setAvailableQtyAfter(availableQty - matchedQty);
                
                // 保存匹配记录到 sku_detail_match 表
                // saveSalesOrderMatchRecord(request, matchDetail);
                
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
                result.setErrorMessage("SKU " + sku + " 可用库存不足");
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
        
        log.info("销售订单匹配完成, 销售订单号: {}, SKU: {}, 总需求: {}, 总匹配: {}, 未匹配: {}", 
            request.getBusinessDocumentNo(), sku, requiredQty, totalMatchedQty, remainingQty);
        
        return result;
    }
    
    /**
     * 在分布式锁保护下匹配销售订单
     * 
     * @param location 租户
     * @param skuDetailId SKU明细ID
     * @param sku SKU编码
     * @param requiredQty 需求数量
     * @param availableQty 可用数量
     * @param request 匹配请求
     * @return 实际匹配数量
     */
    @JLock(
        lockModel = com.nsy.wms.common.lock.enums.LockModel.REENTRANT,
        lockKey = {"'sku_detail_match:' + #location + ':' + #skuDetailId"},
        expireSeconds = 30L,
        waitTime = 10L,
        failMsg = "SKU明细正在被其他匹配操作占用，请稍后重试"
    )
    private int matchSalesOrderWithLock(
        String location,
        Long skuDetailId,
        String sku,
        Integer requiredQty,
        Integer availableQty,
        MatchRequest request
    ) {
        // 在锁内再次查询SKU明细，确保数据最新
        // PurchaseSkuDetail skuDetail = skuDetailMapper.selectByIdForUpdate(skuDetailId);
        
        // 验证SKU是否匹配
        // if (!sku.equals(skuDetail.getSku())) {
        //     log.warn("SKU不匹配, 期望: {}, 实际: {}", sku, skuDetail.getSku());
        //     return 0;
        // }
        
        // 验证可用数量
        // if (skuDetail.getAvailableQty() <= 0) {
        //     log.warn("SKU明细 {} 可用数量不足", skuDetailId);
        //     return 0;
        // }
        
        // 计算匹配数量
        int matchedQty = Math.min(requiredQty, availableQty);
        
        // 销售订单场景：扣减可用数量（不更新declared_qty，因为不是报关）
        // skuDetail.setAvailableQty(skuDetail.getAvailableQty() - matchedQty);
        // skuDetailMapper.updateWithVersion(skuDetail);
        
        log.info("SKU明细 {} 销售订单匹配成功, 匹配数量: {}, 剩余可用: {}", 
            skuDetailId, matchedQty, availableQty - matchedQty);
        
        return matchedQty;
    }
}

