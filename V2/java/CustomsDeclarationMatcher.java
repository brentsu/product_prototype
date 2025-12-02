package com.nsy.scm.match.service.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nsy.scm.match.dto.CustomsDeclarationRequest;
import com.nsy.scm.match.dto.MatchRequest;
import com.nsy.scm.match.dto.MatchResult;
import com.nsy.scm.match.dto.SkuMatchContext;
import com.nsy.scm.match.dto.SkuMatchResult;
import com.nsy.scm.match.enums.MatchStatus;
import com.nsy.scm.match.enums.MatchType;
import com.nsy.scm.match.service.SkuDetailMatcher;
import com.nsy.wms.common.lock.annotation.JLock;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;

/**
 * 报关单匹配服务实现
 * 匹配策略：FIFO（先进先出）
 * 
 * @author system
 */
@Slf4j
@Service
public class CustomsDeclarationMatcher implements SkuDetailMatcher {

    // 注入Mapper或Service
    // private PurchaseSkuDetailMapper skuDetailMapper;
    // private SkuCustomsDeclareMatchMapper matchMapper;

    @Override
    public MatchType getMatchType() {
        return MatchType.CUSTOMS_DECLARATION;
    }

    /**
     * 执行报关单匹配
     * 根据报关单JSON格式进行匹配
     * 
     * @param request 匹配请求（通用请求，需要转换为报关单请求）
     * @return 匹配结果
     */
    @Override
    @JLock(lockModel = com.nsy.wms.common.lock.enums.LockModel.REENTRANT, lockKey = {
            "#request.sku",
            "#request.location" }, expireSeconds = 30L, waitTime = 10L, failMsg = "报关单匹配正在处理中，请稍后重试")
    @Transactional(rollbackFor = Exception.class)
    public MatchResult match(MatchRequest request) {
        // 从MatchRequest中提取报关单信息
        // 实际使用时，可以从request.getExtraData()中获取CustomsDeclarationRequest
        // 或者直接使用CustomsDeclarationRequest作为参数

        log.info("开始执行报关单匹配, 报关单号: {}, SKU: {}, 租户: {}",
                request.getBusinessDocumentNo(), request.getSku(), request.getLocation());

        MatchResult result = new MatchResult();
        result.setBusinessDocumentNo(request.getBusinessDocumentNo());
        result.setSuccess(true);
        result.setMatchDetails(new ArrayList<>());

        // SKU字段在最上层，直接使用
        String sku = request.getSku();
        Integer requiredQty = request.getQuantity();

        // 构建SKU匹配上下文（简化版，用于通用匹配）
        SkuMatchContext matchContext = SkuMatchContext.builder()
                .location(request.getLocation())
                .sku(sku)
                .requiredQty(requiredQty)
                .declareDocumentNo(request.getBusinessDocumentNo())
                .declareDocumentId(request.getBusinessDocumentId())
                .operator(request.getOperator())
                .build();

        // 调用核心匹配逻辑：批量匹配单个SKU
        SkuMatchResult skuMatchResult = matchSkuBatch(matchContext);

        // 将SKU匹配结果转换为MatchResult.MatchDetail
        for (SkuMatchResult.SkuDetailMatchRecord record : skuMatchResult.getMatchRecords()) {
            MatchResult.MatchDetail matchDetail = new MatchResult.MatchDetail();
            matchDetail.setSku(sku);
            matchDetail.setSkuDetailId(record.getSkuDetailId());
            matchDetail.setRequiredQty(requiredQty);
            matchDetail.setMatchedQty(record.getMatchedQty());
            matchDetail.setMatchOrder(record.getMatchOrder());
            matchDetail.setAvailableQtyBefore(record.getAvailableQtyBefore());
            matchDetail.setAvailableQtyAfter(record.getAvailableQtyAfter());
            matchDetail.setContractNo(record.getContractNo());
            matchDetail.setContractItemNo(record.getContractItemNo());
            matchDetail.setDetailStatus(skuMatchResult.getMatchStatus());

            result.getMatchDetails().add(matchDetail);
        }

        // 设置匹配结果
        result.setTotalRequiredQty(requiredQty);
        result.setTotalMatchedQty(skuMatchResult.getTotalMatchedQty());
        result.setUnmatchedQty(skuMatchResult.getUnmatchedQty());
        result.setMatchStatus(skuMatchResult.getMatchStatus());
        result.setSuccess(skuMatchResult.getMatchStatus() != MatchStatus.MATCH_FAILED);
        if (skuMatchResult.getErrorMessage() != null) {
            result.setErrorMessage(skuMatchResult.getErrorMessage());
        }

        log.info("报关单匹配完成, 报关单号: {}, SKU: {}, 总需求: {}, 总匹配: {}, 未匹配: {}",
                request.getBusinessDocumentNo(), sku, requiredQty,
                skuMatchResult.getTotalMatchedQty(), skuMatchResult.getUnmatchedQty());

        return result;
    }

    /**
     * 执行报关单匹配（使用报关单专用请求对象）
     * 三级结构：报关单 -> 报关聚合项 -> SKU明细
     * 核心匹配逻辑在SKU级别执行
     * 
     * @param customsRequest 报关单匹配请求
     * @return 匹配结果
     */
    @JLock(lockModel = com.nsy.wms.common.lock.enums.LockModel.MULTIPLE, lockKey = {
            "#customsRequest.declare_document_aggregated_item[].skus[].sku",
            "#customsRequest.location" }, expireSeconds = 30L, waitTime = 10L, failMsg = "报关单匹配正在处理中，请稍后重试")
    @Transactional(rollbackFor = Exception.class)
    public MatchResult matchCustomsDeclaration(CustomsDeclarationRequest customsRequest) {
        log.info("开始执行报关单匹配, 报关单号: {}, 租户: {}, 聚合项数量: {}",
                customsRequest.getDeclare_document_no(),
                customsRequest.getLocation(),
                customsRequest.getDeclare_document_aggregated_item() != null
                        ? customsRequest.getDeclare_document_aggregated_item().size()
                        : 0);

        MatchResult result = new MatchResult();
        result.setBusinessDocumentNo(customsRequest.getDeclare_document_no());
        result.setSuccess(true);
        result.setMatchDetails(new ArrayList<>());

        int totalRequiredQty = 0;
        int totalMatchedQty = 0;

        // ========== 第一级：报关单级别 ==========
        log.info("========== 开始处理报关单: {} ==========", customsRequest.getDeclare_document_no());

        // ========== 第二级：遍历报关聚合项 ==========
        if (customsRequest.getDeclare_document_aggregated_item() != null) {
            for (CustomsDeclarationRequest.DeclareDocumentAggregatedItem aggregatedItem : customsRequest
                    .getDeclare_document_aggregated_item()) {

                Integer gNo = aggregatedItem.getG_no();
                log.info("  ========== 处理报关聚合项, g_no: {}, 报关品名: {} ==========",
                        gNo, aggregatedItem.getCustoms_declare_cn());

                // ========== 第三级：遍历SKU列表，批量调用核心匹配逻辑 ==========
                if (aggregatedItem.getSkus() != null) {
                    for (CustomsDeclarationRequest.DeclareSku declareSku : aggregatedItem.getSkus()) {
                        String sku = declareSku.getSku();
                        Integer requiredQty = declareSku.getQty();

                        totalRequiredQty += requiredQty;

                        log.info("    ========== 处理SKU匹配, SKU: {}, 需求数量: {} ==========", sku, requiredQty);

                        // 构建SKU匹配上下文
                        SkuMatchContext matchContext = SkuMatchContext.builder()
                                .location(customsRequest.getLocation())
                                .sku(sku)
                                .requiredQty(requiredQty)
                                .declareDocumentNo(customsRequest.getDeclare_document_no())
                                .declareDocumentId(customsRequest.getDeclare_document_id())
                                .declareDocumentAggregatedItemId(
                                        aggregatedItem.getDeclare_document_aggregated_item_id())
                                .gNo(aggregatedItem.getG_no())
                                .declareDocumentItemId(declareSku.getDeclare_document_item_id())
                                .customsDeclareCn(aggregatedItem.getCustoms_declare_cn())
                                .customsDeclareEn(aggregatedItem.getCustoms_declare_en())
                                .spinType(aggregatedItem.getSpin_type())
                                .fabricType(aggregatedItem.getFabric_type())
                                .hsCode(aggregatedItem.getHs_code())
                                .operator(customsRequest.getOperator())
                                .build();

                        // ========== 核心匹配逻辑：批量匹配单个SKU ==========
                        SkuMatchResult skuMatchResult = matchSkuBatch(matchContext);

                        // 将SKU匹配结果转换为MatchResult.MatchDetail
                        for (SkuMatchResult.SkuDetailMatchRecord record : skuMatchResult.getMatchRecords()) {
                            MatchResult.MatchDetail matchDetail = new MatchResult.MatchDetail();
                            matchDetail.setSku(sku);
                            matchDetail.setSkuDetailId(record.getSkuDetailId());
                            matchDetail.setRequiredQty(requiredQty);
                            matchDetail.setMatchedQty(record.getMatchedQty());
                            matchDetail.setMatchOrder(record.getMatchOrder());
                            matchDetail.setAvailableQtyBefore(record.getAvailableQtyBefore());
                            matchDetail.setAvailableQtyAfter(record.getAvailableQtyAfter());
                            matchDetail.setContractNo(record.getContractNo());
                            matchDetail.setContractItemNo(record.getContractItemNo());
                            matchDetail.setDetailStatus(skuMatchResult.getMatchStatus());

                            result.getMatchDetails().add(matchDetail);
                            totalMatchedQty += record.getMatchedQty();
                        }

                        // 判断该SKU的匹配状态
                        if (skuMatchResult.getMatchStatus() == MatchStatus.MATCH_FAILED) {
                            result.setMatchStatus(MatchStatus.MATCH_FAILED);
                            result.setSuccess(false);
                            if (result.getErrorMessage() == null) {
                                result.setErrorMessage(skuMatchResult.getErrorMessage());
                            }
                        } else if (skuMatchResult.getMatchStatus() == MatchStatus.PARTIALLY_MATCHED) {
                            result.setMatchStatus(MatchStatus.PARTIALLY_MATCHED);
                            log.warn("    SKU {} 部分匹配，需求: {}, 已匹配: {}, 未匹配: {}",
                                    sku, requiredQty, skuMatchResult.getTotalMatchedQty(),
                                    skuMatchResult.getUnmatchedQty());
                        } else if (skuMatchResult.getMatchStatus() == MatchStatus.FULLY_MATCHED) {
                            if (result.getMatchStatus() == null) {
                                result.setMatchStatus(MatchStatus.FULLY_MATCHED);
                            }
                            log.info("    SKU {} 完全匹配，匹配数量: {}", sku, skuMatchResult.getTotalMatchedQty());
                        }
                    }
                }
            }
        }

        result.setTotalRequiredQty(totalRequiredQty);
        result.setTotalMatchedQty(totalMatchedQty);
        result.setUnmatchedQty(totalRequiredQty - totalMatchedQty);

        log.info("报关单匹配完成, 报关单号: {}, 总需求: {}, 总匹配: {}, 未匹配: {}",
                customsRequest.getDeclare_document_no(), totalRequiredQty, totalMatchedQty,
                totalRequiredQty - totalMatchedQty);

        return result;
    }

    /**
     * 在分布式锁保护下匹配单个SKU明细
     * 
     * @param location     租户
     * @param skuDetailId  SKU明细ID
     * @param sku          SKU编码
     * @param requiredQty  需求数量
     * @param availableQty 可用数量
     * @param request      匹配请求
     * @return 实际匹配数量
     */
    @JLock(lockModel = com.nsy.wms.common.lock.enums.LockModel.REENTRANT, lockKey = {
            "'sku_detail_match:' + #location + ':' + #skuDetailId" }, expireSeconds = 30L, waitTime = 10L, failMsg = "SKU明细正在被其他匹配操作占用，请稍后重试")
    private int matchSkuDetailWithLock(
            String location,
            Long skuDetailId,
            String sku,
            Integer requiredQty,
            Integer availableQty,
            MatchRequest request) {
        // 在锁内再次查询SKU明细，确保数据最新
        // PurchaseSkuDetail skuDetail =
        // skuDetailMapper.selectByIdForUpdate(skuDetailId);

        // 验证SKU是否匹配
        // if (!sku.equals(skuDetail.getSku())) {
        // log.warn("SKU不匹配, 期望: {}, 实际: {}", sku, skuDetail.getSku());
        // return 0;
        // }

        // 验证可用数量
        // if (skuDetail.getAvailableQty() <= 0) {
        // log.warn("SKU明细 {} 可用数量不足", skuDetailId);
        // return 0;
        // }

        // 计算匹配数量
        int matchedQty = Math.min(requiredQty, availableQty);

        // 更新SKU明细的已报关数量
        // skuDetail.setDeclaredQty(skuDetail.getDeclaredQty() + matchedQty);
        // skuDetail.setAvailableQty(skuDetail.getAvailableQty() - matchedQty);
        // skuDetailMapper.updateWithVersion(skuDetail);

        log.info("SKU明细 {} 匹配成功, 匹配数量: {}, 剩余可用: {}",
                skuDetailId, matchedQty, availableQty - matchedQty);

        return matchedQty;
    }

    /**
     * 在分布式锁保护下匹配单个SKU明细（报关单专用）
     * 
     * @param location       租户
     * @param skuDetailId    SKU明细ID
     * @param sku            SKU编码
     * @param requiredQty    需求数量
     * @param availableQty   可用数量
     * @param customsRequest 报关单请求
     * @param aggregatedItem 报关聚合项
     * @param declareSku     报关SKU明细
     * @return 实际匹配数量
     */
    @JLock(lockModel = com.nsy.wms.common.lock.enums.LockModel.REENTRANT, lockKey = {
            "'sku_detail_match:' + #location + ':' + #skuDetailId" }, expireSeconds = 30L, waitTime = 10L, failMsg = "SKU明细正在被其他匹配操作占用，请稍后重试")
    private int matchSkuDetailWithLockForCustoms(
            String location,
            Long skuDetailId,
            String sku,
            Integer requiredQty,
            Integer availableQty,
            CustomsDeclarationRequest customsRequest,
            CustomsDeclarationRequest.DeclareDocumentAggregatedItem aggregatedItem,
            CustomsDeclarationRequest.DeclareSku declareSku) {
        // 在锁内再次查询SKU明细，确保数据最新
        // PurchaseSkuDetail skuDetail =
        // skuDetailMapper.selectByIdForUpdate(skuDetailId);

        // 验证SKU是否匹配
        // if (!sku.equals(skuDetail.getSku())) {
        // log.warn("SKU不匹配, 期望: {}, 实际: {}", sku, skuDetail.getSku());
        // return 0;
        // }

        // 验证可用数量
        // if (skuDetail.getAvailableQty() <= 0) {
        // log.warn("SKU明细 {} 可用数量不足", skuDetailId);
        // return 0;
        // }

        // 计算匹配数量
        int matchedQty = Math.min(requiredQty, availableQty);

        // 更新SKU明细的已报关数量
        // skuDetail.setDeclaredQty(skuDetail.getDeclaredQty() + matchedQty);
        // skuDetail.setAvailableQty(skuDetail.getAvailableQty() - matchedQty);
        // skuDetailMapper.updateWithVersion(skuDetail);

        // 保存匹配记录到 sku_customs_declare_match 表
        // SkuCustomsDeclareMatch matchRecord = new SkuCustomsDeclareMatch();
        // matchRecord.setLocation(location);
        // matchRecord.setSkuDetailId(skuDetailId);
        // matchRecord.setSku(sku);
        // matchRecord.setContractId(skuDetail.getContractId());
        // matchRecord.setContractNo(skuDetail.getContractNo());
        // matchRecord.setContractItemNo(skuDetail.getContractItemNo());
        // matchRecord.setDeclareDocumentId(customsRequest.getDeclare_document_id());
        // matchRecord.setDeclareDocumentNo(customsRequest.getDeclare_document_no());
        // matchRecord.setDeclareDocumentAggregatedItemId(aggregatedItem.getDeclare_document_aggregated_item_id());
        // matchRecord.setG_no(aggregatedItem.getG_no());
        // matchRecord.setDeclareDocumentItemId(declareSku.getDeclare_document_item_id());
        // matchRecord.setMatchedQuantity(matchedQty);
        // matchRecord.setCustomsDeclareCn(aggregatedItem.getCustoms_declare_cn());
        // matchRecord.setCustomsDeclareEn(aggregatedItem.getCustoms_declare_en());
        // matchRecord.setHsCode(aggregatedItem.getHs_code());
        // matchRecord.setSpinType(aggregatedItem.getSpin_type());
        // matchRecord.setFabricType(aggregatedItem.getFabric_type());
        // matchRecord.setCreateBy(customsRequest.getOperator());
        // matchMapper.insert(matchRecord);

        log.info("SKU明细 {} 报关匹配成功, 匹配数量: {}, 剩余可用: {}, 报关项号: {}",
                skuDetailId, matchedQty, availableQty - matchedQty, aggregatedItem.getG_no());

        return matchedQty;
    }

    /**
     * 核心匹配逻辑：批量匹配单个SKU
     * 这是真正的匹配逻辑，在SKU级别执行
     * 支持从多个SKU明细中匹配（FIFO策略）
     * 
     * @param matchContext SKU匹配上下文
     * @return SKU匹配结果
     */
    private SkuMatchResult matchSkuBatch(SkuMatchContext matchContext) {
        log.debug("开始批量匹配SKU: {}, 需求数量: {}", matchContext.getSku(), matchContext.getRequiredQty());

        SkuMatchResult result = new SkuMatchResult();
        result.setSku(matchContext.getSku());
        result.setRequiredQty(matchContext.getRequiredQty());
        result.setMatchRecords(new ArrayList<>());

        // 查找可匹配的SKU明细（FIFO策略：按创建时间升序）
        // List<PurchaseSkuDetail> availableDetails =
        // skuDetailMapper.findAvailableSkuDetail(
        // matchContext.getLocation(),
        // matchContext.getSku(),
        // "签署完成", // 合同状态
        // "ASC" // FIFO排序
        // );

        // 模拟：实际应该从数据库查询
        List<Object> availableDetails = new ArrayList<>();
        // 示例数据
        // availableDetails.add(createMockSkuDetail(1L, 100, "CT001", "001"));
        // availableDetails.add(createMockSkuDetail(2L, 50, "CT001", "001"));

        int remainingQty = matchContext.getRequiredQty();
        int matchOrder = 1;

        // 按FIFO顺序批量匹配
        for (Object detail : availableDetails) {
            if (remainingQty <= 0) {
                break;
            }

            // 获取SKU明细信息
            // Long skuDetailId = detail.getSkuDetailId();
            // Integer availableQty = detail.getAvailableQty();
            // String contractNo = detail.getContractNo();
            // String contractItemNo = detail.getContractItemNo();

            // 示例数据
            Long skuDetailId = matchOrder == 1 ? 1L : 2L;
            Integer availableQty = matchOrder == 1 ? 100 : 50;
            String contractNo = "CT20250101001";
            String contractItemNo = "001";

            // 调用核心匹配方法（带分布式锁）
            SkuDetailMatchResult detailMatchResult = matchSingleSkuDetail(
                    matchContext,
                    skuDetailId,
                    availableQty,
                    contractNo,
                    contractItemNo,
                    remainingQty);

            if (detailMatchResult.getMatchedQty() > 0) {
                // 创建匹配记录
                SkuMatchResult.SkuDetailMatchRecord record = new SkuMatchResult.SkuDetailMatchRecord();
                record.setSkuDetailId(skuDetailId);
                record.setMatchedQty(detailMatchResult.getMatchedQty());
                record.setMatchOrder(matchOrder++);
                record.setAvailableQtyBefore(detailMatchResult.getAvailableQtyBefore());
                record.setAvailableQtyAfter(detailMatchResult.getAvailableQtyAfter());
                record.setContractNo(contractNo);
                record.setContractItemNo(contractItemNo);

                result.getMatchRecords().add(record);
                remainingQty -= detailMatchResult.getMatchedQty();

                log.debug("  SKU明细 {} 匹配成功, 匹配数量: {}, 剩余需求: {}",
                        skuDetailId, detailMatchResult.getMatchedQty(), remainingQty);
            }
        }

        // 计算匹配结果
        result.setTotalMatchedQty(matchContext.getRequiredQty() - remainingQty);
        result.setUnmatchedQty(remainingQty);

        // 判断匹配状态
        if (result.getTotalMatchedQty() == 0) {
            result.setMatchStatus(MatchStatus.MATCH_FAILED);
            result.setErrorMessage("SKU " + matchContext.getSku() + " 无可匹配库存");
        } else if (remainingQty > 0) {
            result.setMatchStatus(MatchStatus.PARTIALLY_MATCHED);
        } else {
            result.setMatchStatus(MatchStatus.FULLY_MATCHED);
        }

        log.info("SKU {} 批量匹配完成, 需求: {}, 已匹配: {}, 未匹配: {}, 状态: {}",
                matchContext.getSku(), matchContext.getRequiredQty(),
                result.getTotalMatchedQty(), result.getUnmatchedQty(),
                result.getMatchStatus().getDesc());

        return result;
    }

    /**
     * 核心匹配方法：匹配单个SKU明细
     * 使用分布式锁保护，确保并发安全
     * 
     * @param matchContext   匹配上下文
     * @param skuDetailId    SKU明细ID
     * @param availableQty   可用数量
     * @param contractNo     合同编号
     * @param contractItemNo 合同项号
     * @param requiredQty    需求数量
     * @return SKU明细匹配结果
     */
    @JLock(lockModel = com.nsy.wms.common.lock.enums.LockModel.REENTRANT, lockKey = {
            "'sku_detail_match:' + #matchContext.location + ':' + #skuDetailId" }, expireSeconds = 30L, waitTime = 10L, failMsg = "SKU明细正在被其他匹配操作占用，请稍后重试")
    private SkuDetailMatchResult matchSingleSkuDetail(
            SkuMatchContext matchContext,
            Long skuDetailId,
            Integer availableQty,
            String contractNo,
            String contractItemNo,
            Integer requiredQty) {

        // 在锁内再次查询SKU明细，确保数据最新
        // PurchaseSkuDetail skuDetail =
        // skuDetailMapper.selectByIdForUpdate(skuDetailId);

        // 验证SKU是否匹配
        // if (!matchContext.getSku().equals(skuDetail.getSku())) {
        // log.warn("SKU不匹配, 期望: {}, 实际: {}", matchContext.getSku(),
        // skuDetail.getSku());
        // return SkuDetailMatchResult.builder().matchedQty(0).build();
        // }

        // 验证可用数量
        // if (skuDetail.getAvailableQty() <= 0) {
        // log.warn("SKU明细 {} 可用数量不足", skuDetailId);
        // return SkuDetailMatchResult.builder().matchedQty(0).build();
        // }

        // 计算匹配数量
        int matchedQty = Math.min(requiredQty, availableQty);
        int availableQtyBefore = availableQty;
        int availableQtyAfter = availableQty - matchedQty;

        // 更新SKU明细的已报关数量
        // skuDetail.setDeclaredQty(skuDetail.getDeclaredQty() + matchedQty);
        // skuDetail.setAvailableQty(availableQtyAfter);
        // skuDetailMapper.updateWithVersion(skuDetail);

        // 保存匹配记录到 sku_customs_declare_match 表
        // saveCustomsMatchRecord(matchContext, skuDetailId, matchedQty, contractNo,
        // contractItemNo);

        log.debug("    SKU明细 {} 匹配成功, 匹配数量: {}, 剩余可用: {}", skuDetailId, matchedQty, availableQtyAfter);

        return SkuDetailMatchResult.builder()
                .matchedQty(matchedQty)
                .availableQtyBefore(availableQtyBefore)
                .availableQtyAfter(availableQtyAfter)
                .build();
    }

    /**
     * SKU明细匹配结果（内部类）
     */
    @Data
    @lombok.Builder
    private static class SkuDetailMatchResult {
        private Integer matchedQty;
        private Integer availableQtyBefore;
        private Integer availableQtyAfter;
    }
}
