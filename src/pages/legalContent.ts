// Legal page content in Chinese and English

export type LegalPageKey = 'privacy' | 'terms' | 'about' | 'contact'

export interface LegalPageContent {
  title: string
  html: string
}

const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
const dateZh = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })

// ── Privacy Policy ──

const privacyZh: LegalPageContent = {
  title: '隐私政策',
  html: `
    <p><strong>最后更新：</strong>${dateZh}</p>

    <h2>1. 引言</h2>
    <p>AI Tools（"我们"、"我们的"或"我们"）致力于保护您的隐私和个人数据。本隐私政策解释了我们在您使用我们的在线开发者工具时如何收集、使用、存储和保护您的信息。使用 AI Tools 即表示您同意本政策的条款。</p>
    <p><strong>我们的核心隐私原则：</strong> 我们秉承隐私优先的设计理念。与许多在线工具不同，AI Tools 完全在您的浏览器中运行。我们没有收集或存储个人数据、文档或对话的后端服务器。您的数据保留在您的设备上。</p>

    <h2>2. 我们收集的信息</h2>

    <h3>2.1 存储在您浏览器中的本地数据</h3>
    <p><strong>所有用户生成的内容都存储在您设备本地。</strong> 包括：</p>
    <ul>
      <li><strong>Markdown 文档：</strong> 您在 Markdown 编辑器中编写的所有文本都保存到浏览器的 localStorage</li>
      <li><strong>AI 聊天记录：</strong> 您与 AI 助手的对话历史记录存储在本地</li>
      <li><strong>用户设置和偏好：</strong> API 密钥、模型选择、UI 偏好和工具配置</li>
      <li><strong>JSON 数据：</strong> 您在 JSON 转换器中处理的任何 JSON 文本</li>
      <li><strong>正则表达式模式：</strong> 您测试和保存的正则表达式</li>
      <li><strong>文本处理：</strong> 您在我们工具中去重或处理的任何文本</li>
    </ul>
    <p><em>我们不会传输、收集或访问任何此类数据。除非您明确发送到您配置的 AI 服务商，否则它永远不会离开您的浏览器。</em></p>

    <h3>2.2 AI 聊天功能 - 与 AI 服务商直接通信</h3>
    <p>当您使用 AI 聊天功能时，您的消息将<strong>直接</strong>发送到您配置的 AI 服务商（如 OpenAI、Anthropic、DeepSeek 或其他兼容服务）。以下是它的工作原理：</p>
    <ul>
      <li><strong>您的 API 密钥：</strong> 您提供自己的 API 密钥，该密钥<strong>仅存储在您浏览器的 localStorage</strong> 中。我们绝不会在服务器上看到或存储您的 API 密钥。</li>
      <li><strong>消息传输：</strong> 当您发送消息时，它直接从您的浏览器传输到 AI 服务商的 API 端点。我们不会拦截、记录或存储您的对话。</li>
      <li><strong>AI 服务商隐私：</strong> 您对 AI 服务商的使用受其各自隐私政策的约束。请查看您使用的每个 AI 服务商的隐私政策。</li>
      <li><strong>文件附件：</strong> 如果您向 AI 聊天附加文件，文件内容将从您的浏览器读取并包含在您发送给 AI 服务商的消息中。我们不会存储这些文件。</li>
    </ul>

    <h3>2.3 自动收集的信息</h3>
    <p>我们可能会使用第三方分析服务（如 Google Analytics）来了解我们的工具使用情况。这有助于我们改进性能、修复错误并确定功能优先级。收集的信息包括：</p>
    <ul>
      <li><strong>匿名使用统计：</strong> 页面浏览量、您使用的工具和一般使用模式</li>
      <li><strong>浏览器信息：</strong> 浏览器类型、版本和操作系统（用于兼容性优化）</li>
      <li><strong>设备类型：</strong> 您使用的是桌面设备、平板设备还是移动设备</li>
    </ul>
    <p><strong>我们不收集：</strong> 通过分析收集的个人身份信息、姓名、电子邮件地址或精确位置数据。</p>

    <h2>3. Cookie 和跟踪技术</h2>

    <h3>3.1 本地存储（第一方）</h3>
    <p>我们使用浏览器的 localStorage 和 sessionStorage 来：</p>
    <ul>
      <li>保存您的文档和进行中的工作</li>
      <li>存储您的设置和偏好</li>
      <li>缓存数据以提高性能</li>
    </ul>
    <p>此数据永远不会离开您的浏览器，您可以随时通过浏览器设置清除它。</p>

    <h3>3.2 Google AdSense Cookie（第三方）</h3>
    <p>我们使用 Google AdSense 展示广告。Google 可能使用 Cookie 根据您对此网站或其他网站的访问来展示相关广告。</p>
    <ul>
      <li><strong>目的：</strong> 展示相关广告并衡量广告效果</li>
      <li><strong>Google 收集的数据：</strong> 匿名浏览历史记录、兴趣和人口统计信息（由 Google 的广告系统确定）</li>
      <li><strong>您的选择：</strong> 您可以通过访问 <a href="https://www.google.com/settings/ads" target="_blank">Google 广告设置</a> 或 <a href="http://www.aboutads.info/choices/" target="_blank">网络广告倡议选择页面</a> 选择退出个性化广告</li>
    </ul>
    <p><strong>Google 隐私政策：</strong> 有关 Google 如何使用数据的详细信息，请参阅 <a href="https://policies.google.com/privacy" target="_blank">https://policies.google.com/privacy</a></p>

    <h2>4. 第三方服务和链接</h2>
    <p>AI Tools 集成了各种第三方服务。每个服务都有自己的隐私实践：</p>

    <h3>4.1 Google AdSense</h3>
    <p>我们通过 Google 的 AdSense 计划展示广告。Google 根据其隐私政策收集和使用数据。AdSense 可能使用 Cookie 和网络信标跟踪访问者行为并提供个性化广告。</p>

    <h3>4.2 AI 服务商</h3>
    <p>当您使用 AI 聊天时，您直接连接到 AI 服务商。每个服务商都有独立的隐私政策：</p>
    <ul>
      <li><strong>OpenAI：</strong> <a href="https://openai.com/policies/privacy-policy" target="_blank">隐私政策</a></li>
      <li><strong>Anthropic：</strong> <a href="https://www.anthropic.com/privacy" target="_blank">隐私政策</a></li>
      <li><strong>DeepSeek：</strong> 请参阅其官方隐私文档</li>
      <li><strong>其他服务商：</strong> 请查看您配置的任何 AI 服务商的隐私政策</li>
    </ul>

    <h3>4.3 开源库</h3>
    <p>我们的应用程序使用开源库和框架（Vue.js、CodeMirror、Marked 等）。这些库完全在您的浏览器中运行。有关其隐私实践的信息，请参阅其各自的文档。</p>

    <h2>5. 数据安全和保留</h2>

    <h3>5.1 数据存储位置</h3>
    <p><strong>所有数据都存储在您的设备上。</strong> 我们没有收集或存储以下内容的服务器：</p>
    <ul>
      <li>您创建或处理的文档和文件</li>
      <li>聊天记录和 AI 交互</li>
      <li>设置和偏好</li>
      <li>API 密钥或凭据</li>
    </ul>

    <h3>5.2 您的责任</h3>
    <p>由于数据存储在本地，您有责任：</p>
    <ul>
      <li><strong>定期备份：</strong> 重要文档应定期备份。清除浏览器数据将删除所有存储的信息。</li>
      <li><strong>设备安全：</strong> 确保您的设备受密码保护并保持最新状态，以保护本地存储的数据。</li>
      <li><strong>API 密钥安全：</strong> 切勿共享您的 API 密钥。如果您使用公用计算机，使用后请清除浏览器数据。</li>
    </ul>

    <h3>5.3 数据保留期限</h3>
    <p>数据将在浏览器的 localStorage 中保留，直到您：</p>
    <ul>
      <li>通过我们的工具手动删除</li>
      <li>清除浏览器数据/缓存</li>
      <li>卸载或重置浏览器</li>
    </ul>
    <p>我们无法控制本地存储的数据，一旦删除将无法恢复。</p>

    <h2>6. 您的隐私权和选择</h2>

    <h3>6.1 访问和控制</h3>
    <p>由于数据存储在本地，您对数据拥有完全的控制权：</p>
    <ul>
      <li><strong>查看：</strong> 您可以随时通过我们的工具查看所有存储的数据</li>
      <li><strong>删除：</strong> 您可以删除任何文档、对话或存储的数据</li>
      <li><strong>导出：</strong> 您可以随时复制或导出文档</li>
      <li><strong>全部清除：</strong> 清除浏览器数据以删除所有内容</li>
    </ul>

    <h3>6.2 广告个性化控制</h3>
    <p>您可以通过以下方式控制广告个性化：</p>
    <ul>
      <li><a href="https://www.google.com/settings/ads" target="_blank">Google 广告设置</a></li>
      <li>阻止广告 Cookie 的浏览器扩展</li>
      <li>浏览器的隐私和 Cookie 设置</li>
    </ul>

    <h2>7. 儿童隐私</h2>
    <p>我们的服务不面向 13 岁以下的儿童。我们不会故意收集 13 岁以下儿童的个人信息。如果您是父母或监护人，并且认为您的孩子向我们提供了个人信息，请联系我们，我们将采取措施删除此类信息。</p>
    <p>父母应监督儿童对 AI 聊天功能的使用，因为 AI 服务商可能有自己的年龄限制和政策。</p>

    <h2>8. 国际数据传输</h2>
    <p>当您使用 AI 聊天时，您的消息将直接发送到 AI 服务商的服务器，这些服务器可能位于不同的国家/地区。使用 AI 聊天即表示您同意此数据传输。请查看每个 AI 服务商的隐私政策，以了解它们如何处理国际数据传输。</p>

    <h2>9. 对本政策的更改</h2>
    <p>我们可能会不时更新本隐私政策，以反映我们的实践、服务的变化或出于法律和法规原因。我们将：</p>
    <ul>
      <li>在此页面上发布更新后的政策，并附带新的"最后更新"日期</li>
      <li>采取合理措施通知用户重大更改（例如通过网站上的通知）</li>
    </ul>
    <p>更改后继续使用 AI Tools 即表示接受更新后的政策。</p>

    <h2>10. 处理的法律依据（GDPR）</h2>
    <p>对于欧盟用户：</p>
    <ul>
      <li><strong>本地存储：</strong> 基于您使用工具时的同意</li>
      <li><strong>AI 聊天：</strong> 基于您发送消息时的明确指示</li>
      <li><strong>分析：</strong> 基于我们改进服务的合法利益</li>
      <li><strong>广告：</strong> 基于我们的合法利益以及在需要时的同意</li>
    </ul>
    <p>您可以随时通过清除浏览器数据或调整浏览器设置来撤回同意。</p>

    <h2>11. 加州隐私权（CCPA）</h2>
    <p>对于加州居民，请注意：</p>
    <ul>
      <li>我们不出售个人信息</li>
      <li>所有数据都存储在您设备本地，您拥有完全控制权</li>
      <li>您可以通过清除浏览器数据请求删除</li>
      <li>您可以通过 <a href="https://www.google.com/settings/ads" target="_blank">Google 广告设置</a> 选择退出数据销售（虽然我们不出售数据）</li>
    </ul>

    <h2>12. 联系我们</h2>
    <p>如果您对本隐私政策或我们的数据实践有疑问、疑虑或请求，请联系我们：</p>
    <ul>
      <li><strong>电子邮件：</strong> <a href="mailto:songjiuhua91@gmail.com">songjiuhua91@gmail.com</a></li>
      <li><strong>GitHub：</strong> 对于公开事项，请在我们的存储库上打开问题</li>
      <li><strong>回复时间：</strong> 我们通常在 2-3 个工作日内回复</li>
    </ul>
    <p>对于隐私相关咨询，请在电子邮件主题中包含"隐私"。</p>
  `,
}

const privacyEn: LegalPageContent = {
  title: 'Privacy Policy',
  html: `
    <p><strong>Last updated:</strong> ${date}</p>

    <h2>1. Introduction</h2>
    <p>AI Tools ("we", "our", or "us") is committed to protecting your privacy and personal data. This Privacy Policy explains how we collect, use, store, and protect your information when you use our online developer utilities. By using AI Tools, you agree to the terms of this policy.</p>
    <p><strong>Our Core Privacy Principle:</strong> We believe in privacy-first design. Unlike many online tools, AI Tools runs entirely in your browser. We do not have backend servers that collect or store your personal data, documents, or conversations. Your data stays on your device.</p>

    <h2>2. Information We Collect</h2>

    <h3>2.1 Data Stored Locally in Your Browser</h3>
    <p><strong>All user-generated content is stored locally on your device.</strong> This includes:</p>
    <ul>
      <li><strong>Markdown Documents:</strong> All text you write in the Markdown Editor is saved to your browser's localStorage</li>
      <li><strong>AI Chat History:</strong> Your conversation history with AI assistants is stored locally</li>
      <li><strong>User Settings & Preferences:</strong> API keys, model selections, UI preferences, and tool configurations</li>
      <li><strong>JSON Data:</strong> Any JSON text you process in the JSON Converter</li>
      <li><strong>Regex Patterns:</strong> Regular expressions you test and save</li>
      <li><strong>Text Processing:</strong> Any text you deduplicate or process in our tools</li>
    </ul>
    <p><em>We do not transmit, collect, or have access to any of this data. It never leaves your browser unless explicitly sent to an AI provider you've configured.</em></p>

    <h3>2.2 AI Chat Feature - Direct Communication with AI Providers</h3>
    <p>When you use the AI Chat feature, your messages are sent <strong>directly</strong> to the AI provider you configure (such as OpenAI, Anthropic, DeepSeek, or other compatible services). Here's how it works:</p>
    <ul>
      <li><strong>Your API Key:</strong> You provide your own API key, which is stored <strong>only in your browser's localStorage</strong>. We never see or store your API key on our servers.</li>
      <li><strong>Message Transmission:</strong> When you send a message, it is transmitted directly from your browser to the AI provider's API endpoint. We do not intercept, log, or store your conversations.</li>
      <li><strong>AI Provider Privacy:</strong> Your use of AI providers is governed by their respective privacy policies. Please review the privacy policy of each AI provider you use.</li>
      <li><strong>File Attachments:</strong> If you attach files to AI chat, the file content is read from your browser and included in your message to the AI provider. We do not store these files.</li>
    </ul>

    <h3>2.3 Automatically Collected Information</h3>
    <p>We may use third-party analytics services (such as Google Analytics) to understand how our tools are used. This helps us improve performance, fix bugs, and prioritize features. The information collected includes:</p>
    <ul>
      <li><strong>Anonymous Usage Statistics:</strong> Page views, which tools you use, and general usage patterns</li>
      <li><strong>Browser Information:</strong> Browser type, version, and operating system (for compatibility optimization)</li>
      <li><strong>Device Type:</strong> Whether you're on a desktop, tablet, or mobile device</li>
    </ul>
    <p><strong>We do not collect:</strong> Personally identifiable information, names, email addresses, or precise location data through analytics.</p>

    <h2>3. Cookies and Tracking Technologies</h2>

    <h3>3.1 Local Storage (First-Party)</h3>
    <p>We use browser localStorage and sessionStorage to:</p>
    <ul>
      <li>Save your documents and work-in-progress</li>
      <li>Store your settings and preferences</li>
      <li>Cache data for faster performance</li>
    </ul>
    <p>This data never leaves your browser and can be cleared at any time through your browser's settings.</p>

    <h3>3.2 Google AdSense Cookies (Third-Party)</h3>
    <p>We use Google AdSense to display advertisements. Google may use cookies to serve ads based on your prior visits to this website or other websites.</p>
    <ul>
      <li><strong>Purpose:</strong> To display relevant advertisements and measure ad performance</li>
      <li><strong>Data Collected by Google:</strong> Anonymous browsing history, interests, and demographic information (as determined by Google's advertising systems)</li>
      <li><strong>Your Choices:</strong> You can opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank">Google's Ads Settings</a> or the <a href="http://www.aboutads.info/choices/" target="_blank">Network Advertising Initiative opt-out page</a></li>
    </ul>
    <p><strong>Google's Privacy Policy:</strong> For detailed information on how Google uses data, see <a href="https://policies.google.com/privacy" target="_blank">https://policies.google.com/privacy</a></p>

    <h2>4. Third-Party Services and Links</h2>
    <p>AI Tools integrates with various third-party services. Each service has its own privacy practices:</p>

    <h3>4.1 Google AdSense</h3>
    <p>We display advertisements through Google's AdSense program. Google collects and uses data according to their privacy policy. AdSense may use cookies and web beacons to track visitor behavior and serve personalized ads.</p>

    <h3>4.2 AI Service Providers</h3>
    <p>When you use AI Chat, you connect directly to AI providers. Each provider has independent privacy policies:</p>
    <ul>
      <li><strong>OpenAI:</strong> <a href="https://openai.com/policies/privacy-policy" target="_blank">Privacy Policy</a></li>
      <li><strong>Anthropic:</strong> <a href="https://www.anthropic.com/privacy" target="_blank">Privacy Policy</a></li>
      <li><strong>DeepSeek:</strong> Refer to their official privacy documentation</li>
      <li><strong>Other Providers:</strong> Please review the privacy policy of any AI provider you configure</li>
    </ul>

    <h3>4.3 Open Source Libraries</h3>
    <p>Our application uses open-source libraries and frameworks (Vue.js, CodeMirror, Marked, etc.). These libraries run entirely in your browser. For information about their privacy practices, please refer to their respective documentation.</p>

    <h2>5. Data Security and Retention</h2>

    <h3>5.1 Data Storage Location</h3>
    <p><strong>All data is stored on your device.</strong> We do not have servers that collect or store your:</p>
    <ul>
      <li>Documents and files you create</li>
      <li>Chat conversations and AI interactions</li>
      <li>Settings and preferences</li>
      <li>API keys or credentials</li>
    </ul>

    <h3>5.2 Your Responsibilities</h3>
    <p>Since data is stored locally, you are responsible for:</p>
    <ul>
      <li><strong>Regular Backups:</strong> Important documents should be backed up regularly. Clearing browser data will delete all stored information.</li>
      <li><strong>Device Security:</strong> Ensure your device is secured with a password and kept updated to protect your locally stored data.</li>
      <li><strong>API Key Security:</strong> Never share your API keys. If you use a public computer, clear your browser data after use.</li>
    </ul>

    <h3>5.3 Data Retention Period</h3>
    <p>Data remains in your browser's localStorage until you:</p>
    <ul>
      <li>Manually delete it through our tools</li>
      <li>Clear your browser data/cache</li>
      <li>Uninstall or reset your browser</li>
    </ul>
    <p>We have no control over locally stored data and cannot recover it once deleted.</p>

    <h2>6. Your Privacy Rights and Choices</h2>

    <h3>6.1 Access and Control</h3>
    <p>You have full control over your data because it's stored locally:</p>
    <ul>
      <li><strong>View:</strong> You can view all stored data at any time through our tools</li>
      <li><strong>Delete:</strong> You can delete any document, conversation, or stored data</li>
      <li><strong>Export:</strong> You can copy or export your documents at any time</li>
      <li><strong>Clear All:</strong> Clear your browser data to remove everything</li>
    </ul>

    <h3>6.2 Ad Personalization Controls</h3>
    <p>You can control ad personalization through:</p>
    <ul>
      <li><a href="https://www.google.com/settings/ads" target="_blank">Google Ads Settings</a></li>
      <li>Browser extensions that block advertising cookies</li>
      <li>Your browser's privacy and cookie settings</li>
    </ul>

    <h2>7. Children's Privacy</h2>
    <p>Our service is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us, and we will take steps to remove such information.</p>
    <p>Parents should monitor children's use of AI Chat features, as AI providers may have their own age restrictions and policies.</p>

    <h2>8. International Data Transfers</h2>
    <p>When you use AI Chat, your messages are sent directly to AI providers' servers, which may be located in different countries. By using AI Chat, you consent to this data transfer. Please review each AI provider's privacy policy to understand how they handle international data transfers.</p>

    <h2>9. Changes to This Privacy Policy</h2>
    <p>We may update this Privacy Policy from time to time to reflect changes in our practices, services, or for legal and regulatory reasons. We will:</p>
    <ul>
      <li>Post the updated policy on this page with a new "Last updated" date</li>
      <li>Take reasonable measures to notify users of significant changes (such as through a notice on our website)</li>
    </ul>
    <p>Continued use of AI Tools after changes constitutes acceptance of the updated policy.</p>

    <h2>10. Legal Basis for Processing (GDPR)</h2>
    <p>For users in the European Union:</p>
    <ul>
      <li><strong>Local Storage:</strong> Based on your consent when you use our tools</li>
      <li><strong>AI Chat:</strong> Based on your explicit instruction when you send messages</li>
      <li><strong>Analytics:</strong> Based on our legitimate interest to improve our services</li>
      <li><strong>Advertising:</strong> Based on our legitimate interest and consent where required</li>
    </ul>
    <p>You have the right to withdraw consent at any time by clearing your browser data or adjusting your browser settings.</p>

    <h2>11. California Privacy Rights (CCPA)</h2>
    <p>For California residents, please note:</p>
    <ul>
      <li>We do not sell personal information</li>
      <li>All data is stored locally on your device, giving you complete control</li>
      <li>You can request deletion by clearing your browser data</li>
      <li>You can opt out of data sale (though we don't sell data) through <a href="https://www.google.com/settings/ads" target="_blank">Google's Ad Settings</a></li>
    </ul>

    <h2>12. Contact Us</h2>
    <p>If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:</p>
    <ul>
      <li><strong>Email:</strong> <a href="mailto:songjiuhua91@gmail.com">songjiuhua91@gmail.com</a></li>
      <li><strong>GitHub:</strong> Open an issue on our repository for public matters</li>
      <li><strong>Response Time:</strong> We typically respond within 2-3 business days</li>
    </ul>
    <p>For privacy-related inquiries, please include "Privacy" in your email subject line.</p>
  `,
}

// ── Terms of Service ──

const termsZh: LegalPageContent = {
  title: '服务条款',
  html: `
    <p><strong>最后更新：</strong>${dateZh}</p>

    <h2>1. 接受条款</h2>
    <p>访问或使用 AI Tools（"服务"）即表示您受本服务条款（"条款"）的约束。如果您不同意这些条款，请不要使用本服务。这些条款构成您与 AI Tools 之间的法律约束协议。</p>
    <p><strong>AI Tools</strong> 是一组免费的开源在线工具，旨在帮助开发人员、内容创作者和技术爱好者更高效地工作。服务包括 Markdown 编辑器、JSON 转换器、正则表达式测试器、去重工具和 AI 助手等工具。</p>

    <h2>2. 服务描述</h2>
    <p>AI Tools 提供以下在线工具，这些工具完全在您的 Web 浏览器中运行：</p>
    <ul>
      <li><strong>Markdown 编辑器：</strong> 用于编写和预览 markdown 文档的工具，支持语法高亮和自动保存</li>
      <li><strong>JSON 转换器：</strong> 用于格式化、验证和将 JSON 数据转换为其他格式的工具</li>
      <li><strong>正则表达式测试器：</strong> 用于通过可视化反馈测试和调试正则表达式的工具</li>
      <li><strong>去重工具：</strong> 用于从文本列表中删除重复行的工具</li>
      <li><strong>AI 助手：</strong> 用于连接到 AI 服务商（OpenAI、Anthropic、DeepSeek）以获取对话式 AI 帮助的界面</li>
    </ul>
    <p><strong>重要说明：</strong> 服务免费提供。所有数据都在浏览器中本地存储。我们不会收集、存储或将您的数据传输到我们的服务器（AI 助手除外，它直接连接到您配置的 AI 服务商）。</p>

    <h2>3. 使用规范</h2>
    <p>使用 AI Tools 即表示您同意负责任且合法地使用服务。您同意不：</p>
    <ul>
      <li>将服务用于任何非法或未经授权的目的</li>
      <li>试图未经授权访问服务或其相关系统的任何部分</li>
      <li>使用服务分发恶意软件、病毒或有害代码</li>
      <li>反向工程、反编译或试图提取服务的源代码（尽管它是开源的且可在 GitHub 上获取）</li>
      <li>使用服务骚扰、虐待或伤害他人</li>
      <li>违反任何适用的地方、州、国家或国际法律</li>
      <li>未经许可使用自动化系统访问服务</li>
      <li>干扰或破坏服务或连接到服务的服务器</li>
    </ul>

    <h2>4. 用户责任</h2>

    <h3>4.1 您的内容</h3>
    <p>您对使用服务创建、处理或存储的任何内容、数据或材料承担全部责任。这包括：</p>
    <ul>
      <li>确保您有权输入服务中使用的任何内容</li>
      <li>维护重要文档的备份（存储在浏览器 localStorage 中）</li>
      <li>保护 AI 服务商的 API 密钥和凭据</li>
      <li>在使用服务时遵守所有适用的法律</li>
    </ul>

    <h3>4.2 AI 生成的内容</h3>
    <p>使用 AI 助手功能时：</p>
    <ul>
      <li>AI 回复由第三方 AI 服务商（OpenAI、Anthropic、DeepSeek 等）生成</li>
      <li>我们不控制、不认可也不保证 AI 生成内容的准确性、完整性或可靠性</li>
      <li>请务必核实重要信息，尤其是医疗、法律、财务或关键决策</li>
      <li>您对如何使用 AI 生成的内容负责</li>
      <li>您对 AI 服务商的使用受其各自服务条款的约束</li>
    </ul>

    <h3>4.3 API 密钥和凭据</h3>
    <p>使用需要 API 密钥的 AI 功能时：</p>
    <ul>
      <li>您必须提供自己来自 AI 服务商的有效 API 密钥</li>
      <li>API 密钥仅存储在您浏览器的 localStorage 中</li>
      <li>切勿与他人共享您的 API 密钥</li>
      <li>您对通过使用 AI 服务商 API 产生的所有费用负责</li>
      <li>我们不对未经授权使用您的 API 密钥承担责任</li>
    </ul>

    <h2>5. 知识产权</h2>

    <h3>5.1 您的内容</h3>
    <p>您保留使用服务创建的任何内容的完全所有权和权利。这包括文档、代码和您生成的其他材料。</p>

    <h3>5.2 AI Tools 内容</h3>
    <p>服务的源代码、设计和品牌归 AI Tools 所有，并根据开源许可（可在我们的 GitHub 存储库中获取）获得许可。您可以：</p>
    <ul>
      <li>查看、研究和修改源代码</li>
      <li>将代码用于个人或商业项目（受适用开源许可约束）</li>
      <li>分叉存储库并创建衍生作品</li>
    </ul>

    <h3>5.3 第三方库</h3>
    <p>服务使用开源库和框架，这些库和框架根据各自条款获得许可。这些包括 Vue.js、CodeMirror、Marked 和其他优秀的开源项目。每个库的许可适用于其各自的代码。</p>

    <h3>5.4 AI 服务商内容</h3>
    <p>AI 服务商生成的内容受 AI 服务商服务条款的约束。查看每个服务商的条款以了解使用权利和限制。</p>

    <h2>6. 隐私和数据保护</h2>
    <p>您对服务的使用也受我们的隐私政策约束，该政策解释了我们如何处理数据。要点：</p>
    <ul>
      <li>所有数据都在浏览器中本地存储（文档、设置、聊天记录）</li>
      <li>我们不会在服务器上收集或存储您的个人数据</li>
      <li>AI 消息直接发送到您配置的 AI 服务商</li>
      <li>我们可能使用 Google AdSense 做广告，它使用 Cookie</li>
    </ul>
    <p>请阅读我们的完整<a href="#/page/privacy">隐私政策</a>了解详情。</p>

    <h2>7. 免责声明和担保</h2>

    <h3>7.1"按原样"服务</h3>
    <p>服务按"原样"和"可用"基础提供，不提供任何形式的明示或暗示担保，包括但不限于：</p>
    <ul>
      <li>适销性和适用于特定用途的暗示担保</li>
      <li>不侵犯第三方权利</li>
      <li>服务的准确性、可靠性或可用性</li>
      <li>没有病毒或其他有害成分</li>
    </ul>

    <h3>7.2 数据丢失</h3>
    <p>由于数据存储在浏览器中，清除浏览器数据将删除所有存储的信息。我们不对数据丢失承担责任。定期备份重要文档。</p>

    <h3>7.3 AI 准确性</h3>
    <p>我们不保证 AI 生成的内容准确、完整或适当。在依赖 AI 生成信息之前，请务必核实。</p>

    <h2>8. 责任限制</h2>
    <p>在适用法律允许的最大范围内，AI Tools 不对以下情况承担责任：</p>
    <ul>
      <li>任何间接、偶然、特殊、后果性或惩罚性损害</li>
      <li>数据丢失、内容损坏或浏览器 localStorage 问题</li>
      <li>未经授权使用您的 API 密钥或凭据</li>
      <li>AI 生成内容或 AI 服务商服务造成的损害</li>
      <li>服务中断或错误造成的损害</li>
    </ul>
    <p>在任何情况下，AI Tools 的总责任都不超过您为使用服务支付的金额（如果有）。由于服务是免费的，这意味着我们的责任仅限于法律要求的范围。</p>

    <h2>9. 终止</h2>
    <p>我们可随时自行决定暂停或终止您访问服务的权利，无需事先通知且无需理由。您也可以随时停止使用服务。</p>
    <p>终止后（或当您清除浏览器数据时），所有本地存储的数据（文档、设置、聊天记录）将被永久删除且无法恢复。</p>

    <h2>10. 条款变更</h2>
    <p>我们保留随时修改这些条款的权利。变更将在此页面上发布，并附上更新的"最后更新"日期。更改后继续使用服务即表示接受新条款。</p>
    <p>我们鼓励您定期查看这些条款以了解更新。</p>

    <h2>11. 适用法律</h2>
    <p>这些条款受适用法律约束并据其解释。这些条款引起的任何争议应受相关司法管辖区法院的专属管辖。</p>

    <h2>12. 一般规定</h2>

    <h3>12.1 完整协议</h3>
    <p>这些条款构成您与 AI Tools 关于服务的完整协议，并取代任何先前的协议。</p>

    <h3>12.2 可分割性</h3>
    <p>如果这些条款的任何条款被发现无效或不可执行，其余条款将继续完全有效。</p>

    <h3>12.3 弃权</h3>
    <p>未能执行这些条款的任何条款不构成对该条款的放弃。</p>

    <h3>12.4 无第三方受益人</h3>
    <p>这些条款不授予任何第三方任何权利。</p>

    <h2>13. 联系我们</h2>
    <p>如果您对这些条款有疑问，请联系我们：</p>
    <ul>
      <li><strong>电子邮件：</strong> <a href="mailto:songjiuhua91@gmail.com">songjiuhua91@gmail.com</a></li>
      <li><strong>GitHub：</strong> 对于公开事项，请在我们的存储库上打开问题</li>
    </ul>
    <p>对于法律咨询，请在电子邮件主题中包含"法律"。</p>

    <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e5e5;">

    <p style="font-size: 13px; color: #6b7280;"><em>感谢您使用 AI Tools。使用本服务即表示您同意这些服务条款和我们的隐私政策。</em></p>
  `,
}

const termsEn: LegalPageContent = {
  title: 'Terms of Service',
  html: `
    <p><strong>Last updated:</strong> ${date}</p>

    <h2>1. Acceptance of Terms</h2>
    <p>By accessing or using AI Tools ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Service. These Terms constitute a legally binding agreement between you and AI Tools.</p>
    <p><strong>AI Tools</strong> is a collection of free, open-source online utilities designed to help developers, content creators, and technology enthusiasts work more efficiently. The Service includes tools such as the Markdown Editor, JSON Converter, Regex Tester, Deduplicator, and AI Assistant.</p>

    <h2>2. Description of Service</h2>
    <p>AI Tools provides the following online utilities, which run entirely in your web browser:</p>
    <ul>
      <li><strong>Markdown Editor:</strong> A tool for writing and previewing markdown documents with syntax highlighting and auto-save</li>
      <li><strong>JSON Converter:</strong> A utility for formatting, validating, and converting JSON data to other formats</li>
      <li><strong>Regex Tester:</strong> A tool for testing and debugging regular expressions with visual feedback</li>
      <li><strong>Deduplicator:</strong> A utility for removing duplicate lines from text lists</li>
      <li><strong>AI Assistant:</strong> An interface for connecting to AI providers (OpenAI, Anthropic, DeepSeek) for conversational AI assistance</li>
    </ul>
    <p><strong>Important:</strong> The Service is provided free of charge. All data is stored locally in your browser. We do not collect, store, or transmit your data to our servers (except for AI Assistant, which connects directly to AI providers you configure).</p>

    <h2>3. Acceptable Use</h2>
    <p>By using AI Tools, you agree to use the Service responsibly and lawfully. You agree NOT to:</p>
    <ul>
      <li>Use the Service for any illegal or unauthorized purpose</li>
      <li>Attempt to gain unauthorized access to any part of the Service or its related systems</li>
      <li>Use the Service to distribute malware, viruses, or harmful code</li>
      <li>Reverse engineer, decompile, or attempt to extract source code from the Service (though it is open source and available on GitHub)</li>
      <li>Use the Service to harass, abuse, or harm others</li>
      <li>Violate any applicable local, state, national, or international law</li>
      <li>Use automated systems to access the Service without permission</li>
      <li>Interfere with or disrupt the Service or servers connected to the Service</li>
    </ul>

    <h2>4. User Responsibilities</h2>

    <h3>4.1 Your Content</h3>
    <p>You are solely responsible for any content, data, or materials you create, process, or store using the Service. This includes:</p>
    <ul>
      <li>Ensuring you have the right to use any content you input into the Service</li>
      <li>Maintaining backups of important documents (stored in browser localStorage)</li>
      <li>Protecting your API keys and credentials for AI providers</li>
      <li>Complying with all applicable laws when using the Service</li>
    </ul>

    <h3>4.2 AI-Generated Content</h3>
    <p>When using the AI Assistant feature:</p>
    <ul>
      <li>AI responses are generated by third-party AI providers (OpenAI, Anthropic, DeepSeek, etc.)</li>
      <li>We do not control, endorse, or guarantee the accuracy, completeness, or reliability of AI-generated content</li>
      <li>Always verify important information, especially for medical, legal, financial, or critical decisions</li>
      <li>You are responsible for how you use AI-generated content</li>
      <li>Your use of AI providers is governed by their respective terms of service</li>
    </ul>

    <h3>4.3 API Keys and Credentials</h3>
    <p>When using AI features that require API keys:</p>
    <ul>
      <li>You must provide your own valid API key from the AI provider</li>
      <li>API keys are stored only in your browser's localStorage</li>
      <li>Never share your API keys with others</li>
      <li>You are responsible for all charges incurred through your use of AI provider APIs</li>
      <li>We are not responsible for unauthorized use of your API keys</li>
    </ul>

    <h2>5. Intellectual Property</h2>

    <h3>5.1 Your Content</h3>
    <p>You retain full ownership and rights to any content you create using the Service. This includes documents, code, and other materials you generate.</p>

    <h3>5.2 AI Tools Content</h3>
    <p>The Service's source code, design, and branding are owned by AI Tools and are licensed under open source licenses (available on our GitHub repository). You may:</p>
    <ul>
      <li>View, study, and modify the source code</li>
      <li>Use the code for personal or commercial projects (subject to the applicable open source license)</li>
      <li>Fork the repository and create derivative works</li>
    </ul>

    <h3>5.3 Third-Party Libraries</h3>
    <p>The Service uses open-source libraries and frameworks, which are licensed under their respective terms. These include Vue.js, CodeMirror, Marked, and other excellent open-source projects. Each library's license applies to its respective code.</p>

    <h3>5.4 AI Provider Content</h3>
    <p>Content generated by AI providers is subject to the AI provider's terms of service. Review each provider's terms to understand usage rights and restrictions.</p>

    <h2>6. Privacy and Data Protection</h2>
    <p>Your use of the Service is also governed by our Privacy Policy, which explains how we handle data. Key points:</p>
    <ul>
      <li>All data is stored locally in your browser (documents, settings, chat history)</li>
      <li>We do not collect or store your personal data on our servers</li>
      <li>AI messages are sent directly to AI providers you configure</li>
      <li>We may use Google AdSense for advertising, which uses cookies</li>
    </ul>
    <p>Please read our complete <a href="#/page/privacy">Privacy Policy</a> for details.</p>

    <h2>7. Disclaimers and Warranties</h2>

    <h3>7.1 "As Is" Service</h3>
    <p>The Service is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, either express or implied, including but not limited to:</p>
    <ul>
      <li>Merchantability and fitness for a particular purpose</li>
      <li>Non-infringement of third-party rights</li>
      <li>Accuracy, reliability, or availability of the Service</li>
      <li>Freedom from viruses or other harmful components</li>
    </ul>

    <h3>7.2 Data Loss</h3>
    <p>Since data is stored in your browser, clearing browser data will delete all stored information. We are not responsible for data loss. Regularly back up important documents.</p>

    <h3>7.3 AI Accuracy</h3>
    <p>We do not guarantee that AI-generated content is accurate, complete, or appropriate. Always verify AI-generated information before relying on it.</p>

    <h2>8. Limitation of Liability</h2>
    <p>To the maximum extent permitted by applicable law, AI Tools shall not be liable for:</p>
    <ul>
      <li>Any indirect, incidental, special, consequential, or punitive damages</li>
      <li>Data loss, content corruption, or browser localStorage issues</li>
      <li>Unauthorized use of your API keys or credentials</li>
      <li>Damages from AI-generated content or AI provider services</li>
      <li>Damages from service interruptions or bugs</li>
    </ul>
    <p>In no event shall AI Tools' total liability exceed the amount you paid (if any) to use the Service. Since the Service is free, this means our liability is limited to the extent required by law.</p>

    <h2>9. Termination</h2>
    <p>We may suspend or terminate your access to the Service at any time, with or without cause, without prior notice. You may also stop using the Service at any time.</p>
    <p>Upon termination (or when you clear your browser data), all your locally stored data (documents, settings, chat history) will be permanently deleted and unrecoverable.</p>

    <h2>10. Changes to Terms</h2>
    <p>We reserve the right to modify these Terms at any time. Changes will be posted on this page with an updated "Last updated" date. Continued use of the Service after changes constitutes acceptance of the new Terms.</p>
    <p>We encourage you to periodically review these Terms to stay informed of any updates.</p>

    <h2>11. Governing Law</h2>
    <p>These Terms are governed by and construed in accordance with applicable laws. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of courts in the relevant jurisdiction.</p>

    <h2>12. General Provisions</h2>

    <h3>12.1 Entire Agreement</h3>
    <p>These Terms constitute the entire agreement between you and AI Tools regarding the Service and supersede any prior agreements.</p>

    <h3>12.2 Severability</h3>
    <p>If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions will continue in full force and effect.</p>

    <h3>12.3 Waiver</h3>
    <p>Failure to enforce any provision of these Terms does not constitute a waiver of such provision.</p>

    <h3>12.4 No Third-Party Beneficiaries</h3>
    <p>These Terms do not grant any rights to any third party.</p>

    <h2>13. Contact Us</h2>
    <p>If you have questions about these Terms, please contact us:</p>
    <ul>
      <li><strong>Email:</strong> <a href="mailto:songjiuhua91@gmail.com">songjiuhua91@gmail.com</a></li>
      <li><strong>GitHub:</strong> Open an issue on our repository for public matters</li>
    </ul>
    <p>For legal inquiries, please include "Legal" in your email subject line.</p>

    <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e5e5;">

    <p style="font-size: 13px; color: #6b7280;"><em>Thank you for using AI Tools. By using this Service, you agree to these Terms of Service and our Privacy Policy.</em></p>
  `,
}

// ── About ──

const aboutZh: LegalPageContent = {
  title: '关于 AI Tools',
  html: `
    <h2>什么是 AI Tools？</h2>
    <p>AI Tools 是一个免费、开源的在线工具集合，专为开发人员、内容创作者、学生和技术爱好者设计。我们的使命是提供尊重您的隐私并提高您生产力的专业级工具。</p>

    <h3>我们的核心理念</h3>
    <p><strong>隐私优先设计：</strong> 与大多数在线工具不同，AI Tools 完全在您的浏览器中运行。我们没有收集或存储您的数据、文档或对话的后端服务器。您的文档、对话和设置保留在您的设备上，让您拥有完全的控制权和安心。</p>

    <p><strong>开放透明：</strong> 我们的代码是开源的。您可以检查它、为它做贡献，甚至在本地运行它。我们相信通过透明度赢得信任的工具。</p>

    <p><strong>人人可用：</strong> 无论您是经验丰富的开发人员、学习编程的学生，还是内容创作者，我们的工具都设计得直观且强大。无需安装 — 只需打开浏览器即可开始创作。</p>

    <h2>我们的工具</h2>

    <h3>📝 Markdown 编辑器</h3>
    <p>一个强大的无干扰写作环境，用于创建带有实时预览和语法高亮的 markdown 文档。非常适合文档编写、README 文件、博客文章和技术写作。</p>
    <p><strong>主要功能：</strong></p>
    <ul>
      <li><strong>实时预览：</strong> 在您键入时实时查看格式化的 markdown</li>
      <li><strong>语法高亮：</strong> 代码块精美高亮，支持多种语言</li>
      <li><strong>自动保存：</strong> 永不丢失工作 — 文档自动保存到浏览器</li>
      <li><strong>工具栏：</strong> 快速访问格式选项（粗体、斜体、链接、图片、代码块等）</li>
      <li><strong>统计信息：</strong> 查看字数、字符数和阅读时间</li>
      <li><strong>导出选项：</strong> 将 markdown 或 HTML 复制到剪贴板</li>
    </ul>
    <p><strong>使用场景：</strong> 编写技术文档、为 GitHub 项目创建 README 文件、起草博客文章、记笔记或任何基于 markdown 的写作任务。</p>

    <h3>🔄 JSON 转换器</h3>
    <p>一个多功能 JSON 处理工具，帮助您轻松格式化、验证、转换和操作 JSON 数据。对于 API 开发人员、数据工程师和任何使用 JSON 的人来说必不可少。</p>
    <p><strong>主要功能：</strong></p>
    <ul>
      <li><strong>格式化和美化：</strong> 将压缩的 JSON 转换为可读、缩进的输出</li>
      <li><strong>压缩：</strong> 压缩 JSON 以减小生产环境中的文件大小</li>
      <li><strong>验证：</strong> 立即检测语法错误并获得清晰的错误消息</li>
      <li><strong>格式转换：</strong> 将 JSON 转换为 YAML、XML、CSV、TypeScript 接口、Java 类和 Go 结构</li>
      <li><strong>JSON Schema 生成：</strong> 从 JSON 数据自动生成 JSON Schema</li>
      <li><strong>JSONPath 查询：</strong> 使用 JSONPath 表达式提取特定值</li>
    </ul>
    <p><strong>使用场景：</strong> 调试 API 响应、转换配置文件、从 API 数据生成 TypeScript 接口、清理 JSON 或学习 JSON 结构。</p>

    <h3>🎯 正则表达式测试器</h3>
    <p>一个高级正则表达式测试工具，具有实时匹配、捕获组和可视化铁路图。非常适合需要制作、测试和调试复杂正则模式的开发人员。</p>
    <p><strong>主要功能：</strong></p>
    <ul>
      <li><strong>实时匹配：</strong> 在您键入时即时看到高亮显示的匹配</li>
      <li><strong>捕获组：</strong> 详细查看和分析捕获组</li>
      <li><strong>铁路图：</strong> 正则结构的可视化表示</li>
      <li><strong>常见模式：</strong> 快速插入电子邮件、URL、日期、IP 地址和其他模式</li>
      <li><strong>匹配信息：</strong> 查看匹配位置、组详细信息和拆分结果</li>
      <li><strong>正则测试：</strong> 针对多个字符串进行测试以确保您的模式正常工作</li>
    </ul>
    <p><strong>使用场景：</strong> 创建验证模式、解析文本数据、使用复杂规则替换文本、学习正则或调试正则模式。</p>

    <h3>🧹 去重工具</h3>
    <p>一个简单而强大的工具，用于从文本列表中删除重复行。非常适合清理数据文件、删除重复条目和组织列表。</p>
    <p><strong>主要功能：</strong></p>
    <ul>
      <li><strong>删除重复项：</strong> 即时对任何文本行进行去重</li>
      <li><strong>大小写敏感：</strong> 选项可将大写和小写视为相同</li>
      <li><strong>修剪空白：</strong> 在比较之前删除前导/尾随空格</li>
      <li><strong>排序输出：</strong> 可选择对去重结果进行排序</li>
      <li><strong>复制结果：</strong> 一键复制到剪贴板</li>
    </ul>
    <p><strong>使用场景：</strong> 清理电子邮件列表、删除重复 URL、组织关键词列表、对配置文件进行去重或任何文本列表清理任务。</p>

    <h3>🤖 AI 助手</h3>
    <p>一个对话式 AI 界面，连接到领先的 AI 服务商（OpenAI、Anthropic、DeepSeek）以帮助您进行编码、写作、分析等。您的个人 AI 助手完全在您的浏览器中运行。</p>
    <p><strong>主要功能：</strong></p>
    <ul>
      <li><strong>多个 AI 服务商：</strong> 连接到 OpenAI（GPT-4、GPT-3.5）、Anthropic（Claude）、DeepSeek 和其他兼容 API</li>
      <li><strong>自带密钥：</strong> 使用您自己的 API 密钥 — 我们不收取任何费用也不会在我们的服务器上存储您的密钥</li>
      <li><strong>对话记录：</strong> 所有对话都保存在浏览器中</li>
      <li><strong>文件附件：</strong> 上传代码文件、文档或文本文件以供 AI 分析</li>
      <li><strong>Markdown 渲染：</strong> AI 响应用 markdown 格式精美呈现</li>
      <li><strong>多个对话：</strong> 将聊天组织成单独的对话</li>
      <li><strong>复制和导出：</strong> 轻松复制 AI 响应或导出整个对话</li>
    </ul>
    <p><strong>使用场景：</strong> 获取编码帮助、调试代码、解释技术概念、编写文档、生成代码片段、分析数据、学习编程语言或头脑风暴想法。</p>

    <h2>为什么选择 AI Tools？</h2>

    <h3>🔒 隐私和安全</h3>
    <p>您的数据永远不会离开您的浏览器。无需账户。无需跟踪。无隐藏的数据收集。只是纯粹的功能工具，尊重您的隐私。</p>

    <h3>⚡ 快速可靠</h3>
    <p>一切都在您的浏览器中本地运行。无服务器延迟。无停机时间。离线工作。即时响应时间。</p>

    <h3>🎨 美观界面</h3>
    <p>简洁的现代设计，直观的控件。深色模式支持。响应式布局适用于桌面、平板和移动设备。</p>

    <h3>📖 无学习曲线</h3>
    <p>工具设计直观。无需复杂设置。无需配置。立即开始使用。</p>

    <h2>技术栈</h2>
    <p>我们使用现代 Web 技术来提供快速、可靠和美观的体验：</p>
    <ul>
      <li><strong>Vue 3 + TypeScript：</strong> 现代响应式框架，具有类型安全性</li>
      <li><strong>Vite：</strong> 超快的构建工具，可即时开发反馈</li>
      <li><strong>Vue Router：</strong> 工具之间的平滑导航</li>
      <li><strong>CodeMirror 6：</strong> 带有语法高亮的专业代码编辑器</li>
      <li><strong>Marked：</strong> 快速 Markdown 解析器和渲染器</li>
      <li><strong>DOMPurify：</strong> XSS 保护，实现安全的 HTML 渲染</li>
      <li><strong>Highlight.js：</strong> 代码块的语法高亮</li>
      <li><strong>Regulex & RegExp-Tree：</strong> 正则表达式可视化和解析</li>
      <li><strong>Mermaid：</strong> 用于未来可视化功能的图表生成</li>
    </ul>

    <h2>开源和社区</h2>
    <p>AI Tools 是开源软件。我们相信社区驱动的开发的力量。</p>
    <p><strong>贡献：</strong> 发现了错误？有功能想法？想要改进文档？我们欢迎贡献！请在我们的 GitHub 存储库上打开问题或拉取请求。</p>
    <p><strong>支持我们：</strong> 如果您觉得 AI Tools 有用，请在 GitHub 上为我们的存储库加星。它帮助其他人发现该项目并激励我们继续改进。</p>
    <p><strong>传播：</strong> 向您的同事、朋友和社区分享 AI Tools。每个用户都帮助我们改进和成长。</p>

    <h2>未来路线图</h2>
    <p>我们一直在努力改进和新工具。这是即将推出的内容：</p>
    <ul>
      <li><strong>新工具：</strong> 图像转换器、CSS 生成器、颜色选择器、Cron 表达式编辑器等</li>
      <li><strong>增强功能：</strong> 云同步（可选）、协作编辑、移动应用</li>
      <li><strong>性能：</strong> 更快的加载、更好的优化、减少包大小</li>
      <li><strong>可访问性：</strong> 键盘快捷键、屏幕阅读器支持、高对比度模式</li>
    </ul>
    <p>有建议吗？我们很乐意听到。让我们知道哪些工具或功能对您最有用。</p>

    <h2>致谢</h2>
    <p>AI Tools 建立在巨人的肩膀上。我们感谢：</p>
    <ul>
      <li>开源社区创建了出色的库和框架</li>
      <li>AI 服务商（OpenAI、Anthropic、DeepSeek）提供强大的 API</li>
      <li>我们的用户提供的反馈、建议和支持</li>
      <li>帮助改进项目的贡献者</li>
    </ul>

    <h2>联系我们</h2>
    <p>有问题、反馈或想联系吗？我们很乐意听到您的声音！查看我们的<a href="#/page/contact">联系方式页面</a>了解所有联系我们的方式。</p>
  `,
}

const aboutEn: LegalPageContent = {
  title: 'About AI Tools',
  html: `
    <h2>What is AI Tools?</h2>
    <p>AI Tools is a free, open-source collection of powerful online utilities designed for developers, content creators, students, and technology enthusiasts. Our mission is to provide professional-grade tools that respect your privacy and boost your productivity.</p>

    <h3>Our Core Philosophy</h3>
    <p><strong>Privacy-First Design:</strong> Unlike most online tools, AI Tools runs entirely in your browser. We don't have backend servers that collect or store your data. Your documents, conversations, and settings stay on your device, giving you complete control and peace of mind.</p>

    <p><strong>Open & Transparent:</strong> Our code is open source. You can inspect it, contribute to it, and even run it locally. We believe in building tools that earn trust through transparency.</p>

    <p><strong>Accessible to All:</strong> Whether you're a seasoned developer, a student learning to code, or a content creator, our tools are designed to be intuitive and powerful. No installation required — just open your browser and start creating.</p>

    <h2>Our Tools</h2>

    <h3>📝 Markdown Editor</h3>
    <p>A powerful, distraction-free writing environment for creating markdown documents with live preview and syntax highlighting. Perfect for documentation, README files, blog posts, and technical writing.</p>
    <p><strong>Key Features:</strong></p>
    <ul>
      <li><strong>Live Preview:</strong> See your formatted markdown in real-time as you type</li>
      <li><strong>Syntax Highlighting:</strong> Code blocks are beautifully highlighted with support for multiple languages</li>
      <li><strong>Auto-Save:</strong> Never lose your work — documents are automatically saved to your browser</li>
      <li><strong>Toolbar:</strong> Quick access to formatting options (bold, italic, links, images, code blocks, and more)</li>
      <li><strong>Statistics:</strong> View word count, character count, and reading time</li>
      <li><strong>Export Options:</strong> Copy markdown or HTML to clipboard</li>
    </ul>
    <p><strong>Use Cases:</strong> Writing technical documentation, creating README files for GitHub projects, drafting blog posts, taking notes, or any markdown-based writing task.</p>

    <h3>🔄 JSON Converter</h3>
    <p>A versatile JSON processing tool that helps you format, validate, convert, and manipulate JSON data with ease. Essential for API developers, data engineers, and anyone working with JSON.</p>
    <p><strong>Key Features:</strong></p>
    <ul>
      <li><strong>Format & Beautify:</strong> Transform minified JSON into readable, indented output</li>
      <li><strong>Minify:</strong> Compress JSON to reduce file size for production use</li>
      <li><strong>Validate:</strong> Instantly detect syntax errors and get clear error messages</li>
      <li><strong>Format Conversion:</strong> Convert JSON to YAML, XML, CSV, TypeScript interfaces, Java classes, and Go structs</li>
      <li><strong>JSON Schema Generation:</strong> Automatically generate JSON Schema from your JSON data</li>
      <li><strong>JSONPath Query:</strong> Extract specific values using JSONPath expressions</li>
    </ul>
    <p><strong>Use Cases:</strong> Debugging API responses, converting configuration files, generating TypeScript interfaces from API data, cleaning up JSON, or learning JSON structure.</p>

    <h3>🎯 Regex Tester</h3>
    <p>An advanced regular expression testing tool with real-time matching, capture groups, and visual railroad diagrams. Ideal for developers who need to craft, test, and debug complex regex patterns.</p>
    <p><strong>Key Features:</strong></p>
    <ul>
      <li><strong>Real-Time Matching:</strong> See matches highlighted instantly as you type</li>
      <li><strong>Capture Groups:</strong> View and analyze capture groups in detail</li>
      <li><strong>Railroad Diagrams:</strong> Visual representation of your regex structure</li>
      <li><strong>Common Patterns:</strong> Quick insert for email, URL, date, IP address, and other patterns</li>
      <li><strong>Match Information:</strong> View match positions, group details, and split results</li>
      <li><strong>Regex Testing:</strong> Test against multiple strings to ensure your pattern works correctly</li>
    </ul>
    <p><strong>Use Cases:</strong> Creating validation patterns, parsing text data, replacing text with complex rules, learning regex, or debugging regex patterns.</p>

    <h3>🧹 Deduplicator</h3>
    <p>A simple yet powerful tool for removing duplicate lines from text lists. Perfect for cleaning up data files, removing duplicate entries, and organizing lists.</p>
    <p><strong>Key Features:</strong></p>
    <ul>
      <li><strong>Remove Duplicates:</strong> Instantly deduplicate any list of text lines</li>
      <li><strong>Case Sensitivity:</strong> Option to treat uppercase and lowercase as the same</li>
      <li><strong>Trim Whitespace:</strong> Remove leading/trailing spaces before comparing</li>
      <li><strong>Sort Output:</strong> Optionally sort the deduplicated results</li>
      <li><strong>Copy Results:</strong> One-click copy to clipboard</li>
    </ul>
    <p><strong>Use Cases:</strong> Cleaning up email lists, removing duplicate URLs, organizing keywords lists, deduplicating configuration files, or any text list cleanup task.</p>

    <h3>🤖 AI Assistant</h3>
    <p>A conversational AI interface that connects to leading AI providers (OpenAI, Anthropic, DeepSeek) to help you with coding, writing, analysis, and more. Your personal AI assistant runs entirely in your browser.</p>
    <p><strong>Key Features:</strong></p>
    <ul>
      <li><strong>Multiple AI Providers:</strong> Connect to OpenAI (GPT-4, GPT-3.5), Anthropic (Claude), DeepSeek, and other compatible APIs</li>
      <li><strong>Bring Your Own Key:</strong> Use your own API key — we don't charge anything or store your key on our servers</li>
      <li><strong>Conversation History:</strong> All conversations are saved locally in your browser</li>
      <li><strong>File Attachments:</strong> Upload code files, documents, or text files for AI analysis</li>
      <li><strong>Markdown Rendering:</strong> AI responses are beautifully formatted with markdown support</li>
      <li><strong>Multiple Conversations:</strong> Organize your chats into separate conversations</li>
      <li><strong>Copy & Export:</strong> Easily copy AI responses or export entire conversations</li>
    </ul>
    <p><strong>Use Cases:</strong> Getting coding help, debugging code, explaining technical concepts, writing documentation, generating code snippets, analyzing data, learning programming languages, or brainstorming ideas.</p>

    <h2>Why Choose AI Tools?</h2>

    <h3>🔒 Privacy & Security</h3>
    <p>Your data never leaves your browser. No account required. No tracking. No hidden data collection. Just pure, functional tools that respect your privacy.</p>

    <h3>⚡ Fast & Reliable</h3>
    <p>Everything runs locally in your browser. No server delays. No downtime. Works offline. Instant response times.</p>

    <h3>🎨 Beautiful Interface</h3>
    <p>Clean, modern design with intuitive controls. Dark mode support. Responsive layout works on desktop, tablet, and mobile devices.</p>

    <h3>📖 No Learning Curve</h3>
    <p>Tools are designed to be intuitive. No complex setup. No configuration required. Just start using them immediately.</p>

    <h2>Technology Stack</h2>
    <p>We use modern web technologies to deliver a fast, reliable, and beautiful experience:</p>
    <ul>
      <li><strong>Vue 3 + TypeScript:</strong> Modern reactive framework with type safety</li>
      <li><strong>Vite:</strong> Lightning-fast build tool for instant development feedback</li>
      <li><strong>Vue Router:</strong> Smooth navigation between tools</li>
      <li><strong>CodeMirror 6:</strong> Professional code editor with syntax highlighting</li>
      <li><strong>Marked:</strong> Fast Markdown parser and renderer</li>
      <li><strong>DOMPurify:</strong> XSS protection for safe HTML rendering</li>
      <li><strong>Highlight.js:</strong> Syntax highlighting for code blocks</li>
      <li><strong>Regulex & RegExp-Tree:</strong> Regular expression visualization and parsing</li>
      <li><strong>Mermaid:</strong> Diagram generation for future visualization features</li>
    </ul>

    <h2>Open Source & Community</h2>
    <p>AI Tools is open source software. We believe in the power of community-driven development.</p>
    <p><strong>Contribute:</strong> Found a bug? Have a feature idea? Want to improve documentation? We welcome contributions! Please open an issue or pull request on our GitHub repository.</p>
    <p><strong>Star Us:</strong> If you find AI Tools useful, please consider starring our repository on GitHub. It helps others discover the project and motivates us to keep improving.</p>
    <p><strong>Spread the Word:</strong> Share AI Tools with your colleagues, friends, and communities. Every user helps us improve and grow.</p>

    <h2>Future Roadmap</h2>
    <p>We're constantly working on improvements and new tools. Here's what's coming:</p>
    <ul>
      <li><strong>New Tools:</strong> Image converter, CSS generator, color picker, cron expression editor, and more</li>
      <li><strong>Enhanced Features:</strong> Cloud sync (optional), collaborative editing, mobile apps</li>
      <li><strong>Performance:</strong> Faster loading, better optimization, reduced bundle size</li>
      <li><strong>Accessibility:</strong> Keyboard shortcuts, screen reader support, high contrast mode</li>
    </ul>
    <p>Have a suggestion? We'd love to hear it! Let us know what tools or features would be most useful to you.</p>

    <h2>Acknowledgments</h2>
    <p>AI Tools is built on the shoulders of giants. We're grateful to:</p>
    <ul>
      <li>The open-source community for creating amazing libraries and frameworks</li>
      <li>AI providers (OpenAI, Anthropic, DeepSeek) for powerful APIs</li>
      <li>Our users for feedback, suggestions, and support</li>
      <li>Contributors who help improve the project</li>
    </ul>

    <h2>Contact Us</h2>
    <p>Have questions, feedback, or want to get in touch? We'd love to hear from you! Check out our <a href="#/page/contact">Contact page</a> for all the ways to reach us.</p>
  `,
}

// ── Contact ──

const contactZh: LegalPageContent = {
  title: '联系我们',
  html: `
    <h2>联系方式</h2>
    <p>我们很乐意收到您的来信！无论您有问题、反馈、错误报告，还是只是打个招呼，都可以通过电子邮件联系我们。</p>

    <h3>📧 电子邮件</h3>
    <p>所有咨询、错误报告、功能建议、问题或其他事项，请通过电子邮件与我们联系：</p>
    <p><strong>电子邮件：</strong> <a href="mailto:songjiuhua91@gmail.com">songjiuhua91@gmail.com</a></p>

    <h3>📋 联系时请包含</h3>
    <p>为了帮助我们更好地帮助您，请在邮件中包含以下信息：</p>
    <ul>
      <li><strong>清晰的主题：</strong> 简要描述您的问题或建议</li>
      <li><strong>详细信息：</strong> 提供尽可能多关于您的问题或问题的详细信息</li>
      <li><strong>错误报告：</strong> 如果报告错误，请提供复现步骤、预期行为和实际行为</li>
      <li><strong>环境信息：</strong> 浏览器名称和版本、操作系统</li>
    </ul>

    <h3>⏰ 回复时间</h3>
    <p><strong>预期时间：</strong></p>
    <ul>
      <li><strong>一般咨询：</strong> 我们的目标是在 3-5 个工作日内回复</li>
      <li><strong>紧急事项：</strong> 请在邮件主题中标注"紧急"或"高优先级"</li>
    </ul>
    <p><em>请注意：</em> AI Tools 由小团队维护。我们感谢您的耐心和理解。回复时间可能因工作量和复杂性而异。</p>

    <h3>🔐 安全问题</h3>
    <p>发现安全漏洞？请发送电子邮件至 <a href="mailto:songjiuhua91@gmail.com">songjiuhua91@gmail.com</a>，主题中包含"安全问题"。请提供有关漏洞的详细信息，给我们时间在公开披露之前修复它。</p>
    <p>我们认真对待安全问题，并将及时处理安全问题。</p>

    <h3>💼 商务咨询</h3>
    <p>对于商务咨询、合作伙伴关系、赞助机会或新闻请求，请在邮件主题中包含"商务"。</p>

    <h2>谢谢！</h2>
    <p>感谢您联系 AI Tools。无论是报告错误、建议功能，还是只是打个招呼 — 每一个反馈都有助于我们改进。我们感谢您的支持！🙏</p>

    <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e5e5;">

    <p style="font-size: 13px; color: #6b7280; text-align: center;"><em>本页面也是我们隐私政策的一部分。您在联系我们时提供的任何信息（如电子邮件地址）将仅用于回复您的咨询，除非为处理您的请求所必要，否则不会与第三方共享。</em></p>
  `,
}

const contactEn: LegalPageContent = {
  title: 'Contact Us',
  html: `
    <h2>Get in Touch</h2>
    <p>We'd love to hear from you! Whether you have a question, feedback, a bug report, or just want to say hello, please feel free to reach out to us via email.</p>

    <h3>📧 Email</h3>
    <p>For all inquiries, bug reports, feature suggestions, questions, or other matters, please contact us via email:</p>
    <p><strong>Email:</strong> <a href="mailto:songjiuhua91@gmail.com">songjiuhua91@gmail.com</a></p>

    <h3>📋 What to Include</h3>
    <p>To help us assist you better, please include the following information in your email:</p>
    <ul>
      <li><strong>Clear Subject:</strong> Briefly describe your question or suggestion</li>
      <li><strong>Detailed Information:</strong> Provide as much detail as possible about your question or issue</li>
      <li><strong>Bug Reports:</strong> If reporting a bug, please include steps to reproduce, expected behavior, and actual behavior</li>
      <li><strong>Environment:</strong> Browser name and version, operating system</li>
    </ul>

    <h3>⏰ Response Time</h3>
    <p><strong>What to Expect:</strong></p>
    <ul>
      <li><strong>General Inquiries:</strong> We aim to respond within 3-5 business days</li>
      <li><strong>Urgent Matters:</strong> Please mark "urgent" or "high-priority" in the email subject line</li>
    </ul>
    <p><em>Please note:</em> AI Tools is maintained by a small team. We appreciate your patience and understanding. Response times may vary depending on volume and complexity.</p>

    <h3>🔐 Security Issues</h3>
    <p>Found a security vulnerability? Please email us at <a href="mailto:songjiuhua91@gmail.com">songjiuhua91@gmail.com</a> with "Security Issue" in the subject line. Please provide details about the vulnerability and give us time to fix it before public disclosure.</p>
    <p>We take security seriously and will address security issues promptly.</p>

    <h3>💼 Business Inquiries</h3>
    <p>For business inquiries, partnerships, sponsorship opportunities, or press requests, please include "Business" in your email subject line.</p>

    <h2>Thank You!</h2>
    <p>Thank you for reaching out to AI Tools. Whether you're reporting a bug, suggesting a feature, or just saying hi — every feedback helps us improve. We appreciate your support! 🙏</p>

    <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e5e5;">

    <p style="font-size: 13px; color: #6b7280; text-align: center;"><em>This page is also part of our privacy policy. Any information you provide when contacting us (such as your email address) will be used only to respond to your inquiry and will not be shared with third parties except as necessary to address your request.</em></p>
  `,
}

// ── Export ──

const contentMap = {
  zh: { privacy: privacyZh, terms: termsZh, about: aboutZh, contact: contactZh },
  en: { privacy: privacyEn, terms: termsEn, about: aboutEn, contact: contactEn },
}

export function getLegalPage(key: string, locale: 'zh' | 'en'): LegalPageContent | null {
  const pages = contentMap[locale] as Record<string, LegalPageContent>
  return pages[key] || null
}
