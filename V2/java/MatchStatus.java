package com.nsy.scm.match.enums;

/**
 * 匹配状态枚举
 * 
 * @author system
 */
public enum MatchStatus {

    /**
     * 完全匹配
     */
    FULLY_MATCHED("FULLY_MATCHED", "完全匹配"),

    /**
     * 部分匹配
     */
    PARTIALLY_MATCHED("PARTIALLY_MATCHED", "部分匹配"),

    /**
     * 匹配失败
     */
    MATCH_FAILED("MATCH_FAILED", "匹配失败");

    private final String code;
    private final String desc;

    MatchStatus(String code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public String getCode() {
        return code;
    }

    public String getDesc() {
        return desc;
    }
}
