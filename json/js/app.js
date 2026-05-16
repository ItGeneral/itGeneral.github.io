// DOM element references
const input = document.getElementById('input');
const output = document.getElementById('output');
const lineNumbers = document.querySelector('.line-numbers');
const statusMessage = document.getElementById('statusMessage');
const statsElement = document.getElementById('stats');

// Buttons
const formatBtn = document.getElementById('formatBtn');
const compressBtn = document.getElementById('compressBtn');
const validateBtn = document.getElementById('validateBtn');
const copyBtn = document.getElementById('copyBtn');
const clearBtn = document.getElementById('clearBtn');
const sampleBtn = document.getElementById('sampleBtn');

// Status message helper
function showStatus(message, type = '') {
  statusMessage.textContent = message;
  statusMessage.className = 'status-message';
  if (type) {
    statusMessage.classList.add(type);
  }
}

// Error display helper
function showError(error) {
  const errorMessage = error.message || '未知错误';
  const position = error.message.match(/position (\d+)/);
  let fullMessage = '✗ JSON 语法错误: ' + errorMessage;

  if (position) {
    fullMessage += ` (位置: ${position[1]})`;
  }

  showStatus(fullMessage, 'error');
  output.textContent = '';
  lineNumbers.innerHTML = '';
  updateStatistics('');
}

// Update statistics
function updateStatistics(inputStr) {
  if (!inputStr) {
    statsElement.textContent = '';
    return;
  }

  const charCount = inputStr.length;
  const lineCount = inputStr.split('\n').length;

  try {
    const parsed = JSON.parse(inputStr);
    const depth = getDepth(parsed);
    statsElement.textContent = `字符: ${charCount} | 行数: ${lineCount} | 嵌套层级: ${depth}`;
  } catch (error) {
    statsElement.textContent = `字符: ${charCount} | 行数: ${lineCount}`;
  }
}

// Calculate JSON depth
function getDepth(obj, currentDepth = 0) {
  if (typeof obj !== 'object' || obj === null) {
    return currentDepth;
  }

  const values = Object.values(obj);
  const maxChildDepth = Math.max(
    ...values.map(v => getDepth(v, currentDepth + 1)),
    currentDepth
  );

  return maxChildDepth;
}

// Sort object keys recursively
function sortObjectKeys(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }

  const sortedKeys = Object.keys(obj).sort();
  const sortedObj = {};

  for (const key of sortedKeys) {
    sortedObj[key] = sortObjectKeys(obj[key]);
  }

  return sortedObj;
}

// Generate line numbers
function generateLineNumbers(code) {
  const lines = code.split('\n');
  const lineNumbersHtml = lines
    .map((_, index) => `<div class="line-number">${index + 1}</div>`)
    .join('');

  lineNumbers.innerHTML = lineNumbersHtml;
}

// Display output with syntax highlighting
function displayOutput(jsonString) {
  output.textContent = jsonString;

  // Apply syntax highlighting
  if (typeof hljs !== 'undefined') {
    try {
      hljs.highlightElement(output);
    } catch (e) {
      console.warn('Syntax highlighting failed:', e);
      // Apply basic highlighting as fallback
      applyBasicHighlighting();
    }
  } else {
    // Fallback to basic highlighting if hljs not available
    applyBasicHighlighting();
  }

  generateLineNumbers(jsonString);
  updateStatistics(jsonString);

  // Scroll to top
  output.parentElement.scrollTop = 0;
}

// Basic syntax highlighting as fallback
function applyBasicHighlighting() {
  const code = output.textContent;

  // Simple regex-based highlighting
  const highlighted = code
    .replace(/"([^"\\]|\\.)*"/g, '<span class="hljs-string">$&</span>')
    .replace(/\b(\d+)\b/g, '<span class="hljs-number">$1</span>')
    .replace(/\b(true|false|null)\b/g, '<span class="hljs-literal">$&</span>');

  output.innerHTML = highlighted;
}

// Clear input and output
function clearAll() {
  input.value = '';
  output.textContent = '';
  lineNumbers.innerHTML = '';
  showStatus('就绪');
  updateStatistics('');
  input.focus();
}

// Format JSON
function formatJSON() {
  const inputValue = input.value.trim();

  if (!inputValue) {
    showStatus('⚠ 请输入 JSON 内容', 'warning');
    input.focus();
    return;
  }

  try {
    const parsed = JSON.parse(inputValue);
    // Sort keys recursively
    const sorted = sortObjectKeys(parsed);
    const formatted = JSON.stringify(sorted, null, 2);

    // Update both input and output with formatted JSON
    input.value = formatted;
    displayOutput(formatted);
    showStatus('✓ JSON 格式化成功', 'success');
  } catch (error) {
    showError(error);
  }
}

// Compress JSON
function compressJSON() {
  const inputValue = input.value.trim();

  if (!inputValue) {
    showStatus('⚠ 请输入 JSON 内容', 'warning');
    input.focus();
    return;
  }

  try {
    const parsed = JSON.parse(inputValue);
    const compressed = JSON.stringify(parsed);
    displayOutput(compressed);
    showStatus('✓ JSON 压缩成功', 'success');
  } catch (error) {
    showError(error);
  }
}

// Validate JSON
function validateJSON() {
  const inputValue = input.value.trim();

  if (!inputValue) {
    showStatus('⚠ 请输入 JSON 内容', 'warning');
    input.focus();
    return;
  }

  try {
    JSON.parse(inputValue);
    showStatus('✓ JSON 格式正确', 'success');
    updateStatistics(inputValue);
  } catch (error) {
    showError(error);
  }
}

// Copy to clipboard
async function copyToClipboard() {
  const outputText = output.textContent;

  if (!outputText) {
    showStatus('⚠ 没有可复制的内容', 'warning');
    return;
  }

  try {
    await navigator.clipboard.writeText(outputText);
    showStatus('✓ 已复制到剪贴板', 'success');
  } catch (error) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = outputText;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();

    try {
      document.execCommand('copy');
      showStatus('✓ 已复制到剪贴板', 'success');
    } catch (err) {
      showStatus('✗ 复制失败', 'error');
    }

    document.body.removeChild(textarea);
  }
}

// Load sample data
function loadSample() {
  const sampleJSON = {
    "name": "张三",
    "age": 30,
    "city": "北京",
    "hobbies": ["阅读", "旅游", "摄影"],
    "address": {
      "street": "长安街1号",
      "district": "东城区",
      "zipCode": "100001"
    },
    "isActive": true,
    "balance": null
  };

  const sampleString = JSON.stringify(sampleJSON, null, 2);
  input.value = sampleString;
  showStatus('✓ 已加载示例数据', 'success');
  updateStatistics(sampleString);
}

// Event listeners for buttons
formatBtn.addEventListener('click', formatJSON);
compressBtn.addEventListener('click', compressJSON);
validateBtn.addEventListener('click', validateJSON);
copyBtn.addEventListener('click', copyToClipboard);
clearBtn.addEventListener('click', clearAll);
sampleBtn.addEventListener('click', loadSample);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  showStatus('就绪');
  input.focus();

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter - Format
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      formatJSON();
    }

    // Ctrl/Cmd + Shift + C - Compress
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
      e.preventDefault();
      compressJSON();
    }

    // Ctrl/Cmd + Shift + V - Validate
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'V') {
      e.preventDefault();
      validateJSON();
    }

    // Ctrl/Cmd + Shift + X - Clear
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'X') {
      e.preventDefault();
      clearAll();
    }
  });

  // Synchronize line numbers scroll with code scroll
  const preElement = output.parentElement;

  preElement.addEventListener('scroll', () => {
    lineNumbers.scrollTop = preElement.scrollTop;
  });
});
