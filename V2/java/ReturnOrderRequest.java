package com.nsy.scm.match.dto;

import java.io.Serializable;
import java.util.List;

import lombok.Data;

/**
 * 退货订单匹配请求对象
 * 
 * @author system
 */
@Data
public class ReturnOrderRequest implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 退货单号
     */
    private String purchase_return_order_no;

    /**
     * 退货单ID（可选，如果已有）
     */
    private Long purchase_return_order_id;

    /**
     * 租户/地区
     */
    private String location;

    /**
     * 操作人
     */
    private String operator;

    /**
     * SKU列表
     */
    private List<ReturnSku> skus;

    /**
     * 退货SKU明细
     */
    @Data
    public static class ReturnSku implements Serializable {

        private static final long serialVersionUID = 1L;

        /**
         * 退货明细项ID（可选，如果已有）
         */
        private Long return_order_item_id;

        /**
         * SKU编码
         */
        private String sku;

        /**
         * 退货数量
         */
        private Integer return_quantity;
    }
}
