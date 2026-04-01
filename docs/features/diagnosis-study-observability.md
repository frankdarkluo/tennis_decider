# Diagnosis Study Observability

## 功能说明

这次更新把诊断与 study 观测做了三件事：

1. 诊断默认层文案预算
- 默认层 summary 控制长度，避免信息过载。
- 超预算内容进入 `detailedSummary`，在展开层查看。

2. 诊断跨模式一致性
- quick / standard / deep 保持同一主线判断（`problemTag` 与 `primaryNextStep` 不漂移）。
- 模式差异只体现在解释深度，不改变训练方向。

3. study flush 失败可观测性分桶
- flush 失败从单一失败状态升级为三类分桶：
  - `network_error`
  - `http_non_2xx`
  - `beacon_rejected`
- 管理员本地导出新增分桶摘要，便于快速定位问题主因。

## 关键设计决策

### 决策 A：默认层优先“动作可执行”
- 默认层只保留最短可执行表达。
- 详细解释按需展开，不在默认层堆叠。

### 决策 B：一致性优先于“模式存在感”
- effort mode 只调解释深度，不改变主线标签。
- 低证据场景同样保持主动作稳定，减少用户困惑。

### 决策 C：观测增强不改事件协议
- 保持既有 study event schema 不变。
- 通过本地 fallback 日志 + 聚合统计补足可观测性。

## 使用示例

### 示例 1：诊断文案预算
- 用户输入：`正手在关键分的时候，如果对手在网前，我容易紧张，一发力就出界`
- 预期体验：
  - 默认层显示短版 summary
  - 点击展开后显示更完整的 `detailedSummary`

### 示例 2：跨模式一致性
- 同一输入分别执行 quick / standard / deep。
- 预期结果：
  - `problemTag` 一致
  - `primaryNextStep` 一致
  - causes/fixes/drills 数量按模式变化

### 示例 3：导出分桶摘要
- 管理员页点击“导出本地日志”。
- 导出 JSON 中可见：
  - `studyFlushFallbackLogs`
  - `studyFlushFallbackSummary.total`
  - `studyFlushFallbackSummary.byReason.http_non_2xx`

## 适用边界
- 适用于当前 study phase 的诊断与事件可靠性观察。
- 不包含：
  - 重开 `/video-diagnose` 主路径
  - 修改 frozen `/library` 或 `/rankings` 逻辑
  - 修改 study event schema