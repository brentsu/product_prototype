package com.nsy.scm.match.service.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.nsy.scm.match.dto.MatchRequest;
import com.nsy.scm.match.dto.MatchResult;
import com.nsy.scm.match.enums.MatchStatus;
import com.nsy.wms.common.lock.annotation.JLock;

import lombok.extern.slf4j.Slf4j;

/**
 * SKU明细匹配器抽象基类
 * 提供公共的 doMatch 和 matchSkuDetail 逻辑
 * 子类实现个性化的更新SKU明细和保存匹配记录逻辑
 * 
 * @author system
 */
@Slf4j
public abstract class AbstractSkuDetailMatcher {

    /**
     * 核心匹配方法：doMatch
     * 
     * 逻辑：
     * 1. 查出仍有余量的SKU明细列表 skuDetailList
     * 2. 遍历skuDetailList，处理每条SkuDetail的处理逻辑，方法名为matchSkuDetail
     * 使用@JLock注解加锁，key包含skuDetailId
     * 如果skuDetail的可用数量能覆盖待匹配数量，则遍历中断
     * 如果可用数量不能覆盖待匹配数量，则优先匹配一部分，再进行下一次循环的匹配
     * 3. 每个遍历处理逻辑中，都要再次从DB获取该skuDetail最新数量，避免超卖现象
     * 
     * @param matchRequest 匹配请求（SKU级别）
     * @return 匹配结果
     */
    protected MatchResult doMatch(MatchRequest matchRequest) {
        String sku = matchRequest.getSku();
        Integer requiredQty = matchRequest.getQuantity();
        String location = matchRequest.getLocation();

        log.debug("开始执行doMatch, SKU: {}, 需求数量: {}", sku, requiredQty);

        // ========== 2.1：查出仍有余量的SKU明细列表 skuDetailList ==========
        List<SkuDetailInfo> skuDetailList = findAvailableSkuDetails(location, sku);

        int remainingQty = requiredQty;
        int totalMatchedQty = 0;

        // ========== 2.2：遍历skuDetailList，处理每条SkuDetail ==========
        for (SkuDetailInfo skuDetailInfo : skuDetailList) {
            if (remainingQty <= 0) {
                break;
            }

            // 再次验证skuDetailInfo 是否含有剩余数量
            if (skuDetailInfo.getAvailableQty() <= 0) {
                continue;
            }

            Long skuDetailId = skuDetailInfo.getSkuDetailId();
            Integer availableQty = skuDetailInfo.getAvailableQty();

            log.debug("  处理SKU明细: skuDetailId={}, availableQty={}, remainingQty={}",
                    skuDetailId, availableQty, remainingQty);

            // 调用matchSkuDetail方法（使用@JLock加锁）
            // 注意：matchSkuDetail使用REQUIRES_NEW事务，即使失败也不影响其他SKU明细的处理
            int matchedQty = 0;
            try {
                matchedQty = matchSkuDetail(
                        location,
                        skuDetailId,
                        sku,
                        remainingQty);
            } catch (Exception e) {
                // 捕获乐观锁异常或其他异常，记录日志但继续处理下一个SKU明细
                log.warn("  SKU明细 {} 匹配失败, 继续处理下一个SKU明细, 异常: {}",
                        skuDetailId, e.getMessage(), e);
                continue;
            }

            if (matchedQty > 0) {
                totalMatchedQty += matchedQty;
                remainingQty -= matchedQty;

                log.debug("  SKU明细 {} 匹配成功, 匹配数量: {}, 剩余需求: {}",
                        skuDetailId, matchedQty, remainingQty);

                // ========== 如果skuDetail的可用数量能覆盖待匹配数量，则遍历中断 ==========
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
     * 匹配单个SKU明细（带分布式锁和事务）
     * 
     * 事务说明：
     * - 使用 REQUIRES_NEW 传播级别：无论外层是否有事务，都新建独立事务并立即提交
     * - 避免大事务导致的乐观锁异常：
     * 1. 每个SKU明细的更新立即提交，version立即生效
     * 2. 其他线程读取时能获取到最新的version，避免乐观锁冲突
     * 3. 即使某个SKU明细更新失败，也不影响其他SKU明细的处理
     * - 在 RC 隔离级别下，保证以下操作的原子性：
     * 1. 读取最新可用数量（getAvailableQtyFromDb）
     * 2. 更新SKU明细（updateSkuDetail）
     * 3. 保存匹配记录（saveMatchRecord）
     * 
     * 分布式锁说明：
     * - 使用@JLock注解加锁，key包含skuDetailId
     * - 在锁内重新从DB获取该skuDetail最新数量，避免超卖现象
     * - 分布式锁 + 独立事务 + RC隔离级别，确保并发安全
     * 
     * @param location    租户
     * @param skuDetailId SKU明细ID
     * @param sku         SKU编码
     * @param requiredQty 待匹配数量
     * @return 实际匹配数量
     */
    @JLock(lockModel = com.nsy.wms.common.lock.enums.LockModel.REENTRANT, lockKey = {
            "'sku_detail_match:' + #location + ':' + #skuDetailId" }, expireSeconds = 30L, waitTime = 10L, failMsg = "SKU明细正在被其他匹配操作占用，请稍后重试")
    @Transactional(propagation = Propagation.REQUIRES_NEW, rollbackFor = Exception.class)
    protected int matchSkuDetail(
            String location,
            Long skuDetailId,
            String sku,
            Integer requiredQty) {

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
        Integer availableQty = getAvailableQtyFromDb(skuDetailId, sku);
        if (availableQty == null || availableQty <= 0) {
            log.debug("    SKU明细 {} 可用数量不足", skuDetailId);
            return 0;
        }

        // 计算匹配数量
        int matchedQty = Math.min(requiredQty, availableQty);

        if (matchedQty <= 0) {
            log.debug("    SKU明细 {} 无法匹配，可用数量: {}", skuDetailId, availableQty);
            return 0;
        }

        // 更新SKU明细（个性化逻辑，由子类实现）
        Integer updatedAvailableQty = updateSkuDetail(skuDetailId, matchedQty, availableQty);

        // 保存匹配记录（个性化逻辑，由子类实现）
        saveMatchRecord(location, skuDetailId, sku, matchedQty);

        log.info("    SKU明细 {} 匹配成功, 匹配数量: {}, 更新后可用: {}",
                skuDetailId, matchedQty, updatedAvailableQty);

        return matchedQty;
    }

    /**
     * 从数据库获取SKU明细的可用数量
     * 子类可以重写此方法以实现不同的查询逻辑
     * 
     * @param skuDetailId SKU明细ID
     * @param sku         SKU编码
     * @return 可用数量
     */
    protected Integer getAvailableQtyFromDb(Long skuDetailId, String sku) {
        // 默认实现：返回模拟值（子类应重写）
        // PurchaseSkuDetail skuDetail =
        // skuDetailMapper.selectByIdForUpdate(skuDetailId);
        // return skuDetail != null ? skuDetail.getAvailable_qty() : 0;
        return 100; // 示例
    }

    /**
     * 查找可用的SKU明细列表
     * 子类可以重写此方法以实现不同的查询逻辑
     * 
     * @param location 租户
     * @param sku      SKU编码
     * @return SKU明细列表
     */
    protected List<SkuDetailInfo> findAvailableSkuDetails(String location, String sku) {
        // 默认实现：返回空列表（子类应重写）
        // List<PurchaseSkuDetail> skuDetailList =
        // skuDetailMapper.findAvailableSkuDetail(
        // location,
        // sku,
        // "签署完成", // 合同状态
        // "ASC" // FIFO排序
        // );
        return new ArrayList<>();
    }

    /**
     * 更新SKU明细（个性化逻辑）
     * 子类实现具体的更新逻辑：
     * - 报关场景：减少可用数量（available_qty - matchedQty），增加已报关数量（declared_qty + matchedQty）
     * - 退货场景：增加可用数量（available_qty + matchedQty），增加退货数量（return_qty + matchedQty）
     * 
     * @param skuDetailId  SKU明细ID
     * @param matchedQty   匹配数量
     * @param availableQty 当前可用数量
     * @return 更新后的可用数量
     */
    protected abstract Integer updateSkuDetail(Long skuDetailId, int matchedQty, Integer availableQty);

    /**
     * 保存匹配记录（个性化逻辑）
     * 子类实现具体的保存逻辑（保存到不同的表，字段不同）
     * 子类可以通过成员变量或其他方式获取匹配上下文信息
     * 
     * @param location    租户
     * @param skuDetailId SKU明细ID
     * @param sku         SKU编码
     * @param matchedQty  匹配数量
     */
    protected abstract void saveMatchRecord(
            String location,
            Long skuDetailId,
            String sku,
            int matchedQty);

    /**
     * SKU明细信息（内部类，用于模拟数据库查询结果）
     */
    @lombok.Data
    @lombok.AllArgsConstructor
    protected static class SkuDetailInfo {
        private Long skuDetailId;
        private Integer availableQty;
        private String contractNo;
        private String contractItemNo;
    }
}
