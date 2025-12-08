# Gmail Daily Summary

自动化每日邮件摘要工具，使用 Gmail API 获取过去24小时的邮件，通过 Claude AI 生成摘要，并发送到指定邮箱。

## 功能特点

- 每天自动读取过去24小时内的所有邮件
- 使用 Claude AI 智能分类和总结邮件内容
- 自动发送摘要邮件到指定邮箱
- 通过 GitHub Actions 实现自动化调度
- 支持自定义时区和执行时间

## 技术栈

- Node.js 20+
- Google Gmail API
- Anthropic Claude API
- GitHub Actions

## 工作原理

本项目通过以下方式实现自动化邮件摘要：

### OAuth 2.0 认证流程

1. **首次设置**（在本地进行）：
   - 使用 Client ID 和 Client Secret 生成授权 URL
   - 用户在浏览器中授权应用访问 Gmail
   - 获得 Authorization Code
   - 用 Authorization Code 换取 Refresh Token

2. **自动运行**（在 GitHub Actions 中）：
   - 使用保存的 Refresh Token 获取临时 Access Token
   - Access Token 用于访问 Gmail API
   - Refresh Token 长期有效，可重复使用

### 如何读取用户邮件

程序通过 Gmail API 以**您的账号身份**读取邮件：

1. 使用 `gmail.users.messages.list()` 获取过去24小时的邮件列表
   - 查询参数：`after:timestamp` (Unix 时间戳)
   - 用户 ID：`'me'` 表示当前授权的用户

2. 使用 `gmail.users.messages.get()` 获取每封邮件的详细内容
   - 提取标题、发件人、日期、正文等信息

3. 将邮件内容发送给 Claude AI 进行摘要

4. 使用 `gmail.users.messages.send()` 发送摘要邮件

**关键点**：
- Refresh Token 代表了您的授权，必须妥善保管
- 程序只读取您自己的邮件（通过 OAuth 授权）
- 可以随时在 [Google 账号权限页面](https://myaccount.google.com/permissions) 撤销授权

## 设置步骤

### 1. Google Cloud 配置（OAuth 2.0）

#### 步骤 1.1: 创建项目并启用 Gmail API

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 在左侧菜单中选择 "APIs & Services" > "Library"
4. 搜索 "Gmail API" 并点击启用

#### 步骤 1.2: 创建 OAuth 2.0 凭据

1. 导航到 "APIs & Services" > "Credentials"
2. 点击 "Create Credentials" > "OAuth client ID"
3. 如果是第一次，需要先配置 OAuth consent screen：
   - User Type: 选择 "External"（个人账号）或 "Internal"（Workspace）
   - App name: 填写应用名称（如 "Gmail Daily Summary"）
   - User support email: 填写您的邮箱
   - Developer contact: 填写您的邮箱
   - Scopes: 添加以下权限：
     - `https://www.googleapis.com/auth/gmail.readonly`
     - `https://www.googleapis.com/auth/gmail.send`
   - Test users: 添加您的 Gmail 地址（在发布前）
4. 回到 Credentials 页面，创建 OAuth client ID：
   - Application type: 选择 "Desktop app"
   - Name: 填写名称（如 "Gmail Daily Summary Desktop"）
   - 点击 "Create"
5. 下载客户端 ID 和密钥（会显示 Client ID 和 Client Secret）

#### 步骤 1.3: 获取 Refresh Token

1. 克隆此项目并安装依赖：
   ```bash
   npm install
   ```

2. 创建 `.env` 文件：
   ```bash
   cp .env.example .env
   ```

3. 编辑 `.env` 文件，填入 Client ID 和 Client Secret：
   ```env
   GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GMAIL_CLIENT_SECRET=your-client-secret
   ```

4. 运行设置脚本：
   ```bash
   npm run setup
   ```

5. 按照提示：
   - 在浏览器中打开显示的 URL
   - 使用您的 Gmail 账号登录
   - 授权应用访问权限
   - 复制授权码并粘贴到终端

6. 脚本会输出 `GMAIL_REFRESH_TOKEN`，将其保存到 `.env` 文件

### 2. AI API Key 配置

本项目支持两种 AI 提供商，**推荐使用 OpenAI（更便宜）**：

#### 选项 A: OpenAI（推荐）💰

1. 访问 [OpenAI Platform](https://platform.openai.com/api-keys)
2. 创建 API Key
3. 保存 API Key（格式：`sk-proj-...`）

**月成本估算**：使用 gpt-4o-mini 模型，每天 50 封邮件，约 **$0.03/月**

#### 选项 B: Anthropic Claude

1. 访问 [Anthropic Console](https://console.anthropic.com/)
2. 创建 API Key
3. 保存 API Key（格式：`sk-ant-...`）

**月成本估算**：使用 claude-3-haiku 模型，每天 50 封邮件，约 **$0.06/月**

📊 **详细价格对比**：查看 [docs/AI_PROVIDER_COMPARISON.md](docs/AI_PROVIDER_COMPARISON.md)

### 3. GitHub Repository 设置

1. Fork 或克隆此项目到您的 GitHub 账号
2. 在 GitHub 仓库中设置 Secrets：
   - 导航到 Settings > Secrets and variables > Actions
   - 添加以下 Repository Secrets：
     - `GMAIL_CLIENT_ID`: OAuth 2.0 客户端 ID
     - `GMAIL_CLIENT_SECRET`: OAuth 2.0 客户端密钥
     - `GMAIL_REFRESH_TOKEN`: 从步骤 1.3 获得的 Refresh Token
     - `RECIPIENT_EMAIL`: 接收摘要的邮箱地址
     - `OPENAI_API_KEY`: OpenAI API Key（如果使用 OpenAI）
     - `ANTHROPIC_API_KEY`: Anthropic API Key（如果使用 Anthropic）

3. （可选）设置 Variables：
   - 在 Settings > Secrets and variables > Actions > Variables 标签
   - `AI_PROVIDER`: `openai` 或 `anthropic`（默认：openai）
   - `OPENAI_MODEL`: OpenAI 模型名称（默认：gpt-4o-mini）
   - `ANTHROPIC_MODEL`: Anthropic 模型名称（默认：claude-3-5-sonnet-20241022）
   - `TIMEZONE`: 时区设置（默认：Asia/Shanghai）

### 4. 调整执行时间

编辑 `.github/workflows/daily-summary.yml` 文件中的 cron 表达式：

```yaml
schedule:
  # 当前设置：每天早上10点（北京时间 UTC+8）
  # UTC时间为 02:00
  - cron: '0 2 * * *'
```

Cron 表达式使用 UTC 时间。例如：
- 北京时间 10:00 (UTC+8) = UTC 02:00 → `'0 2 * * *'`
- 北京时间 09:00 (UTC+8) = UTC 01:00 → `'0 1 * * *'`

### 5. 本地测试

```bash
# 安装依赖
npm install

# 创建 .env 文件
cp .env.example .env

# 编辑 .env 文件，填入配置信息
# 然后运行
npm start
```

## 使用说明

### 自动运行

GitHub Actions 会按照设置的时间自动运行。您可以在 Actions 标签页查看运行历史和日志。

### 手动触发

1. 访问仓库的 Actions 标签页
2. 选择 "Daily Email Summary" 工作流
3. 点击 "Run workflow" 按钮
4. 选择分支并运行

## 项目结构

```
gmailDaily/
├── .github/
│   └── workflows/
│       └── daily-summary.yml    # GitHub Actions 工作流配置
├── src/
│   └── index.js                 # 主程序
├── .env.example                 # 环境变量模板
├── .gitignore
├── package.json
└── README.md
```

## 注意事项

1. **Gmail API 配额**：Gmail API 有每日配额限制，默认为每日 1,000,000,000 配额单位
2. **Anthropic API 费用**：使用 Claude API 会产生费用，请注意控制成本
3. **时区设置**：GitHub Actions 使用 UTC 时间，需要转换到您的本地时区
4. **隐私安全**：
   - 不要将 `.env` 文件提交到仓库
   - 确保 GitHub Secrets 配置正确
   - 定期轮换 API Keys

## 故障排除

### Gmail API 认证失败

- 检查服务账号 JSON 文件是否正确
- 确认已启用 Gmail API
- 如果使用 Google Workspace，检查域范围委派设置

### 没有收到摘要邮件

- 检查 GitHub Actions 运行日志
- 验证 RECIPIENT_EMAIL 是否正确
- 检查垃圾邮件文件夹

### Claude API 错误

- 确认 API Key 是否有效
- 检查账户是否有足够的配额
- 查看 Actions 日志中的详细错误信息

## 自定义开发

### 修改摘要格式

编辑 `src/index.js` 中的 `summarizeEmails` 函数，调整发送给 Claude 的提示词。

### 调整邮件过滤条件

编辑 `src/index.js` 中的 `getRecentEmails` 函数，修改 Gmail 查询参数。

### 添加更多功能

可以考虑添加：
- 邮件标签/分类
- 附件处理
- 多语言支持
- 统计报表
- 邮件优先级标记

## 许可证

ISC

## 贡献

欢迎提交 Issue 和 Pull Request！
