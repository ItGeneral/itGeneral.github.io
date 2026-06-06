# AI Assistant User Guide

## Quick Start

### 1. Configure AI Service

First-time setup requires configuring an AI provider:

1. Click the **⚙ Settings** button in the top right corner
2. Select AI Provider (OpenAI, Anthropic, Alibaba Cloud, etc.)
3. Enter your API Key
4. Set API Endpoint (optional)
5. Choose a model (e.g., `gpt-4o-mini`)
6. Click **Test & Save**

### 2. Start Conversation

Type your question in the input box, then:

- Press **Enter** to send message
- Press **Shift + Enter** for new line
- AI will reply to your message in real-time

### 3. Manage Conversations

- **New Chat**: Click **+ New Chat** button in left sidebar
- **Switch Chat**: Click conversation item in left sidebar
- **Rename Chat**: Hover over conversation, click **✎** icon
- **Delete Chat**: Hover over conversation, click **×** icon

### 4. Upload Files

Method 1: Click **📎** icon next to input box to select files

Method 2: Drag and drop files directly into chat area

## Supported AI Providers

### OpenAI
- API Endpoint: `https://api.openai.com/v1`
- Recommended Models:
  - `gpt-4o-mini` - Fast and economical
  - `gpt-4o` - Powerful performance
  - `gpt-3.5-turbo` - Cost-effective

### Anthropic Claude
- API Endpoint: `https://api.anthropic.com`
- Recommended Models:
  - `claude-3-5-sonnet-20241022` - Latest version
  - `claude-3-haiku-20240307` - Fast response

### Alibaba Cloud Qwen
- API Endpoint: `https://dashscope.aliyuncs.com/compatible-mode/v1`
- Recommended Models:
  - `qwen-turbo` - Fast response
  - `qwen-plus` - Balanced performance
  - `qwen-max` - Maximum performance

## Usage Tips

### Programming
- **Debug Code**: Paste code and error messages, let AI help analyze
- **Explain Code**: Select confusing code snippets, ask AI
- **Optimize Code**: Let AI help optimize code performance

### Text Processing
- **Summarize**: Paste long text, let AI provide summary
- **Translate**: Let AI translate content between languages
- **Rewrite**: Let AI rewrite text in different styles

### Learning Aid
- **Explain Concepts**: Ask for detailed explanations of technical concepts
- **Best Practices**: Ask about industry best practices
- **Troubleshoot**: Describe problems, let AI provide troubleshooting steps

## FAQ

**Q: AI reply is slow?**
A: Check network connection, or switch to faster model (e.g., gpt-4o-mini)

**Q: Prompt "Please configure AI first"?**
A: Click settings button, configure AI provider and API Key

**Q: File upload failed?**
A: Ensure file is in text format and under 100KB

**Q: How to view conversation history?**
A: All conversations are saved in left sidebar, click to switch

## Important Notes

⚠️ **API Key Security**
- API Key is stored only in local browser
- Never uploaded to any server
- Do not share your API Key

⚠️ **File Limits**
- Single file size limit: 100KB
- Confirmation prompt for oversized files
- Large files may exceed AI context limit

⚠️ **Network Requirements**
- Stable network connection required
- Some regions may require VPN
