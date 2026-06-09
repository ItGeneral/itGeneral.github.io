/**
 * JSON 转换工具函数集合
 */

// ============ 注释处理 ============

/**
 * 移除 JSON 字符串中的注释（单行 // 和多行 /* *‍/）
 * 支持带注释的 JSON（JSONC）格式
 */
export function stripJsonComments(input: string): string {
  let result = ''
  let i = 0
  const len = input.length
  let inString = false
  let stringChar = ''

  while (i < len) {
    const ch = input[i]
    const next = input[i + 1]

    // 在字符串内
    if (inString) {
      result += ch
      if (ch === '\\') {
        // 转义字符，跳过下一个
        i++
        if (i < len) result += input[i]
      } else if (ch === stringChar) {
        inString = false
      }
      i++
      continue
    }

    // 进入字符串
    if (ch === '"' || ch === "'") {
      inString = true
      stringChar = ch
      result += ch
      i++
      continue
    }

    // 单行注释 //
    if (ch === '/' && next === '/') {
      // 跳过到行尾
      i += 2
      while (i < len && input[i] !== '\n') i++
      continue
    }

    // 多行注释 /* ... */
    if (ch === '/' && next === '*') {
      i += 2
      while (i < len && !(input[i] === '*' && input[i + 1] === '/')) i++
      i += 2 // 跳过 */
      continue
    }

    // 尾随逗号处理（可选，在 } 或 ] 前的逗号）
    result += ch
    i++
  }

  // 移除尾随逗号（在 } 或 ] 前面的逗号）
  result = result.replace(/,\s*([}\]])/g, '$1')

  return result
}

/**
 * 格式化带注释的 JSON（保留注释，只调整缩进）
 * 使用 tokenizer 方式，逐 token 输出并调整缩进
 */
export function formatJsonc(input: string, indent: number = 2): string {
  type Token = { type: string; value: string }
  const tokens: Token[] = []

  // 1. 词法分析
  let i = 0
  const len = input.length
  while (i < len) {
    const ch = input[i]

    // 空白
    if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
      i++
      continue
    }

    // 字符串
    if (ch === '"') {
      let s = '"'
      i++
      while (i < len) {
        if (input[i] === '\\') {
          s += input[i] + (input[i + 1] || '')
          i += 2
        } else if (input[i] === '"') {
          s += '"'
          i++
          break
        } else {
          s += input[i]
          i++
        }
      }
      tokens.push({ type: 'string', value: s })
      continue
    }

    // 单行注释
    if (ch === '/' && input[i + 1] === '/') {
      let c = ''
      i += 2
      while (i < len && input[i] !== '\n') {
        c += input[i]
        i++
      }
      tokens.push({ type: 'comment', value: '//' + c })
      continue
    }

    // 多行注释
    if (ch === '/' && input[i + 1] === '*') {
      let c = '/*'
      i += 2
      while (i < len && !(input[i] === '*' && input[i + 1] === '/')) {
        c += input[i]
        i++
      }
      if (i < len) {
        c += '*/'
        i += 2
      }
      tokens.push({ type: 'comment', value: c })
      continue
    }

    // 结构字符
    if (ch === '{' || ch === '}' || ch === '[' || ch === ']') {
      tokens.push({ type: 'bracket', value: ch })
      i++
      continue
    }

    // 冒号
    if (ch === ':') {
      tokens.push({ type: 'colon', value: ':' })
      i++
      continue
    }

    // 逗号
    if (ch === ',') {
      tokens.push({ type: 'comma', value: ',' })
      i++
      continue
    }

    // 数字、true、false、null
    if (ch === '-' || ch === '+' || (ch >= '0' && ch <= '9') || ch === 't' || ch === 'f' || ch === 'n') {
      let literal = ''
      while (i < len && !/[\s,}\]:]/.test(input[i])) {
        literal += input[i]
        i++
      }
      tokens.push({ type: 'literal', value: literal })
      continue
    }

    // 其他字符
    tokens.push({ type: 'other', value: ch })
    i++
  }

  // 2. 重新格式化输出
  let result = ''
  let depth = 0
  const pad = () => ' '.repeat(depth * indent)

  // 判断下一个非 comment token 是否是 } 或 ]
  const isNextClosing = (idx: number): boolean => {
    for (let j = idx; j < tokens.length; j++) {
      if (tokens[j].type === 'comment') continue
      return tokens[j].value === '}' || tokens[j].value === ']'
    }
    return false
  }

  // 判断当前位置后面紧跟的（跳过 comment）是否是 comment
  const nextNonWhitespaceIsComment = (idx: number): boolean => {
    for (let j = idx; j < tokens.length; j++) {
      if (tokens[j].type === 'comment') return true
      return false
    }
    return false
  }

  let needNewline = false

  for (let idx = 0; idx < tokens.length; idx++) {
    const tok = tokens[idx]

    if (tok.type === 'bracket') {
      if (tok.value === '{' || tok.value === '[') {
        if (isNextClosing(idx + 1)) {
          // 空对象/数组
          if (needNewline) result += '\n' + pad()
          result += tok.value
          needNewline = false
        } else {
          if (needNewline) result += '\n' + pad()
          result += tok.value
          depth++
          needNewline = true
        }
      } else {
        // } 或 ]
        depth = Math.max(0, depth - 1)
        if (needNewline) result += '\n' + pad()
        result += tok.value
        needNewline = false
      }
    } else if (tok.type === 'string') {
      if (needNewline) { result += '\n' + pad(); needNewline = false }
      result += tok.value
    } else if (tok.type === 'colon') {
      result += ': '
    } else if (tok.type === 'comma') {
      result += ','
      // 逗号后面如果紧跟注释，不换行，留空格让注释跟在同一行
      if (idx + 1 < tokens.length && tokens[idx + 1].type === 'comment') {
        result += ' '
      } else {
        needNewline = true
      }
    } else if (tok.type === 'literal') {
      if (needNewline) { result += '\n' + pad(); needNewline = false }
      result += tok.value
    } else if (tok.type === 'comment') {
      // 检查前一个 token 是否是逗号（已在同一行）
      const prevTok = idx > 0 ? tokens[idx - 1] : null
      if (prevTok && prevTok.type === 'comma') {
        // 跟在逗号后面，已经在同一行了
        result += tok.value
      } else {
        // 独立行注释
        if (needNewline) { result += '\n' + pad(); needNewline = false }
        else result += '\n' + pad()
        result += tok.value
      }
      needNewline = true
    } else {
      if (needNewline) { result += '\n' + pad(); needNewline = false }
      result += tok.value
    }
  }

  return result
}

/**
 * 安全解析 JSON（支持注释、尾随逗号、尾部无效内容）
 */
export function safeJsonParse(input: string): any {
  // 先尝试标准解析
  try {
    return JSON.parse(input)
  } catch {}

  // 剥离注释和尾随逗号
  const cleaned = stripJsonComments(input)

  try {
    return JSON.parse(cleaned)
  } catch {}

  // 尝试找到有效 JSON 的结束位置
  const trimmed = cleaned.trim()
  if (!trimmed) throw new Error('Empty input')

  // 确定起始字符，找到匹配的结束位置
  const startChar = trimmed[0]
  const endChar = startChar === '{' ? '}' : startChar === '[' ? ']' : null

  if (endChar) {
    let depth = 0
    let inStr = false
    let strCh = ''
    for (let i = 0; i < trimmed.length; i++) {
      const ch = trimmed[i]
      if (inStr) {
        if (ch === '\\') { i++; continue }
        if (ch === strCh) inStr = false
        continue
      }
      if (ch === '"' || ch === "'") { inStr = true; strCh = ch; continue }
      if (ch === '{' || ch === '[') depth++
      if (ch === '}' || ch === ']') {
        depth--
        if (depth === 0) {
          // 找到匹配的结束位置，截取有效部分
          return JSON.parse(trimmed.slice(0, i + 1))
        }
      }
    }
  }

  throw new Error('Invalid JSON')
}

/**
 * 格式化 JSON 解析错误，添加行列号信息
 */
export function formatJsonError(input: string, e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e)

  // 尝试从错误信息中提取位置
  const posMatch = msg.match(/position\s+(\d+)/i)
  if (posMatch) {
    const pos = parseInt(posMatch[1])
    const before = input.slice(0, pos)
    const line = (before.match(/\n/g) || []).length + 1
    const col = pos - before.lastIndexOf('\n')
    const nearText = input.slice(Math.max(0, pos - 20), Math.min(input.length, pos + 20))
    return `Line ${line}, Column ${col}\n Near: ...${nearText}...\n ${msg}`
  }

  // column 行格式
  const colMatch = msg.match(/line\s+(\d+)\s+column\s+(\d+)/i)
  if (colMatch) {
    const line = colMatch[1]
    const col = colMatch[2]
    const lineNum = parseInt(line)
    const lines = input.split('\n')
    const errorLine = lines[lineNum - 1] || ''
    const pointer = ' '.repeat(parseInt(col) - 1) + '^'
    return `Line ${line}, Column ${col}\n\n${errorLine}\n${pointer}\n\n${msg}`
  }

  return msg
}

// ============ 格式化 / 压缩 ============

export function formatJson(input: string, indent: number = 2): string {
  const obj = safeJsonParse(input)
  return JSON.stringify(obj, null, indent)
}

export function minifyJson(input: string): string {
  const obj = safeJsonParse(input)
  return JSON.stringify(obj)
}

// ============ JSON → YAML ============

export function jsonToYaml(input: string): string {
  const obj = safeJsonParse(input)
  return objectToYaml(obj, 0)
}

function objectToYaml(obj: unknown, indent: number): string {
  const pad = '  '.repeat(indent)
  if (obj === null || obj === undefined) return 'null'
  if (typeof obj === 'boolean' || typeof obj === 'number') return String(obj)
  if (typeof obj === 'string') {
    if (/[:#\n\r{}[\],&*?|>!'"%@`]/.test(obj) || obj === '' || obj === 'true' || obj === 'false' || obj === 'null') {
      return `"${obj.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`
    }
    return obj
  }
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]'
    return obj.map(item => {
      if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
        // For objects in arrays: "- key: value" with 2 spaces between - and key
        const innerPad = '  '.repeat(indent)
        const entries = Object.entries(item as Record<string, unknown>)
        return entries.map(([key, val], idx) => {
          const yamlKey = /^[a-zA-Z0-9_-]+$/.test(key) ? key : `"${key}"`
          const prefix = idx === 0 ? `${pad}- ` : `${innerPad}  `
          if (val === null || val === undefined) return `${prefix}${yamlKey}: null`
          if (typeof val !== 'object') return `${prefix}${yamlKey}: ${objectToYaml(val, indent + 1)}`
          const inner = objectToYaml(val, indent + 1)
          return `${prefix}${yamlKey}:\n${inner}`
        }).join('\n')
      }
      const val = objectToYaml(item, indent + 1)
      return `${pad}- ${val}`
    }).join('\n')
  }
  if (typeof obj === 'object') {
    const entries = Object.entries(obj as Record<string, unknown>)
    if (entries.length === 0) return '{}'
    return entries.map(([key, val]) => {
      const yamlKey = /^[a-zA-Z0-9_-]+$/.test(key) ? key : `"${key}"`
      if (val === null || val === undefined) return `${pad}${yamlKey}: null`
      if (typeof val !== 'object') {
        return `${pad}${yamlKey}: ${objectToYaml(val, indent)}`
      }
      const inner = objectToYaml(val, indent + 1)
      return `${pad}${yamlKey}:\n${inner}`
    }).join('\n')
  }
  return String(obj)
}

// ============ JSON → XML ============

export function jsonToXml(input: string): string {
  const obj = safeJsonParse(input)
  return `<?xml version="1.0" encoding="UTF-8"?>\n${objectToXml(obj, 'root')}`
}

function objectToXml(obj: unknown, tagName: string, indent: number = 0): string {
  const pad = '  '.repeat(indent)
  if (obj === null || obj === undefined) return `${pad}<${tagName}/>`
  if (typeof obj !== 'object') {
    const escaped = String(obj).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    return `${pad}<${tagName}>${escaped}</${tagName}>`
  }
  if (Array.isArray(obj)) {
    return obj.map(item => objectToXml(item, 'item', indent)).join('\n')
  }
  const entries = Object.entries(obj as Record<string, unknown>)
  const children = entries.map(([k, v]) => objectToXml(v, k, indent + 1)).join('\n')
  return `${pad}<${tagName}>\n${children}\n${pad}</${tagName}>`
}

// ============ JSON → CSV ============

export function jsonToCsv(input: string): string {
  const arr = safeJsonParse(input)
  if (!Array.isArray(arr) || arr.length === 0) throw new Error('JSON must be a non-empty array to convert to CSV')
  const allKeys = new Set<string>()
  arr.forEach((item: unknown) => {
    if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
      Object.keys(item as Record<string, unknown>).forEach(k => allKeys.add(k))
    }
  })
  const headers = [...allKeys]
  const escapeCsv = (val: unknown): string => {
    const s = val === null || val === undefined ? '' : String(val)
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`
    }
    return s
  }
  const lines = [headers.map(escapeCsv).join(',')]
  for (const item of arr) {
    if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
      const record = item as Record<string, unknown>
      lines.push(headers.map(h => escapeCsv(record[h])).join(','))
    }
  }
  return lines.join('\n')
}

// ============ JSON → TypeScript ============

export function jsonToTypescript(input: string, rootName: string = 'RootObject'): string {
  const obj = safeJsonParse(input)
  const interfaces: Map<string, string> = new Map()
  generateTsInterface(obj, rootName, interfaces)
  return [...interfaces.values()].join('\n\n') + '\n'
}

function generateTsInterface(obj: unknown, name: string, interfaces: Map<string, string>): string {
  if (obj === null) return 'null'
  if (Array.isArray(obj)) {
    if (obj.length === 0) return 'any[]'
    const itemType = generateTsInterface(obj[0], name, interfaces)
    return `${itemType}[]`
  }
  if (typeof obj !== 'object') {
    return typeof obj
  }
  const entries = Object.entries(obj as Record<string, unknown>)
  const usedNames = new Set(interfaces.keys())
  const fields = entries.map(([key, val]) => {
    let typeName: string
    if (val === null) {
      typeName = 'null'
    } else if (Array.isArray(val)) {
      if (val.length > 0 && typeof val[0] === 'object' && val[0] !== null) {
        const childName = capitalize(camelCase(key)) + 'Item'
        const uniqueName = uniqueTypeName(childName, usedNames)
        usedNames.add(uniqueName)
        generateTsInterface(val[0], uniqueName, interfaces)
        typeName = `${uniqueName}[]`
      } else {
        typeName = `${generateTsInterface(val[0] ?? '', name, interfaces)}[]`
      }
    } else if (typeof val === 'object') {
      const childName = capitalize(camelCase(key))
      const uniqueName = uniqueTypeName(childName, usedNames)
      usedNames.add(uniqueName)
      typeName = generateTsInterface(val, uniqueName, interfaces)
    } else {
      typeName = typeof val
    }
    const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`
    return `  ${safeKey}: ${typeName};`
  })
  const interfaceStr = `export interface ${name} {\n${fields.join('\n')}\n}`
  interfaces.set(name, interfaceStr)
  return name
}

// ============ JSON → Java ============

export function jsonToJava(input: string, className: string = 'RootObject'): string {
  const obj = safeJsonParse(input)
  const classes: string[] = []
  generateJavaClass(obj, className, classes)
  return classes.join('\n\n') + '\n'
}

function generateJavaClass(obj: unknown, className: string, classes: string[]): void {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) return

  const entries = Object.entries(obj as Record<string, unknown>)
  const fields = entries.map(([key, val]) => {
    const type = javaType(val, capitalize(camelCase(key)), classes)
    const fieldName = camelCase(key)
    const annotation = fieldName !== key ? `  @JsonProperty("${key}")\n` : ''
    return `${annotation}  private ${type} ${fieldName};`
  })
  const classStr = `public class ${className} {\n${fields.join('\n')}\n}`
  classes.push(classStr)
}

function javaType(val: unknown, suggestedName: string, classes: string[]): string {
  if (val === null) return 'Object'
  if (typeof val === 'boolean') return 'Boolean'
  if (typeof val === 'number') return Number.isInteger(val) ? 'Integer' : 'Double'
  if (typeof val === 'string') return 'String'
  if (Array.isArray(val)) {
    if (val.length > 0 && typeof val[0] === 'object' && val[0] !== null) {
      generateJavaClass(val[0], suggestedName, classes)
      return `List<${suggestedName}>`
    }
    return 'List<Object>'
  }
  if (typeof val === 'object') {
    generateJavaClass(val, suggestedName, classes)
    return suggestedName
  }
  return 'Object'
}

// ============ JSON → Go Struct ============

export function jsonToGo(input: string, structName: string = 'RootObject'): string {
  const obj = safeJsonParse(input)
  const structs: string[] = []
  generateGoStruct(obj, structName, structs)
  return 'package main\n\n' + structs.join('\n\n') + '\n'
}

function generateGoStruct(obj: unknown, structName: string, structs: string[]): void {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) return

  const entries = Object.entries(obj as Record<string, unknown>)
  const fields = entries.map(([key, val]) => {
    const type = goType(val, capitalize(camelCase(key)), structs)
    const fieldName = capitalize(camelCase(key))
    // 确保字段名首字母大写（Go 的导出字段要求）
    const goFieldName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
    return `\t${goFieldName} ${type} \`json:"${key}"\``
  })
  const structStr = `type ${structName} struct {\n${fields.join('\n')}\n}`
  structs.push(structStr)
}

function goType(val: unknown, suggestedName: string, structs: string[]): string {
  if (val === null) return 'interface{}'
  if (typeof val === 'boolean') return 'bool'
  if (typeof val === 'number') return Number.isInteger(val) ? 'int' : 'float64'
  if (typeof val === 'string') return 'string'
  if (Array.isArray(val)) {
    if (val.length > 0 && typeof val[0] === 'object' && val[0] !== null) {
      generateGoStruct(val[0], suggestedName, structs)
      return `[]${suggestedName}`
    }
    return '[]interface{}'
  }
  if (typeof val === 'object') {
    generateGoStruct(val, suggestedName, structs)
    return suggestedName
  }
  return 'interface{}'
}

// ============ JSON Schema 生成 ============

export function jsonToSchema(input: string): string {
  const obj = safeJsonParse(input)
  const schema = generateSchema(obj)
  schema['$schema'] = 'http://json-schema.org/draft-07/schema#'
  return JSON.stringify(schema, null, 2)
}

function generateSchema(obj: unknown): Record<string, unknown> {
  if (obj === null) return { type: 'null' }
  if (typeof obj === 'boolean') return { type: 'boolean' }
  if (typeof obj === 'number') return { type: Number.isInteger(obj) ? 'integer' : 'number' }
  if (typeof obj === 'string') return { type: 'string' }
  if (Array.isArray(obj)) {
    const schema: Record<string, unknown> = { type: 'array' }
    if (obj.length > 0) {
      schema.items = generateSchema(obj[0])
    }
    return schema
  }
  if (typeof obj === 'object') {
    const entries = Object.entries(obj as Record<string, unknown>)
    const properties: Record<string, unknown> = {}
    const required: string[] = []
    for (const [key, val] of entries) {
      properties[key] = generateSchema(val)
      required.push(key)
    }
    return {
      type: 'object',
      properties,
      required,
    }
  }
  return { type: 'string' }
}

// ============ JSON Path 查询 ============

export function queryJsonPath(input: string, path: string): string {
  const obj = safeJsonParse(input)
  const result = resolvePath(obj, path)
  return JSON.stringify(result, null, 2)
}

function resolvePath(obj: unknown, path: string): unknown {
  if (!path || path === '$') return obj
  const parts = path.replace(/^\$\.?/, '').split(/\.|\[(\d+)\]/).filter(Boolean)
  let current: unknown = obj
  for (const part of parts) {
    if (current === null || current === undefined) return undefined
    if (/^\d+$/.test(part)) {
      current = (current as unknown[])[parseInt(part)]
    } else {
      current = (current as Record<string, unknown>)[part]
    }
  }
  return current
}

// ============ 辅助函数 ============

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function camelCase(s: string): string {
  return s.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '')
}

function uniqueTypeName(base: string, used: Set<string>): string {
  if (!used.has(base)) return base
  let i = 2
  while (used.has(`${base}${i}`)) i++
  return `${base}${i}`
}

// ============ 转换类型定义 ============

export type ConvertMode =
  | 'format'
  | 'minify'
  | 'yaml'
  | 'xml'
  | 'csv'
  | 'typescript'
  | 'java'
  | 'go'
  | 'schema'
  | 'path'

export interface ConvertAction {
  mode: ConvertMode
  label: string
  icon: string
  group: 'format' | 'convert' | 'code' | 'analyze'
}

export const CONVERT_ACTIONS: ConvertAction[] = [
  { mode: 'format', label: 'json.format', icon: '✨', group: 'format' },
  { mode: 'minify', label: 'json.minify', icon: '📦', group: 'format' },
  { mode: 'yaml', label: 'json.yaml', icon: '📄', group: 'convert' },
  { mode: 'xml', label: 'json.xml', icon: '🔖', group: 'convert' },
  { mode: 'csv', label: 'json.csv', icon: '📊', group: 'convert' },
  { mode: 'typescript', label: 'json.typescript', icon: '🔷', group: 'code' },
  { mode: 'java', label: 'json.java', icon: '☕', group: 'code' },
  { mode: 'go', label: 'json.go', icon: '🐹', group: 'code' },
  { mode: 'schema', label: 'json.schema', icon: '📐', group: 'analyze' },
  { mode: 'path', label: 'json.path', icon: '🔍', group: 'analyze' },
]

export function convert(input: string, mode: ConvertMode, pathQuery?: string): string {
  switch (mode) {
    case 'format': return formatJson(input)
    case 'minify': return minifyJson(input)
    case 'yaml': return jsonToYaml(input)
    case 'xml': return jsonToXml(input)
    case 'csv': return jsonToCsv(input)
    case 'typescript': return jsonToTypescript(input)
    case 'java': return jsonToJava(input)
    case 'go': return jsonToGo(input)
    case 'schema': return jsonToSchema(input)
    case 'path': return queryJsonPath(input, pathQuery || '$')
  }
}
