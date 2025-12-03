package com.nsy.scm.match.service.impl;

import com.nsy.scm.match.dto.CustomsDeclarationRequest;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * 报关单匹配上下文
 * 
 * @author system
 */
@Data
@AllArgsConstructor
public class CustomsDeclarationMatchContext implements AbstractSkuDetailMatcher.MatchContext {

    private CustomsDeclarationRequest customsRequest;
    private CustomsDeclarationRequest.DeclareDocumentAggregatedItem aggregatedItem;
    private CustomsDeclarationRequest.DeclareSku declareSku;

    @Override
    public String getOperator() {
        return customsRequest != null ? customsRequest.getOperator() : null;
    }
}
