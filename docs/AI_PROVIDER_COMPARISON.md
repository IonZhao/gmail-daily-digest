# AI Provider 价格对比

本项目现在支持两种 AI 提供商：**OpenAI** 和 **Anthropic**。您可以根据需求和预算选择。

## 价格对比（截至 2024年12月）

### OpenAI

| 模型 | 输入价格 | 输出价格 | 适用场景 |
|------|---------|---------|---------|
| **gpt-4o-mini** | $0.150 / 1M tokens | $0.600 / 1M tokens | ✅ **推荐** - 性价比最高 |
| gpt-4o | $2.50 / 1M tokens | $10.00 / 1M tokens | 复杂任务，需要最高质量 |
| gpt-3.5-turbo | $0.50 / 1M tokens | $1.50 / 1M tokens | 简单任务 |

### Anthropic

| 模型 | 输入价格 | 输出价格 | 适用场景 |
|------|---------|---------|---------|
| claude-3-haiku-20240307 | $0.25 / 1M tokens | $1.25 / 1M tokens | 快速简单任务 |
| claude-3-5-sonnet-20241022 | $3.00 / 1M tokens | $15.00 / 1M tokens | 高质量输出 |
| claude-3-opus-20240229 | $15.00 / 1M tokens | $75.00 / 1M tokens | 最复杂任务 |

## 实际使用成本估算

假设每天处理 50 封邮件，摘要生成：
- 输入 tokens：约 5,000 tokens（邮件内容）
- 输出 tokens：约 500 tokens（摘要）

### 每月成本（30天）

| 提供商 | 模型 | 月成本（USD） | 备注 |
|--------|------|--------------|------|
| OpenAI | **gpt-4o-mini** | **$0.03** | ✅ **最便宜** |
| OpenAI | gpt-4o | $0.53 | 高质量但贵 |
| OpenAI | gpt-3.5-turbo | $0.10 | 较旧的模型 |
| Anthropic | claude-3-haiku | $0.06 | 经济实惠 |
| Anthropic | claude-3-5-sonnet | $0.68 | 高质量 |
| Anthropic | claude-3-opus | $3.38 | 最贵 |

**计算公式**：
```
月成本 = (输入tokens × 30 × 输入价格 + 输出tokens × 30 × 输出价格) / 1,000,000
```

## 推荐配置

### 💰 最省钱配置
```env
AI_PROVIDER=openai
OPENAI_MODEL=gpt-4o-mini
```
- **月成本**：~$0.03
- **适合**：预算有限，邮件摘要质量要求不高

### ⚖️ 平衡配置
```env
AI_PROVIDER=anthropic
ANTHROPIC_MODEL=claude-3-haiku-20240307
```
- **月成本**：~$0.06
- **适合**：需要可靠质量，价格合理

### 🌟 高质量配置
```env
AI_PROVIDER=openai
OPENAI_MODEL=gpt-4o
```
或
```env
AI_PROVIDER=anthropic
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
```
- **月成本**：$0.50-$0.70
- **适合**：需要最佳摘要质量，对价格不敏感

## 如何切换 AI 提供商

### 方法 1：使用 OpenAI（默认，推荐）

1. 获取 OpenAI API Key：
   - 访问 https://platform.openai.com/api-keys
   - 创建新的 API Key

2. 配置环境变量（本地 `.env` 或 GitHub Secrets）：
   ```env
   AI_PROVIDER=openai
   OPENAI_API_KEY=sk-proj-xxxxx
   OPENAI_MODEL=gpt-4o-mini  # 可选，默认就是这个
   ```

3. GitHub Secrets 设置：
   - `OPENAI_API_KEY`: 您的 OpenAI API Key

4. GitHub Variables 设置（可选）：
   - `AI_PROVIDER`: `openai`
   - `OPENAI_MODEL`: `gpt-4o-mini`（或其他模型）

### 方法 2：使用 Anthropic Claude

1. 获取 Anthropic API Key：
   - 访问 https://console.anthropic.com/
   - 创建新的 API Key

2. 配置环境变量：
   ```env
   AI_PROVIDER=anthropic
   ANTHROPIC_API_KEY=sk-ant-xxxxx
   ANTHROPIC_MODEL=claude-3-haiku-20240307  # 经济实惠
   ```

3. GitHub Secrets 设置：
   - `ANTHROPIC_API_KEY`: 您的 Anthropic API Key

4. GitHub Variables 设置：
   - `AI_PROVIDER`: `anthropic`
   - `ANTHROPIC_MODEL`: `claude-3-haiku-20240307`

## 性能对比

| 维度 | gpt-4o-mini | gpt-4o | claude-3-haiku | claude-3-5-sonnet |
|------|-------------|--------|----------------|-------------------|
| 速度 | ⚡⚡⚡ 很快 | ⚡⚡ 较快 | ⚡⚡⚡ 很快 | ⚡⚡ 较快 |
| 质量 | ⭐⭐⭐ 良好 | ⭐⭐⭐⭐⭐ 优秀 | ⭐⭐⭐ 良好 | ⭐⭐⭐⭐⭐ 优秀 |
| 价格 | 💰 最便宜 | 💰💰💰 较贵 | 💰💰 便宜 | 💰💰💰💰 贵 |
| 推荐度 | ✅✅✅ 强烈推荐 | ✅ 高质量需求 | ✅✅ 推荐 | ✅ 高质量需求 |

## 实测示例

### gpt-4o-mini 摘要示例
```
每日邮件摘要 (2024-12-07)
共收到 15 封邮件

【工作相关】(5封)
- 项目进度更新：Q4 开发计划已完成 80%
- 会议邀请：明天下午 2 点团队站会
...

【通知类】(8封)
- GitHub：3 个 PR 需要 review
- AWS：账单通知 $45.23
...

【个人】(2封)
- 快递已送达
- 银行账单
```

### claude-3-5-sonnet 摘要示例
```
📧 每日邮件摘要 - 2024年12月7日
━━━━━━━━━━━━━━━━━━━━━━
共收到 15 封邮件，分类如下：

🏢 工作相关（5封，需关注）
  • 项目更新：Q4 开发里程碑已达成 80%，按计划推进
  • ⚠️ 会议邀请：明日 14:00 团队同步会，请准备进度报告
  ...

🔔 系统通知（8封）
  • GitHub（3封）：有待审查的 Pull Request
  • AWS 账单：本月费用 $45.23，较上月降低 12%
  ...
```

**结论**：对于邮件摘要这种应用，gpt-4o-mini 的质量已经足够好，而且价格便宜 20 倍以上。

## 注意事项

1. **API 配额限制**：
   - OpenAI：根据付费等级，有不同的 RPM（每分钟请求数）限制
   - Anthropic：新账号有较低的速率限制，需要申请提升

2. **Token 计算**：
   - 中文字符通常比英文消耗更多 tokens
   - 估算：1 个中文字符 ≈ 2-3 tokens

3. **成本优化**：
   - 限制邮件正文长度（当前设置：每封邮件最多 1000 字符）
   - 只处理重要邮件（可以添加过滤规则）
   - 使用更便宜的模型（gpt-4o-mini 或 claude-3-haiku）

## 常见问题

### Q: 为什么推荐 OpenAI 而不是 Anthropic？

**A**: 对于邮件摘要这种相对简单的任务：
- gpt-4o-mini 质量已经很好
- 价格比 Claude 便宜（$0.03 vs $0.06 每月）
- OpenAI API 更稳定，速率限制更宽松

但如果您需要更高质量的摘要，Claude 3.5 Sonnet 可能更好。

### Q: 如何查看实际花费？

**A**:
- OpenAI：https://platform.openai.com/usage
- Anthropic：https://console.anthropic.com/settings/billing

### Q: 可以设置每月预算吗？

**A**: 可以！
- OpenAI：在 Settings > Limits 中设置月度预算
- Anthropic：在 Billing 设置中设置预算上限

### Q: Token 不够用怎么办？

**A**: 如果邮件太多：
1. 增加 `max_tokens` 限制（会增加成本）
2. 减少输入的邮件数量或内容长度
3. 分批处理邮件

## 总结

**最佳选择**：使用 OpenAI 的 **gpt-4o-mini** 模型
- ✅ 性价比最高（每月仅 $0.03）
- ✅ 质量足够好
- ✅ 速度快
- ✅ API 稳定

如果预算充足且需要最高质量，可以考虑 gpt-4o 或 claude-3-5-sonnet。
