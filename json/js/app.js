// Language dictionary (default: English)
const translations = {
  en: {
    title: 'JSON Online Parser',
    subtitle: 'Format, compress, and validate JSON data',
    inputPlaceholder: `Enter JSON string here...

Example:
{
  "name": "John",
  "age": 30
}`,
    format: 'Format',
    compress: 'Compress',
    validate: 'Validate',
    copy: 'Copy',
    clear: 'Clear',
    sample: 'Sample',
    ready: 'Ready',
    formatSuccess: '✓ JSON formatted successfully',
    compressSuccess: '✓ JSON compressed successfully',
    validateSuccess: '✓ Valid JSON',
    noInput: '⚠ Please enter JSON content',
    nothingToCopy: '⚠ Nothing to copy',
    copySuccess: '✓ Copied to clipboard',
    copyFailed: '✗ Copy failed',
    sampleLoaded: '✓ Sample data loaded',
    chars: 'Chars',
    lines: 'Lines',
    nesting: 'Nesting',
    jsonSyntaxError: '✗ JSON syntax error',
    problemField: 'Problem field',
    reason: 'Reason',
    // Error reasons
    reasonExtraComma: 'Possible extra comma',
    reasonMissingComma: 'Missing comma between fields',
    reasonUnterminatedString: 'Unterminated string, missing closing quote',
    reasonMissingClosingSymbol: 'JSON not properly terminated, missing closing symbol',
    reasonFieldValueError: 'Possible missing field value or closing symbol',
    reasonMissingValue: 'Missing field value or field name format error',
    reasonArrayError: 'Array missing element or has trailing comma',
    reasonTailComma: 'Possible missing comma or trailing comma exists',
    reasonUndefinedIdentifier: 'Undefined identifier used, boolean should be true/false, null value should be null',
    reasonDuplicateKey: 'Duplicate field name exists',
    reasonQuoteMismatch: 'String quotes do not match',
    reasonStringFormatError: 'String format error',
    reasonNumberFormatError: 'Number format error or misplaced',
    reasonFieldValueFormatError: 'Field value format error or undefined',
    reasonDefaultError: 'Field value or format error'
  },
  zh: {
    title: 'JSON 在线解析工具',
    subtitle: '格式化、压缩、验证 JSON 数据',
    inputPlaceholder: `在此输入 JSON 字符串...

示例：
{
  "name": "张三",
  "age": 30
}`,
    format: '格式化',
    compress: '压缩',
    validate: '验证',
    copy: '复制',
    clear: '清空',
    sample: '示例',
    ready: '就绪',
    formatSuccess: '✓ JSON 格式化成功',
    compressSuccess: '✓ JSON 压缩成功',
    validateSuccess: '✓ JSON 格式正确',
    noInput: '⚠ 请输入 JSON 内容',
    nothingToCopy: '⚠ 没有可复制的内容',
    copySuccess: '✓ 已复制到剪贴板',
    copyFailed: '✗ 复制失败',
    sampleLoaded: '✓ 已加载示例数据',
    chars: '字符',
    lines: '行数',
    nesting: '嵌套层级',
    jsonSyntaxError: '✗ JSON 语法错误',
    problemField: '问题字段',
    reason: '原因',
    // Error reasons
    reasonExtraComma: '可能存在多余的逗号',
    reasonMissingComma: '字段之间缺少逗号分隔',
    reasonUnterminatedString: '字符串未闭合，缺少结束引号',
    reasonMissingClosingSymbol: 'JSON未正确结束，缺少闭合符号',
    reasonFieldValueError: '可能缺少字段值或闭合符号',
    reasonMissingValue: '可能缺少字段值或字段名格式错误',
    reasonArrayError: '数组可能缺少元素或存在尾部逗号',
    reasonTailComma: '可能缺少逗号或存在尾部逗号',
    reasonUndefinedIdentifier: '使用了未定义的标识符，布尔值应为true/false，空值应为null',
    reasonDuplicateKey: '存在重复的字段名',
    reasonQuoteMismatch: '字符串引号不匹配',
    reasonStringFormatError: '字符串格式错误',
    reasonNumberFormatError: '数值格式错误或位置不当',
    reasonFieldValueFormatError: '字段值格式错误或未定义',
    reasonDefaultError: '字段值或格式错误'
  }
};

// Current language (default: 'en')
let currentLanguage = 'en';

// Get translations for current language
function t(key) {
  return translations[currentLanguage][key] || translations.en[key] || key;
}

// Update UI text based on current language
function updateLanguage() {
  // Update text content
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    element.textContent = t(key);
  });

  // Update placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    element.placeholder = t(key);
  });

  // Update language dropdown value
  const langSelect = document.getElementById('langSelect');
  if (langSelect) {
    langSelect.value = currentLanguage;
  }

  // Update document language
  document.documentElement.lang = currentLanguage === 'en' ? 'en' : 'zh-CN';

  // Save to localStorage
  localStorage.setItem('jsonParserLanguage', currentLanguage);

  // Update statistics display with new language
  if (input.value) {
    updateStatistics(input.value);
  }
}

// Change language
function changeLanguage(event) {
  currentLanguage = event.target.value;
  updateLanguage();
}

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
const langSelect = document.getElementById('langSelect');

// Debounce timer for real-time formatting
let debounceTimer = null;

// Status message helper
function showStatus(message, type = '') {
  statusMessage.textContent = message;
  statusMessage.className = 'status-message';
  if (type) {
    statusMessage.classList.add(type);
  }
}

// Analyze error and provide detailed reason
function analyzeErrorReason(inputStr, errorPosition, errorMessage) {
  const beforeStr = inputStr.substring(0, errorPosition);
  const afterStr = inputStr.substring(errorPosition);
  const charAtError = inputStr.charAt(errorPosition);

  // Check for various error patterns
  if (errorMessage.includes('Unexpected token')) {
    if (charAtError === ',') {
      return t('reasonExtraComma');
    } else if (charAtError === '}') {
      const lastComma = beforeStr.lastIndexOf(',');
      if (lastComma > beforeStr.lastIndexOf('{')) {
        return t('reasonTailComma');
      }
      return t('reasonFieldValueError');
    } else if (charAtError === ']') {
      return t('reasonArrayError');
    }
  }

  if (errorMessage.includes('Expected') || errorMessage.includes('expected')) {
    if (errorMessage.includes('","') || errorMessage.includes("','")) {
      return t('reasonMissingComma');
    } else if (errorMessage.includes('"}') || errorMessage.includes("'}")) {
      return t('reasonTailComma');
    } else if (errorMessage.includes('Property value')) {
      return t('reasonFieldValueFormatError');
    }
  }

  if (errorMessage.includes('Unterminated string')) {
    return t('reasonUnterminatedString');
  }

  if (errorMessage.includes('Unexpected end')) {
    return t('reasonMissingClosingSymbol');
  }

  if (errorMessage.includes('Unexpected number')) {
    return t('reasonNumberFormatError');
  }

  if (errorMessage.includes('Unexpected identifier')) {
    return t('reasonUndefinedIdentifier');
  }

  if (errorMessage.includes('Duplicate key')) {
    return t('reasonDuplicateKey');
  }

  // Check character context
  if (charAtError === '"') {
    const quoteCount = (beforeStr.match(/"/g) || []).length;
    if (quoteCount % 2 !== 0) {
      return t('reasonQuoteMismatch');
    }
    return t('reasonStringFormatError');
  }

  if (charAtError === ':') {
    return t('reasonMissingValue');
  }

  // Check for common patterns
  if (afterStr.trim().startsWith(',')) {
    return t('reasonExtraComma');
  }

  if (beforeStr.trim().endsWith(',')) {
    return t('reasonExtraComma');
  }

  // Default generic message
  return t('reasonDefaultError');
}

// Find the problematic key at error position
function findProblematicKey(inputStr, errorPosition) {
  // Find the last key definition before the error position
  const beforeStr = inputStr.substring(0, errorPosition);
  const keyMatches = beforeStr.matchAll(/"([^"\\]|\\.)*"\s*:/g);
  let lastKey = null;
  let lastKeyPos = -1;

  for (const match of keyMatches) {
    lastKey = match[0].replace(/"\s*:/g, '').replace(/"/g, '');
    lastKeyPos = match.index;
  }

  return { key: lastKey, position: lastKeyPos };
}

// Error display helper
function showError(error) {
  const errorMessage = error.message || 'Unknown error';
  const position = error.message.match(/position (\d+)/);
  let fullMessage = t('jsonSyntaxError') + ': ' + errorMessage;

  if (position) {
    const errorPos = parseInt(position[1]);
    fullMessage += ` (${currentLanguage === 'en' ? 'Position' : '位置'}: ${errorPos})`;

    // Find the problematic key
    const inputStr = input.value;
    const { key: problematicKey } = findProblematicKey(inputStr, errorPos);

    if (problematicKey) {
      // Analyze the specific reason for this error
      const reason = analyzeErrorReason(inputStr, errorPos, errorMessage);
      fullMessage += ` | ${t('problemField')}: "${problematicKey}" | ${t('reason')}: ${reason}`;
    }
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
    statsElement.textContent = `${t('chars')}: ${charCount} | ${t('lines')}: ${lineCount} | ${t('nesting')}: ${depth}`;
  } catch (error) {
    statsElement.textContent = `${t('chars')}: ${charCount} | ${t('lines')}: ${lineCount}`;
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

  // Apply syntax highlighting - use our custom implementation
  applyBasicHighlighting();

  generateLineNumbers(jsonString);
  updateStatistics(jsonString);

  // Scroll to top
  output.parentElement.scrollTop = 0;
}

// Apply JSON syntax highlighting
function applyBasicHighlighting() {
  const code = output.textContent;

  // Escape HTML first
  let escaped = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Apply highlighting using placeholders approach
  const placeholders = [];

  // Step 1: Highlight keys ("key":)
  escaped = escaped.replace(/"([^"\\]|\\.)*"\s*:/g, (match) => {
    const placeholder = `__PLACEHOLDER_${placeholders.length}__`;
    placeholders.push(`<span class="hljs-key">${match}</span>`);
    return placeholder;
  });

  // Step 2: Highlight string values (strings not followed by colon)
  escaped = escaped.replace(/"([^"\\]|\\.)*"(?!\s*:)/g, (match) => {
    const placeholder = `__PLACEHOLDER_${placeholders.length}__`;
    placeholders.push(`<span class="hljs-string">${match}</span>`);
    return placeholder;
  });

  // Step 3: Highlight null
  escaped = escaped.replace(/\bnull\b/g, (match) => {
    const placeholder = `__PLACEHOLDER_${placeholders.length}__`;
    placeholders.push(`<span class="hljs-null">${match}</span>`);
    return placeholder;
  });

  // Step 4: Highlight booleans
  escaped = escaped.replace(/\b(true|false)\b/g, (match) => {
    const placeholder = `__PLACEHOLDER_${placeholders.length}__`;
    placeholders.push(`<span class="hljs-boolean">${match}</span>`);
    return placeholder;
  });

  // Step 5: Highlight numbers
  escaped = escaped.replace(/\b(\d+\.?\d*)\b/g, (match) => {
    const placeholder = `__PLACEHOLDER_${placeholders.length}__`;
    placeholders.push(`<span class="hljs-number">${match}</span>`);
    return placeholder;
  });

  // Step 6: Highlight punctuation
  escaped = escaped.replace(/([\[\]{}])/g, (match) => {
    const placeholder = `__PLACEHOLDER_${placeholders.length}__`;
    placeholders.push(`<span class="hljs-punctuation">${match}</span>`);
    return placeholder;
  });

  // Replace placeholders with actual HTML
  for (let i = 0; i < placeholders.length; i++) {
    escaped = escaped.replace(`__PLACEHOLDER_${i}__`, placeholders[i]);
  }

  output.innerHTML = escaped;
}

// Clear input and output
function clearAll() {
  input.value = '';
  output.textContent = '';
  lineNumbers.innerHTML = '';
  showStatus(t('ready'));
  updateStatistics('');
  input.focus();
}

// Real-time format input and display in output
function realTimeFormat() {
  const inputValue = input.value.trim();

  // Clear previous timer
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  // Debounce: wait 300ms after user stops typing
  debounceTimer = setTimeout(() => {
    if (!inputValue) {
      output.textContent = '';
      lineNumbers.innerHTML = '';
      updateStatistics('');
      showStatus(t('ready'));
      return;
    }

    try {
      const parsed = JSON.parse(input.value);
      const formatted = JSON.stringify(parsed, null, 2);
      displayOutput(formatted);
      showStatus(t('ready'));
    } catch (error) {
      // Don't show error for real-time typing, just keep previous valid output or clear
      // Only update statistics for the raw input
      updateStatistics(input.value);
    }
  }, 300);
}

// Format JSON
function formatJSON() {
  const inputValue = input.value.trim();

  if (!inputValue) {
    showStatus(t('noInput'), 'warning');
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
    showStatus(t('formatSuccess'), 'success');
  } catch (error) {
    showError(error);
  }
}

// Compress JSON
function compressJSON() {
  const inputValue = input.value.trim();

  if (!inputValue) {
    showStatus(t('noInput'), 'warning');
    input.focus();
    return;
  }

  try {
    const parsed = JSON.parse(inputValue);
    const compressed = JSON.stringify(parsed);
    displayOutput(compressed);
    showStatus(t('compressSuccess'), 'success');
  } catch (error) {
    showError(error);
  }
}

// Validate JSON
function validateJSON() {
  const inputValue = input.value.trim();

  if (!inputValue) {
    showStatus(t('noInput'), 'warning');
    input.focus();
    return;
  }

  try {
    JSON.parse(inputValue);
    showStatus(t('validateSuccess'), 'success');
    updateStatistics(inputValue);
  } catch (error) {
    showError(error);
  }
}

// Copy to clipboard
async function copyToClipboard() {
  const outputText = output.textContent;

  if (!outputText) {
    showStatus(t('nothingToCopy'), 'warning');
    return;
  }

  try {
    await navigator.clipboard.writeText(outputText);
    showStatus(t('copySuccess'), 'success');
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
      showStatus(t('copySuccess'), 'success');
    } catch (err) {
      showStatus(t('copyFailed'), 'error');
    }

    document.body.removeChild(textarea);
  }
}

// Load sample data
function loadSample() {
  const sampleJSON = currentLanguage === 'en' ? {
    "name": "John Doe",
    "age": 30,
    "city": "New York",
    "hobbies": ["Reading", "Traveling", "Photography"],
    "address": {
      "street": "123 Main St",
      "district": "Manhattan",
      "zipCode": "10001"
    },
    "isActive": true,
    "balance": null
  } : {
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
  showStatus(t('sampleLoaded'), 'success');
  updateStatistics(sampleString);
}

// Event listeners for buttons
formatBtn.addEventListener('click', formatJSON);
compressBtn.addEventListener('click', compressJSON);
validateBtn.addEventListener('click', validateJSON);
copyBtn.addEventListener('click', copyToClipboard);
clearBtn.addEventListener('click', clearAll);
sampleBtn.addEventListener('click', loadSample);
langSelect.addEventListener('change', changeLanguage);

// Real-time formatting on input
input.addEventListener('input', realTimeFormat);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Load saved language preference or default to 'en'
  const savedLanguage = localStorage.getItem('jsonParserLanguage');
  if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'zh')) {
    currentLanguage = savedLanguage;
  }

  // Update UI with current language
  updateLanguage();
  showStatus(t('ready'));
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
