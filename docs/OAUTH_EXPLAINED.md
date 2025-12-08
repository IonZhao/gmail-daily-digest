# Gmail API OAuth 2.0 详解

## 什么是 Gmail Credentials？

Gmail Credentials 是指用于访问 Gmail API 的认证凭据。有两种方式：

### 方式一：服务账号（Service Account）❌ 不推荐个人使用
- 仅适用于 Google Workspace 企业账号
- 需要域管理员授权
- 使用 JSON 密钥文件

### 方式二：OAuth 2.0 ✅ 推荐个人使用
本项目使用这种方式，包含三个关键要素：

1. **Client ID**：应用的唯一标识符
   - 格式：`1234567890-abc123.apps.googleusercontent.com`
   - 公开信息，可以暴露

2. **Client Secret**：应用的密钥
   - 格式：`GOCSPX-xxxxxxxxxxxxxxxxx`
   - 需要保密，不要公开

3. **Refresh Token**：长期有效的访问令牌
   - 格式：`1//0xxxxxxxxxxxxxxxxxxxxxxx`
   - 非常重要，必须保密！
   - 代表用户的授权，可以长期访问用户数据

## 如何获取这些凭据？

### 第一步：在 Google Cloud Console 创建应用

```
Google Cloud Console
    ↓
创建项目
    ↓
启用 Gmail API
    ↓
创建 OAuth 2.0 凭据
    ↓
获得 Client ID 和 Client Secret
```

### 第二步：本地运行授权流程

```
本地电脑
    ↓
运行 npm run setup
    ↓
生成授权 URL
    ↓
【浏览器】打开 URL，登录 Gmail
    ↓
【浏览器】授权应用访问权限
    ↓
【浏览器】获得 Authorization Code
    ↓
【本地】用 Code 换取 Refresh Token
    ↓
保存 Refresh Token
```

### 第三步：配置 GitHub Actions

```
GitHub Repository Secrets
    ├── GMAIL_CLIENT_ID (从第一步获得)
    ├── GMAIL_CLIENT_SECRET (从第一步获得)
    ├── GMAIL_REFRESH_TOKEN (从第二步获得)
    ├── RECIPIENT_EMAIL (接收邮件的地址)
    └── ANTHROPIC_API_KEY (Claude API key)
```

## OAuth 2.0 工作流程

### 首次授权（本地进行）

```
┌─────────────┐
│ 您的电脑     │
│             │
│ npm run     │
│ setup       │
└──────┬──────┘
       │
       │ 1. 生成授权 URL
       ↓
┌─────────────────────┐
│ 浏览器              │
│                     │
│ https://accounts.   │
│ google.com/o/       │
│ oauth2/auth?...     │
└──────┬──────────────┘
       │
       │ 2. 用户登录并授权
       ↓
┌─────────────────────┐
│ Google OAuth        │
│ 授权服务器          │
└──────┬──────────────┘
       │
       │ 3. 返回 Authorization Code
       ↓
┌─────────────┐
│ 您的电脑     │
│             │
│ 输入 Code   │
└──────┬──────┘
       │
       │ 4. 用 Code 换取 Tokens
       ↓
┌─────────────────────┐
│ Google OAuth        │
│ 返回：              │
│ - Access Token      │
│ - Refresh Token     │
└─────────────────────┘
```

### 自动运行（GitHub Actions）

```
每天早上 10:00
       │
       ↓
┌──────────────────────┐
│ GitHub Actions       │
│                      │
│ 环境变量：           │
│ - CLIENT_ID          │
│ - CLIENT_SECRET      │
│ - REFRESH_TOKEN      │
└──────┬───────────────┘
       │
       │ 1. 使用 Refresh Token
       │    获取新的 Access Token
       ↓
┌──────────────────────┐
│ Google OAuth         │
│ 返回新的             │
│ Access Token         │
│ (有效期 1 小时)      │
└──────┬───────────────┘
       │
       │ 2. 使用 Access Token
       │    调用 Gmail API
       ↓
┌──────────────────────┐
│ Gmail API            │
│ - 读取邮件列表       │
│ - 读取邮件内容       │
│ - 发送摘要邮件       │
└──────────────────────┘
```

## 常见问题

### Q1: 为什么需要 Refresh Token？

**A**: Access Token 的有效期只有 1 小时，过期后需要重新获取。Refresh Token 可以用来自动获取新的 Access Token，无需用户再次授权。

### Q2: Refresh Token 会过期吗？

**A**: 在以下情况下会过期：
- 6个月未使用
- 用户撤销授权
- 用户修改密码（某些情况下）
- 达到最大数量限制（每个用户每个应用最多 50 个）

### Q3: 如何保护 Refresh Token 的安全？

**A**:
- ✅ 存储在 GitHub Secrets 中
- ✅ 不要提交到代码仓库
- ✅ 不要在日志中打印
- ❌ 不要分享给他人
- ❌ 不要在公开的地方展示

### Q4: 程序如何访问我的邮件？

**A**: 通过您授权的 OAuth 2.0 流程：

1. 您在浏览器中登录 Gmail 并授权
2. Google 发放 Refresh Token 给应用
3. 应用使用 Refresh Token 代表您访问 Gmail
4. 每次访问时，Google 验证 Refresh Token 的有效性

这就像您给了程序一把"钥匙"，程序可以用这把钥匙代表您操作，但您可以随时收回这把钥匙（撤销授权）。

### Q5: 如何撤销授权？

**A**: 访问 https://myaccount.google.com/permissions ，找到您的应用并点击"移除访问权限"。

## 安全最佳实践

1. **定期检查授权**：
   - 定期访问 Google 账号权限页面
   - 检查哪些应用有访问权限

2. **最小权限原则**：
   - 只请求必要的权限
   - 本项目只请求：gmail.readonly 和 gmail.send

3. **保护密钥**：
   - 使用 GitHub Secrets 存储敏感信息
   - 本地 .env 文件不要提交到 Git

4. **监控使用**：
   - 检查 GitHub Actions 运行日志
   - 确保没有异常访问

## 技术细节：Token 类型对比

| Token 类型 | 有效期 | 用途 | 可否刷新 |
|-----------|--------|------|---------|
| Authorization Code | 几分钟 | 换取 Access Token | 否 |
| Access Token | 1 小时 | 访问 API | 否 |
| Refresh Token | 长期* | 获取新的 Access Token | 是 |

*长期有效，但有上述过期条件

## 数据流向图

```
┌──────────────┐
│  您的 Gmail   │
│              │
│  邮件数据     │
└──────┬───────┘
       │
       │ OAuth 授权访问
       ↓
┌──────────────────┐
│  Gmail API       │
│                  │
│  读取邮件        │
└──────┬───────────┘
       │
       │ 邮件原始数据
       ↓
┌──────────────────┐
│  本程序          │
│  (GitHub Actions)│
│                  │
│  整理邮件信息    │
└──────┬───────────┘
       │
       │ 邮件摘要文本
       ↓
┌──────────────────┐
│  Claude API      │
│                  │
│  生成智能摘要    │
└──────┬───────────┘
       │
       │ AI 生成的摘要
       ↓
┌──────────────────┐
│  Gmail API       │
│                  │
│  发送摘要邮件    │
└──────┬───────────┘
       │
       │ 发送邮件
       ↓
┌──────────────────┐
│  接收邮箱        │
│  (RECIPIENT_     │
│   EMAIL)         │
└──────────────────┘
```

## 总结

Gmail Credentials（OAuth 2.0 方式）包含：
- **Client ID + Client Secret**：应用的身份标识
- **Refresh Token**：您的授权凭证

程序通过这些凭据，以您的身份访问 Gmail，读取邮件并生成摘要。整个过程安全可控，您可以随时撤销授权。
