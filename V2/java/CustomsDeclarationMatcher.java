package com.nsy.scm.match.service.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nsy.scm.match.dto.CustomsDeclarationMatchResponse;
import com.nsy.scm.match.dto.CustomsDeclarationRequest;
import com.nsy.scm.match.dto.MatchRequest;
import com.nsy.scm.match.dto.MatchResult;
import com.nsy.scm.match.enums.MatchStatus;
import com.nsy.scm.match.enums.MatchType;
import com.nsy.wms.common.lock.annotation.JLock;

import lombok.extern.slf4j.Slf4j;

/**
 * 报关单匹配服务实现
 * 匹配策略：FIFO（先进先出）
 * 
 * @author system
 */
@Slf4j
@Service
public class CustomsDeclarationMatcher {

    // 注入Mapper或Service
    // private PurchaseSkuDetailMapper skuDetailMapper;
    // private SkuCustomsDeclareMatchMapper matchMapper;

    /**
     * 执行报关单匹配（使用报关单专用请求对象）
     * 三级结构：报关单 -> 报关聚合项 -> SKU明细
     * 
     * @param customsRequest 报关单匹配请求
     * @return 匹配结果（结构类似CustomsDeclarationRequest）
     */
    @Transactional(rollbackFor = Exception.class)
    public CustomsDeclarationMatchResponse matchCustomsDeclaration(CustomsDeclarationRequest customsRequest) {
        log.info("开始执行报关单匹配, 报关单号: {}, 租户: {}, 聚合项数量: {}",
                customsRequest.getDeclare_document_no(),
                customsRequest.getLocation(),
                customsRequest.getDeclare_document_aggregated_item() != null
                        ? customsRequest.getDeclare_document_aggregated_item().size()
                        : 0);

        // 构建返回结果（结构类似CustomsDeclarationRequest）
        CustomsDeclarationMatchResponse response = new CustomsDeclarationMatchResponse();
        response.setDeclare_document_no(customsRequest.getDeclare_document_no());
        response.setLocation(customsRequest.getLocation());
        response.setDeclare_document_aggregated_item(new ArrayList<>());

        // ========== 第一级：报关单级别 ==========
        log.info("========== 开始处理报关单: {} ==========", customsRequest.getDeclare_document_no());

        // ========== 第二级：遍历报关聚合项 ==========
        if (customsRequest.getDeclare_document_aggregated_item() != null) {
            for (CustomsDeclarationRequest.DeclareDocumentAggregatedItem aggregatedItem : customsRequest
                    .getDeclare_document_aggregated_item()) {

                Integer gNo = aggregatedItem.getG_no();
                log.info("  ========== 处理报关聚合项, g_no: {}, 报关品名: {} ==========",
                        gNo, aggregatedItem.getCustoms_declare_cn());

                // 构建聚合项返回结果
                CustomsDeclarationMatchResponse.DeclareDocumentAggregatedItem responseAggregatedItem = new CustomsDeclarationMatchResponse.DeclareDocumentAggregatedItem();
                responseAggregatedItem.setG_no(aggregatedItem.getG_no());
                responseAggregatedItem.setSpin_type(aggregatedItem.getSpin_type());
                responseAggregatedItem.setCustoms_declare_cn(aggregatedItem.getCustoms_declare_cn());
                responseAggregatedItem.setCustoms_declare_en(aggregatedItem.getCustoms_declare_en());
                responseAggregatedItem.setFabric_type(aggregatedItem.getFabric_type());
                responseAggregatedItem.setHs_code(aggregatedItem.getHs_code());
                responseAggregatedItem.setSkus(new ArrayList<>());

                // ========== 第三级：遍历SKU列表，调用核心匹配逻辑 ==========
                if (aggregatedItem.getSkus() != null) {
                    for (CustomsDeclarationRequest.DeclareSku declareSku : aggregatedItem.getSkus()) {
                        String sku = declareSku.getSku();
                        Integer requiredQty = declareSku.getQty();

                        log.info("    ========== 处理SKU匹配, SKU: {}, 需求数量: {} ==========", sku, requiredQty);

                        // 构造MatchRequest
                        MatchRequest matchRequest = new MatchRequest();
                        matchRequest.setMatchType(MatchType.CUSTOMS_DECLARATION);
                        matchRequest.setLocation(customsRequest.getLocation());
                        matchRequest.setSku(sku);
                        matchRequest.setQuantity(requiredQty);

                        // 调用核心匹配方法 doMatch
                        MatchResult matchResult = doMatch(matchRequest, customsRequest, aggregatedItem, declareSku);

                        // 构建SKU返回结果
                        CustomsDeclarationMatchResponse.DeclareSku responseSku = new CustomsDeclarationMatchResponse.DeclareSku();
                        responseSku.setSku(matchResult.getSku());
                        responseSku.setQty(matchResult.getQty());
                        responseSku.setMatch_qty(matchResult.getMatch_qty());
                        responseSku.setMatch_status(matchResult.getMatch_status());

                        responseAggregatedItem.getSkus().add(responseSku);
                    }
                }

                response.getDeclare_document_aggregated_item().add(responseAggregatedItem);
            }
        }

        log.info("报关单匹配完成, 报关单号: {}", customsRequest.getDeclare_document_no());

        return response;
    }

    /**
     * 核心匹配方法：doMatch
     * 
     * 逻辑：
     * 1. 查出仍有余量的SKU明细列表 skuDetailList
     * 2. 遍历skuDetailList，处理每条SkuDetail的处理逻辑，方法名为matchSkuDetail
     * 使用@JLock注解加锁，key包含skuDetailId
     * 如果skuDetail的可用数量能覆盖待匹配报关数，则遍历中断
     * 如果可用数量不能覆盖待匹配报关数，则优先匹配一部分，再进行下一次循环的匹配
     * 3. 每个遍历处理逻辑中，都要再次从DB获取该skuDetail最新数量，避免超卖现象
     * 
     * @param matchRequest   匹配请求（SKU级别）
     * @param customsRequest 报关单请求（用于保存匹配记录）
     * @param aggregatedItem 报关聚合项（用于保存匹配记录）
     * @param declareSku     报关SKU明细（用于保存匹配记录）
     * @return 匹配结果
     */
    private MatchResult doMatch(
            MatchRequest matchRequest,
            CustomsDeclarationRequest customsRequest,
            CustomsDeclarationRequest.DeclareDocumentAggregatedItem aggregatedItem,
            CustomsDeclarationRequest.DeclareSku declareSku) {

        String sku = matchRequest.getSku();
        Integer requiredQty = matchRequest.getQuantity();
        String location = matchRequest.getLocation();

        log.debug("开始执行doMatch, SKU: {}, 需求数量: {}", sku, requiredQty);

        // ========== 2.1：查出仍有余量的SKU明细列表 skuDetailList ==========
        // 查找可匹配的SKU明细（FIFO策略：按创建时间升序）
        // List<PurchaseSkuDetail> skuDetailList =
        // skuDetailMapper.findAvailableSkuDetail(
        // location,
        // sku,
        // "签署完成", // 合同状态
        // "ASC" // FIFO排序
        // );

        // 模拟：实际应该从数据库查询
        List<SkuDetailInfo> skuDetailList = new ArrayList<>();
        // 示例数据
        // skuDetailList.add(new SkuDetailInfo(1L, 100, "CT001", "001"));
        // skuDetailList.add(new SkuDetailInfo(2L, 50, "CT001", "001"));

        int remainingQty = requiredQty;
        int totalMatchedQty = 0;

        // ========== 2.2：遍历skuDetailList，处理每条SkuDetail ==========
        for (SkuDetailInfo skuDetailInfo : skuDetailList) {
            if (remainingQty <= 0) {
                break;
            }

            Long skuDetailId = skuDetailInfo.getSkuDetailId();
            Integer availableQty = skuDetailInfo.getAvailableQty();

            log.debug("  处理SKU明细: skuDetailId={}, availableQty={}, remainingQty={}",
                    skuDetailId, availableQty, remainingQty);

            // 调用matchSkuDetail方法（使用@JLock加锁）
            int matchedQty = matchSkuDetail(
                    location,
                    skuDetailId,
                    sku,
                    remainingQty,
                    customsRequest,
                    aggregatedItem,
                    declareSku);

            if (matchedQty > 0) {
                totalMatchedQty += matchedQty;
                remainingQty -= matchedQty;

                log.debug("  SKU明细 {} 匹配成功, 匹配数量: {}, 剩余需求: {}",
                        skuDetailId, matchedQty, remainingQty);

                // ========== 如果skuDetail的可用数量能覆盖待匹配报关数，则遍历中断 ==========
                if (remainingQty <= 0) {
                    log.debug("  需求已完全满足，中断遍历");
                    break;
                }
            }
        }

        // 构建匹配结果
        MatchResult result = new MatchResult();
        result.setSku(sku);
        result.setQty(requiredQty);
        result.setMatch_qty(totalMatchedQty);

        // 判断匹配状态
        if (totalMatchedQty == 0) {
            result.setMatch_status(MatchStatus.MATCH_FAILED);
        } else if (remainingQty > 0) {
            result.setMatch_status(MatchStatus.PARTIALLY_MATCHED);
        } else {
            result.setMatch_status(MatchStatus.FULLY_MATCHED);
        }

        log.info("doMatch完成, SKU: {}, 需求: {}, 已匹配: {}, 未匹配: {}, 状态: {}",
                sku, requiredQty, totalMatchedQty, remainingQty, result.getMatch_status().getDesc());

        return result;
    }

    /**
     * 匹配单个SKU明细
     * 使用@JLock注解加锁，key包含skuDetailId
     * 在锁内重新从DB获取该skuDetail最新数量，避免超卖现象
     * 
     * 逻辑：
     * - 如果skuDetail的可用数量能覆盖待匹配报关数，则全部匹配
     * - 如果可用数量不能覆盖待匹配报关数，则优先匹配一部分
     * 
     * @param location       租户
     * @param skuDetailId    SKU明细ID
     * @param sku            SKU编码
     * @param requiredQty    待匹配报关数
     * @param customsRequest 报关单请求（用于保存匹配记录）
     * @param aggregatedItem 报关聚合项（用于保存匹配记录）
     * @param declareSku     报关SKU明细（用于保存匹配记录）
     * @return 实际匹配数量
     */
    @JLock(lockModel = com.nsy.wms.common.lock.enums.LockModel.REENTRANT, lockKey = {
            "'sku_detail_match:' + #location + ':' + #skuDetailId" }, expireSeconds = 30L, waitTime = 10L, failMsg = "SKU明细正在被其他匹配操作占用，请稍后重试")
    private int matchSkuDetail(
            String location,
            Long skuDetailId,
            String sku,
            Integer requiredQty,
            CustomsDeclarationRequest customsRequest,
            CustomsDeclarationRequest.DeclareDocumentAggregatedItem aggregatedItem,
            CustomsDeclarationRequest.DeclareSku declareSku) {

        log.debug("    matchSkuDetail开始, skuDetailId={}, sku={}, requiredQty={}",
                skuDetailId, sku, requiredQty);

        // ========== 2.3：在锁内再次从DB获取该skuDetail最新数量，避免超卖现象 ==========
        // PurchaseSkuDetail skuDetail =
        // skuDetailMapper.selectByIdForUpdate(skuDetailId);

        // 验证SKU是否匹配
        // if (!sku.equals(skuDetail.getProduct_sku())) {
        // log.warn("SKU不匹配, 期望: {}, 实际: {}", sku, skuDetail.getProduct_sku());
        // return 0;
        // }

        // 获取最新可用数量
        // Integer availableQty = skuDetail.getAvailable_qty();
        // if (availableQty == null || availableQty <= 0) {
        // log.warn("SKU明细 {} 可用数量不足", skuDetailId);
        // return 0;
        // }

        // 模拟：实际应该从数据库查询
        Integer availableQty = 100; // 示例：从DB查询的最新数量

        // 计算匹配数量
        int matchedQty = Math.min(requiredQty, availableQty);

        if (matchedQty <= 0) {
            log.debug("    SKU明细 {} 无法匹配，可用数量: {}", skuDetailId, availableQty);
            return 0;
        }

        // 更新SKU明细的已报关数量
        // skuDetail.setDeclared_qty(skuDetail.getDeclared_qty() + matchedQty);
        // skuDetail.setAvailable_qty(skuDetail.getAvailable_qty() - matchedQty);
        // skuDetailMapper.updateWithVersion(skuDetail);

        // 保存匹配记录到 sku_customs_declare_match 表
        // SkuCustomsDeclareMatch matchRecord = new SkuCustomsDeclareMatch();
        // matchRecord.setLocation(location);
        // matchRecord.setSku_detail_id(skuDetailId);
        // matchRecord.setProduct_sku(sku);
        // matchRecord.setDeclare_document_id(customsRequest.getDeclare_document_id());
        // matchRecord.setDeclare_document_no(customsRequest.getDeclare_document_no());
        // matchRecord.setDeclare_document_aggregated_item_id(aggregatedItem.getDeclare_document_aggregated_item_id());
        // matchRecord.setG_no(aggregatedItem.getG_no());
        // matchRecord.setDeclare_document_item_id(declareSku.getDeclare_document_item_id());
        // matchRecord.setMatched_quantity(matchedQty);
        // matchRecord.setCustoms_declare_cn(aggregatedItem.getCustoms_declare_cn());
        // matchRecord.setCustoms_declare_en(aggregatedItem.getCustoms_declare_en());
        // matchRecord.setHs_code(aggregatedItem.getHs_code());
        // matchRecord.setSpin_type(aggregatedItem.getSpin_type());
        // matchRecord.setFabric_type(aggregatedItem.getFabric_type());
        // matchRecord.setCreate_by(customsRequest.getOperator());
        // matchMapper.insert(matchRecord);

        log.info("    SKU明细 {} 报关匹配成功, 匹配数量: {}, 剩余可用: {}, 报关项号: {}",
                skuDetailId, matchedQty, availableQty - matchedQty, aggregatedItem.getG_no());

        return matchedQty;
    }

    /**
     * SKU明细信息（内部类，用于模拟数据库查询结果）
     */
    @lombok.Data
    @lombok.AllArgsConstructor
    private static class SkuDetailInfo {
        private Long skuDetailId;
        private Integer availableQty;
        private String contractNo;
        private String contractItemNo;
    }
}
