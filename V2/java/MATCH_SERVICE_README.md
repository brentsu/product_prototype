# SKU明细匹配服务设计文档

## 概述

本设计使用**策略模式**和**多态**实现不同单据类型的SKU明细匹配服务，通过**分布式锁**保证并发安全。

## 架构设计

### 1. 核心组件

- **SkuDetailMatchService**: 服务门面，统一入口
- **MatcherRouter**: 路由器，根据匹配类型路由到不同的匹配服务
- **SkuDetailMatcher**: 匹配服务接口（策略接口）
- **CustomsDeclarationMatcher**: 报关单匹配服务实现
- **ReturnOrderMatcher**: 退货匹配服务实现
- **SalesOrderMatcher**: 销售订单匹配服务实现

### 2. 设计模式

- **策略模式**: 不同匹配类型使用不同的匹配策略
- **多态**: 通过接口实现多态，便于扩展新的匹配类型
- **门面模式**: SkuDetailMatchService作为统一入口

### 3. 并发控制

使用**分布式锁**（@JLock注解）保护关键操作：

1. **外层锁**: 保护整个匹配流程，锁的key为 `sku` + `location`
2. **内层锁**: 保护单个SKU明细的匹配操作，锁的key为 `sku_detail_match:{location}:{sku_detail_id}`

这样可以防止：
- 同一SKU在不同匹配类型间的并发冲突
- 同一SKU明细在多个匹配操作间的并发冲突

## 匹配类型

### 1. 报关单匹配 (CUSTOMS_DECLARATION)

- **匹配策略**: FIFO（先进先出）
- **业务逻辑**: 
  - 从SKU明细中匹配可用数量
  - 更新 `declared_qty`（已报关数量）
  - 扣减 `available_qty`（可用数量）
- **匹配表**: `sku_customs_declare_match`

### 2. 退货匹配 (RETURN_ORDER)

- **匹配策略**: 根据退货单关联的原始单据匹配
- **业务逻辑**:
  - 匹配到对应的SKU明细
  - 增加 `return_qty`（退货数量）
  - 增加 `available_qty`（退货后可用数量增加）
- **匹配表**: `sku_detail_match`

### 3. 销售订单匹配 (SALES_ORDER)

- **匹配策略**: FIFO（先进先出）
- **业务逻辑**:
  - 从SKU明细中匹配可用数量
  - 扣减 `available_qty`（可用数量）
  - 不更新 `declared_qty`（因为不是报关）
- **匹配表**: `sku_detail_match`

## 使用示例

### 1. 报关单匹配

```java
@Autowired
private SkuDetailMatchService matchService;

// 创建匹配请求
MatchRequest request = new MatchRequest();
request.setMatchType(MatchType.CUSTOMS_DECLARATION);
request.setLocation("CN");
request.setBusinessDocumentNo("FBA194287Y1B");
request.setBusinessDocumentId(12345L);
request.setOperator("admin");

// 添加SKU匹配项
List<MatchRequest.SkuMatchItem> items = new ArrayList<>();
MatchRequest.SkuMatchItem item = new MatchRequest.SkuMatchItem();
item.setSku("LC788786-P3010-XL");
item.setQuantity(120);
items.add(item);
request.setSkuMatchItems(items);

// 执行匹配
MatchResult result = matchService.match(request);

// 处理结果
if (result.getSuccess()) {
    System.out.println("匹配成功，匹配数量: " + result.getTotalMatchedQty());
} else {
    System.out.println("匹配失败: " + result.getErrorMessage());
}
```

### 2. 退货匹配

```java
MatchRequest request = new MatchRequest();
request.setMatchType(MatchType.RETURN_ORDER);
request.setLocation("CN");
request.setBusinessDocumentNo("RO20250101001");
request.setOperator("admin");

List<MatchRequest.SkuMatchItem> items = new ArrayList<>();
MatchRequest.SkuMatchItem item = new MatchRequest.SkuMatchItem();
item.setSku("LC788786-P3010-XL");
item.setQuantity(20);  // 退货20件
items.add(item);
request.setSkuMatchItems(items);

MatchResult result = matchService.match(request);
```

### 3. 销售订单匹配

```java
MatchRequest request = new MatchRequest();
request.setMatchType(MatchType.SALES_ORDER);
request.setLocation("CN");
request.setBusinessDocumentNo("SO20250101001");
request.setOperator("admin");

List<MatchRequest.SkuMatchItem> items = new ArrayList<>();
MatchRequest.SkuMatchItem item = new MatchRequest.SkuMatchItem();
item.setSku("LC788786-P3010-XL");
item.setQuantity(50);  // 销售50件
items.add(item);
request.setSkuMatchItems(items);

MatchResult result = matchService.match(request);
```

## 分布式锁说明

### 锁的层次结构

1. **外层锁**（方法级别）:
   - 锁的key: `sku` + `location`
   - 作用: 防止同一SKU在不同匹配类型间的并发冲突
   - 锁模式: `MULTIPLE`（多锁）

2. **内层锁**（方法内部）:
   - 锁的key: `sku_detail_match:{location}:{sku_detail_id}`
   - 作用: 防止同一SKU明细在多个匹配操作间的并发冲突
   - 锁模式: `REENTRANT`（可重入锁）

### 锁配置

```java
@JLock(
    lockModel = LockModel.MULTIPLE,  // 多锁模式
    lockKey = {"#request.skuMatchItems[].sku", "#request.location"},
    expireSeconds = 30L,  // 锁超时时间30秒
    waitTime = 10L,  // 等待加锁超时时间10秒
    failMsg = "匹配正在处理中，请稍后重试"
)
```

## 扩展新匹配类型

1. 创建新的匹配服务实现类，实现 `SkuDetailMatcher` 接口
2. 在 `MatchType` 枚举中添加新的匹配类型
3. Spring会自动注册新的匹配服务到 `MatcherRouter`

示例：

```java
@Service
public class NewMatchTypeMatcher implements SkuDetailMatcher {
    
    @Override
    public MatchType getMatchType() {
        return MatchType.NEW_MATCH_TYPE;
    }
    
    @Override
    @JLock(...)
    @Transactional
    public MatchResult match(MatchRequest request) {
        // 实现匹配逻辑
    }
}
```

## 注意事项

1. **事务管理**: 所有匹配服务方法都使用 `@Transactional` 保证数据一致性
2. **锁超时时间**: 根据实际业务调整锁的超时时间，避免死锁
3. **错误处理**: 匹配失败时返回详细的错误信息，便于排查问题
4. **日志记录**: 关键操作都记录日志，便于问题追踪
5. **数据校验**: 在锁内再次查询数据，确保数据最新

## 性能优化建议

1. **批量匹配**: 使用 `batchMatch` 方法批量处理多个匹配请求
2. **异步处理**: 对于非实时性要求高的场景，可以考虑异步处理
3. **索引优化**: 确保数据库查询字段都有合适的索引
4. **缓存**: 对于频繁查询的数据，可以考虑使用缓存

