package com.nsy.scm.match.dto;

import java.io.Serializable;
import java.util.List;

import com.nsy.scm.match.enums.MatchStatus;

import lombok.Data;

/**
 * 退货订单匹配响应对象
 * 结构类似ReturnOrderRequest，但包含匹配结果信息
 * 
 * @author system
 */
@Data
public class ReturnOrderMatchResponse implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 退货单号
     */
    private String purchase_return_order_no;

    /**
     * 租户/地区
     */
    private String location;

    /**
     * SKU列表（包含匹配结果）
     */
    private List<ReturnSku> skus;

    /**
     * 退货SKU明细（包含匹配结果）
     */
    @Data
    public static class ReturnSku implements Serializable {

        private static final long serialVersionUID = 1L;

        /**
         * SKU编码
         */
        private String sku;

        /**
         * 需求数量（return_quantity）
         */
        private Integer return_quantity;

        /**
         * 匹配数量（match_qty）
         */
        private Integer match_qty;

        /**
         * 匹配状态（match_status）：完全匹配、部分匹配、匹配失败
         */
        private MatchStatus match_status;
    }
}
