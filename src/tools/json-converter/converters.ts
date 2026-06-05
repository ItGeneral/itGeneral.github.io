/**
 * JSON 转换工具函数集合
 */

// ============ 格式化 / 压缩 ============

export function formatJson(input: string, indent: number = 2): string {
  const obj = JSON.parse(input)
  return JSON.stringify(obj, null, indent)
}

export function minifyJson(input: string): string {
  const obj = JSON.parse(input)
  return JSON.stringify(obj)
}

// ============ JSON → YAML ============

export function jsonToYaml(input: string): string {
  const obj = JSON.parse(input)
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
  const obj = JSON.parse(input)
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
  const arr = JSON.parse(input)
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
  const obj = JSON.parse(input)
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
  const obj = JSON.parse(input)
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
  const obj = JSON.parse(input)
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
    return `\t${fieldName} ${type} \`json:"${key}"\``
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
  const obj = JSON.parse(input)
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
  const obj = JSON.parse(input)
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
