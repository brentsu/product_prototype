package com.nsy.scm.match.service.impl;

import java.util.ArrayList;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nsy.scm.match.dto.CustomsDeclarationMatchResponse;
import com.nsy.scm.match.dto.CustomsDeclarationRequest;
import com.nsy.scm.match.dto.MatchRequest;
import com.nsy.scm.match.dto.MatchResult;
import com.nsy.scm.match.enums.MatchType;

import lombok.extern.slf4j.Slf4j;

/**
 * 报关单匹配服务实现
 * 匹配策略：FIFO（先进先出）
 * 
 * @author system
 */
@Slf4j
@Service
public class CustomsDeclarationMatcher extends AbstractSkuDetailMatcher {

    // 注入Mapper或Service
    // private PurchaseSkuDetailMapper skuDetailMapper;
    // private SkuCustomsDeclareMatchMapper matchMapper;

    // 当前匹配上下文（用于 saveMatchRecord 方法）
    private CustomsDeclarationRequest currentCustomsRequest;
    private CustomsDeclarationRequest.DeclareDocumentAggregatedItem currentAggregatedItem;
    private CustomsDeclarationRequest.DeclareSku currentDeclareSku;

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

                        // 保存匹配上下文到成员变量（用于 saveMatchRecord 方法）
                        this.currentCustomsRequest = customsRequest;
                        this.currentAggregatedItem = aggregatedItem;
                        this.currentDeclareSku = declareSku;

                        // 调用核心匹配方法 doMatch
                        MatchResult matchResult = doMatch(matchRequest);

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

    @Override
    protected Integer updateSkuDetail(Long skuDetailId, int matchedQty, Integer availableQty) {
        // 报关场景：减少可用数量，增加已报关数量
        // PurchaseSkuDetail skuDetail =
        // skuDetailMapper.selectByIdForUpdate(skuDetailId);
        // skuDetail.setDeclared_qty(skuDetail.getDeclared_qty() + matchedQty);
        // skuDetail.setAvailable_qty(skuDetail.getAvailable_qty() - matchedQty);
        // skuDetailMapper.updateWithVersion(skuDetail);

        // 返回更新后的可用数量（报关场景：可用数量减少）
        Integer updatedAvailableQty = availableQty - matchedQty;
        log.debug("    更新SKU明细 {}: 报关数量 +{}, 可用数量 {} -> {}",
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
        CustomsDeclarationRequest customsRequest = this.currentCustomsRequest;
        CustomsDeclarationRequest.DeclareDocumentAggregatedItem aggregatedItem = this.currentAggregatedItem;
        CustomsDeclarationRequest.DeclareSku declareSku = this.currentDeclareSku;

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

        log.info("    保存报关匹配记录: skuDetailId={}, 报关单号={}, 报关项号={}, 匹配数量={}",
                skuDetailId, customsRequest.getDeclare_document_no(), aggregatedItem.getG_no(), matchedQty);
    }
}
