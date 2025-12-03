package com.nsy.scm.match.enums;

/**
 * SKU明细匹配类型枚举
 * 
 * @author system
 */
public enum MatchType {

    /**
     * 报关单匹配
     */
    CUSTOMS_DECLARATION("CUSTOMS_DECLARATION", "报关单匹配"),

    /**
     * 退货匹配
     */
    RETURN_ORDER("RETURN_ORDER", "退货匹配");

    private final String code;
    private final String desc;

    MatchType(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public String getCode() {
        return code;
    }

    public String getDesc() {
        return desc;
    }

    /**
     * 根据code获取枚举
     */
    public static MatchType fromCode(String code) {
        for (MatchType type : values()) {
            if (type.getCode().equals(code)) {
                return type;
            }
        }
        throw new IllegalArgumentException("未知的匹配类型: " + code);
    }
}
