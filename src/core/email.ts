/**
 * EmailJS 邮件服务配置
 *
 * 使用说明：
 * 1. 注册 EmailJS 账号: https://www.emailjs.com/
 * 2. 创建邮件服务（选择 Gmail 或其他邮件提供商）
 * 3. 创建邮件模板，模板变量包括：
 *    - {{feedback_type}}: 反馈类型
 *    - {{feedback_content}}: 反馈内容
 *    - {{user_email}}: 用户邮箱
 *    - {{timestamp}}: 时间戳
 * 4. 获取以下配置信息并填入：
 *    - SERVICE_ID: 服务 ID
 *    - TEMPLATE_ID: 模板 ID
 *    - PUBLIC_KEY: 公钥（Public Key）
 *
 * 配置完成后，在 .env 文件中设置：
 * VITE_EMAILJS_SERVICE_ID=your_service_id
 * VITE_EMAILJS_TEMPLATE_ID=your_template_id
 * VITE_EMAILJS_PUBLIC_KEY=your_public_key
 */

import emailjs from '@emailjs/browser'

// 配置
const CONFIG = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || '',
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '',
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '',
}

/**
 * 初始化 EmailJS
 */
export function initEmailJS(): void {
  if (!CONFIG.publicKey) {
    console.warn('[EmailJS] Public key not configured')
    return
  }

  try {
    emailjs.init(CONFIG.publicKey)
    console.log('[EmailJS] Initialized successfully')
  } catch (error) {
    console.error('[EmailJS] Initialization failed:', error)
  }
}

/**
 * 发送反馈邮件
 */
export async function sendFeedbackEmail(data: {
  type: string
  content: string
  email?: string
}): Promise<{ success: boolean; message: string }> {
  // 检查配置
  if (!CONFIG.serviceId || !CONFIG.templateId) {
    console.error('[EmailJS] Service ID or Template ID not configured')
    return {
      success: false,
      message: '邮件服务未配置，请联系管理员。',
    }
  }

  try {
    // 构建模板参数
    const templateParams = {
      feedback_type: data.type,
      feedback_content: data.content,
      user_email: data.email || '未提供',
      timestamp: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
    }

    // 发送邮件
    const response = await emailjs.send(
      CONFIG.serviceId,
      CONFIG.templateId,
      templateParams
    )

    console.log('[EmailJS] Email sent successfully:', response)

    return {
      success: true,
      message: '感谢您的反馈！我们会尽快处理。',
    }
  } catch (error) {
    console.error('[EmailJS] Failed to send email:', error)

    return {
      success: false,
      message: '发送失败，请稍后重试。',
    }
  }
}

/**
 * 检查 EmailJS 是否已配置
 */
export function isEmailJSConfigured(): boolean {
  return !!(CONFIG.serviceId && CONFIG.templateId && CONFIG.publicKey)
}
