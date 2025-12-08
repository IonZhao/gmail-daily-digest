import { google } from 'googleapis';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// AI Provider setup - support both OpenAI and Anthropic
const AI_PROVIDER = process.env.AI_PROVIDER || 'openai'; // default to openai

let anthropic, openai;

if (AI_PROVIDER === 'anthropic') {
  anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
} else {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Gmail API setup using OAuth 2.0
const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI || 'urn:ietf:wg:oauth:2.0:oob'
);

// Set credentials from refresh token
oauth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN,
});

const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

/**
 * Get emails from the last 24 hours
 */
async function getRecentEmails() {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const timestamp = Math.floor(yesterday.getTime() / 1000);

    const response = await gmail.users.messages.list({
      userId: 'me',
      q: `after:${timestamp}`,
      maxResults: 100,
    });

    const messages = response.data.messages || [];

    if (messages.length === 0) {
      console.log('No emails found in the last 24 hours.');
      return [];
    }

    console.log(`Found ${messages.length} emails in the last 24 hours.`);

    // Fetch full message details
    const emails = await Promise.all(
      messages.map(async (message) => {
        const msg = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
          format: 'full',
        });

        const headers = msg.data.payload.headers;
        const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
        const from = headers.find(h => h.name === 'From')?.value || 'Unknown';
        const date = headers.find(h => h.name === 'Date')?.value || 'Unknown';

        // Get email body - extract text content
        let body = '';

        function getTextFromPart(part) {
          if (part.mimeType === 'text/plain' && part.body.data) {
            return Buffer.from(part.body.data, 'base64').toString('utf-8');
          }
          if (part.parts) {
            for (const subPart of part.parts) {
              const text = getTextFromPart(subPart);
              if (text) return text;
            }
          }
          return '';
        }

        if (msg.data.payload.parts) {
          body = getTextFromPart(msg.data.payload);
        } else if (msg.data.payload.body.data) {
          body = Buffer.from(msg.data.payload.body.data, 'base64').toString('utf-8');
        }

        // Use body if available, otherwise fall back to snippet
        const content = body ? body.substring(0, 3000) : msg.data.snippet;

        return {
          id: message.id,
          subject,
          from,
          date,
          content, // Use content instead of snippet/body
        };
      })
    );

    return emails;
  } catch (error) {
    console.error('Error fetching emails:', error);
    throw error;
  }
}

/**
 * Summarize emails using AI (OpenAI or Anthropic)
 */
async function summarizeEmails(emails, recipientName = 'Yang') {
  if (emails.length === 0) {
    return `Hi ${recipientName},\n\n今天没有收到新邮件。\n\n---\n此邮件由 Gmail Daily Summary 自动生成`;
  }

  const emailsText = emails.map((email, index) =>
    `邮件 ${index + 1}:
主题: ${email.subject}
发件人: ${email.from}
日期: ${email.date}
内容: ${email.content}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
  ).join('\n\n');

  const today = new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });

  const prompt = `你是一个专业的邮件助理。请帮我总结今天收到的邮件，生成一份清晰、有条理的中文摘要。

重要要求：
1. 使用纯文本格式，不要使用 Markdown 语法（不要用 #、**、- 等符号）
2. 使用 Unicode 字符来美化格式：
   - 分隔线使用：━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   - 图标使用：📧 📌 ⚠️ ✓ ⏳ 💼 🔐 📊 🍀 等
3. 按照以下格式组织内容：

开头：
Hi ${recipientName},

这是你今天（${today}）收到的邮件总结：

📧 今天共收到 [${emails.length}] 封邮件，[简要概述主题]。

然后按类别分组（使用分隔线和标题）：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 [类别名称]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. [邮件主题/来源]
   ⚠️ 状态：[如果有]
   📝 重要行动：[如果有需要采取的行动]
   💡 提示：[如果有重要提示]
   ...

如果有紧急或重要事项，添加专门的部分：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 需要立即处理的事项
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

最后添加总结部分：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 [总结标题]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

结尾：
祝你[根据内容写合适的祝福]！🍀

---
此邮件由 Gmail Daily Summary 自动生成

以下是今天收到的邮件：

${emailsText}

请仔细分析这些邮件，提取关键信息，生成一份清晰、易读的中文摘要。记住：使用纯文本格式和 Unicode 字符，不要使用 Markdown。`;

  try {
    if (AI_PROVIDER === 'anthropic') {
      console.log('Using Anthropic Claude API...');
      const message = await anthropic.messages.create({
        model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
        max_tokens: 2048,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });
      return message.content[0].text;
    } else {
      console.log('Using OpenAI API...');
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [{
          role: 'user',
          content: prompt
        }],
        temperature: 0.7,
        max_tokens: 2048,
      });
      return completion.choices[0].message.content;
    }
  } catch (error) {
    console.error('Error summarizing emails:', error);
    throw error;
  }
}

/**
 * Send summary email
 */
async function sendSummaryEmail(summary, emailCount) {
  const to = process.env.RECIPIENT_EMAIL;
  const today = new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });
  const subject = `${today}邮件总结（${emailCount}封）`;

  // Encode subject for MIME header (RFC 2047)
  const encodedSubject = `=?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`;

  // The summary already contains the full formatted content
  const emailContent = `Subject: ${encodedSubject}
To: ${to}
Content-Type: text/plain; charset=utf-8

${summary}
`;

  const encodedEmail = Buffer.from(emailContent)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  try {
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedEmail,
      },
    });
    console.log(`Summary email sent to ${to}`);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('Starting daily email summary...');
    console.log('Timezone:', process.env.TIMEZONE || 'UTC');
    console.log('Current time:', new Date().toLocaleString());

    // Fetch recent emails
    const emails = await getRecentEmails();

    // Summarize emails
    const summary = await summarizeEmails(emails);
    console.log('\nSummary generated:');
    console.log(summary);

    // Send summary email
    await sendSummaryEmail(summary, emails.length);

    console.log('\nDaily email summary completed successfully!');
  } catch (error) {
    console.error('Error in main process:', error);
    process.exit(1);
  }
}

main();
