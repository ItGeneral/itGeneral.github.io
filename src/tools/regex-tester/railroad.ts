/**
 * Simple Regex Railroad Diagram Renderer
 * Parses regex into AST and renders SVG railroad diagram
 */

interface Node {
  type: string
  [key: string]: any
}

interface RenderResult {
  width: number
  height: number
  svg: string
}

// ── Parser ──

class RegexParser {
  pos = 0
  src: string

  constructor(src: string) {
    this.src = src
  }

  parse(): Node {
    return this.parseAlt()
  }

  peek(): string {
    return this.src[this.pos] || ''
  }

  match(ch: string): boolean {
    if (this.peek() === ch) { this.pos++; return true }
    return false
  }

  parseAlt(): Node {
    const terms: Node[] = [this.parseConcat()]
    while (this.peek() === '|' && this.pos < this.src.length) {
      this.pos++
      terms.push(this.parseConcat())
    }
    if (terms.length === 1) return terms[0]
    return { type: 'alt', branches: terms }
  }

  parseConcat(): Node {
    const nodes: Node[] = []
    while (this.pos < this.src.length && this.peek() !== '|' && this.peek() !== ')') {
      nodes.push(this.parseQuant())
    }
    if (nodes.length === 1) return nodes[0]
    return { type: 'concat', parts: nodes }
  }

  parseQuant(): Node {
    let atom = this.parseAtom()
    if (!atom) return { type: 'empty' }

    if (this.peek() === '{') {
      const start = this.pos
      this.pos++
      let min = ''
      while (/\d/.test(this.peek())) { min += this.peek(); this.pos++ }
      let max = min
      if (this.peek() === ',') {
        this.pos++
        max = ''
        while (/\d/.test(this.peek())) { max += this.peek(); this.pos++ }
        if (max === '') max = '∞'
      }
      if (this.peek() === '}') { this.pos++ }
      else { this.pos = start; return atom }
      return { type: 'repeat', atom, min, max }
    }

    if (this.match('*')) return { type: 'repeat', atom, min: '0', max: '∞' }
    if (this.match('+')) return { type: 'repeat', atom, min: '1', max: '∞' }
    if (this.match('?')) return { type: 'repeat', atom, min: '0', max: '1' }

    return atom
  }

  parseAtom(): Node | null {
    if (this.pos >= this.src.length) return null
    const ch = this.peek()

    if (this.match('^')) return { type: 'anchor', value: '^' }
    if (this.match('$')) return { type: 'anchor', value: '$' }
    if (this.match('.')) return { type: 'any' }

    if (this.match('(')) {
      const isCapture = this.peek() !== '?' || (this.peek() === '?' && this.src[this.pos + 1] !== ':')
      if (this.src[this.pos] === '?' && this.src[this.pos + 1] === ':') { this.pos += 2 }
      const body = this.parseAlt()
      this.match(')')
      return { type: 'group', capture: isCapture, body }
    }

    if (this.match('[')) {
      let negated = false
      if (this.match('^')) negated = true
      const chars: string[] = []
      while (this.pos < this.src.length && this.peek() !== ']') {
        let c = this.peek()
        if (c === '\\') {
          c = this.src[++this.pos] || ''
        }
        this.pos++
        if (this.peek() === '-' && this.src[this.pos + 1] !== ']') {
          this.pos++
          let end = this.peek()
          if (end === '\\') { end = this.src[++this.pos] || '' }
          this.pos++
          chars.push(`${c}-${end}`)
        } else {
          chars.push(c)
        }
      }
      this.match(']')
      return { type: 'charclass', negated, chars }
    }

    if (ch === '\\') {
      this.pos++
      const esc = this.peek()
      this.pos++
      return { type: 'escape', value: esc }
    }

    this.pos++
    return { type: 'char', value: ch }
  }
}

// ── Renderer ──

const SVG_NS = 'http://www.w3.org/2000/svg'
const CHAR_W = 8
const LINE_H = 36
const PADDING = 20
const BOX_PADDING_X = 8

let cursorX = PADDING
let cursorY = LINE_H
let minY = LINE_H
let maxY = LINE_H

function escapeLabel(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function measureText(s: string): number {
  return s.length * CHAR_W + BOX_PADDING_X * 2
}

function drawText(svg: string[], x: number, y: number, text: string, cls = ''): number {
  const w = measureText(text)
  svg.push(`<rect x="${x}" y="${y - 12}" width="${w}" height="${LINE_H - 12}" rx="4" class="rd-box ${cls}"/>`)
  svg.push(`<text x="${x + w / 2}" y="${y + 4}" text-anchor="middle" class="rd-text ${cls}">${escapeLabel(text)}</text>`)
  return w
}

function drawLine(svg: string[], x1: number, y1: number, x2: number, y2: number): void {
  if (y1 === y2) {
    svg.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="rd-line"/>`)
  } else {
    svg.push(`<path d="M${x1},${y1} L${x1},${(y1 + y2) / 2} L${x2},${(y1 + y2) / 2} L${x2},${y2}" class="rd-line"/>`)
  }
}

function renderNode(node: Node, svg: string[]): { width: number } {
  switch (node.type) {
    case 'empty':
      return { width: 0 }

    case 'char': {
      const w = drawText(svg, cursorX, cursorY, node.value)
      cursorX += w
      return { width: w }
    }

    case 'anchor': {
      const w = drawText(svg, cursorX, cursorY, node.value, 'rd-anchor')
      cursorX += w
      return { width: w }
    }

    case 'any': {
      const w = drawText(svg, cursorX, cursorY, 'any', 'rd-special')
      cursorX += w
      return { width: w }
    }

    case 'escape': {
      const escapeMap: Record<string, string> = {
        d: 'digit', D: 'non-digit',
        w: 'word', W: 'non-word',
        s: 'space', S: 'non-space',
        b: 'word boundary', B: 'non-boundary',
        n: '\\n', t: '\\t', r: '\\r',
      }
      const label = escapeMap[node.value] || ('\\' + node.value)
      const w = drawText(svg, cursorX, cursorY, label, 'rd-special')
      cursorX += w
      return { width: w }
    }

    case 'charclass': {
      const label = `[${node.negated ? '^' : ''}${node.chars.join('')}]`
      const w = drawText(svg, cursorX, cursorY, label, 'rd-class')
      cursorX += w
      return { width: w }
    }

    case 'group': {
      const prefix = node.capture ? '(' : '(?:'
      const w1 = drawText(svg, cursorX, cursorY, prefix, 'rd-group')
      cursorX += w1
      const innerW = renderNode(node.body, svg).width
      const w2 = drawText(svg, cursorX, cursorY, ')', 'rd-group')
      cursorX += w2
      return { width: w1 + innerW + w2 }
    }

    case 'concat': {
      let totalW = 0
      for (const part of node.parts) {
        totalW += renderNode(part, svg).width
      }
      return { width: totalW }
    }

    case 'alt': {
      const startX = cursorX
      const branchWidths: number[] = []
      const branches: Node[] = node.branches
      const centerY = cursorY

      for (let i = 0; i < branches.length; i++) {
        cursorY = centerY + (i - (branches.length - 1) / 2) * LINE_H
        if (cursorY < minY) minY = cursorY
        if (cursorY > maxY) maxY = cursorY
        cursorX = startX + 20
        drawLine(svg, startX, centerY, startX + 20, cursorY)
        const w = renderNode(branches[i], svg).width
        branchWidths.push(w)
      }

      const maxW = Math.max(...branchWidths, 0)
      const endX = startX + 20 + maxW

      for (let i = 0; i < branches.length; i++) {
        const branchY = centerY + (i - (branches.length - 1) / 2) * LINE_H
        const branchEndX = startX + 20 + branchWidths[i]
        drawLine(svg, branchEndX, branchY, endX, branchY)
      }

      cursorX = endX
      cursorY = centerY
      return { width: 20 + maxW }
    }

    case 'repeat': {
      const startX = cursorX
      const innerW = renderNode(node.atom, svg).width
      const endX = cursorX
      let label = ''
      if (node.min === '0' && node.max === '1') label = '?'
      else if (node.min === '0' && node.max === '∞') label = '*'
      else if (node.min === '1' && node.max === '∞') label = '+'
      else if (node.min === node.max) label = `{${node.min}}`
      else label = `{${node.min},${node.max}}`

      const loopY = cursorY - LINE_H + 8

      // Draw loop arrow above
      svg.push(`<path d="M${startX},${cursorY - 14} Q${startX + innerW / 2},${loopY} ${endX - 2},${cursorY - 14}" class="rd-loop" fill="none"/>`)
      svg.push(`<text x="${startX + innerW / 2}" y="${loopY + 2}" text-anchor="middle" class="rd-loop-text">${label}</text>`)

      return { width: innerW }
    }

    default:
      return { width: 0 }
  }
}

export function renderRailroad(pattern: string): RenderResult | null {
  try {
    const parser = new RegexParser(pattern)
    const ast = parser.parse()

    // First pass: measure
    cursorX = PADDING
    cursorY = LINE_H
    minY = LINE_H
    maxY = LINE_H
    const measureSvg: string[] = []
    renderNode(ast, measureSvg)
    const height = maxY + LINE_H

    // Second pass: render
    cursorX = PADDING
    cursorY = LINE_H
    minY = LINE_H
    maxY = LINE_H
    const svg: string[] = []

    // Start line
    svg.push(`<line x1="0" y1="${LINE_H}" x2="${PADDING}" y2="${LINE_H}" class="rd-line"/>`)

    renderNode(ast, svg)

    // End line
    svg.push(`<line x1="${cursorX}" y1="${LINE_H}" x2="${cursorX + 30}" y2="${LINE_H}" class="rd-line"/>`)
    svg.push(`<circle cx="${cursorX + 30}" cy="${LINE_H}" r="4" class="rd-end"/>`)

    const finalWidth = cursorX + 50
    const yOffset = minY < 0 ? Math.abs(minY) : 0
    const finalHeight = height + yOffset + 10

    const svgStr = `<svg xmlns="${SVG_NS}" width="${finalWidth}" height="${finalHeight}" viewBox="0 0 ${finalWidth} ${finalHeight}">
  <g transform="translate(0, ${yOffset})">
  <style>
    .rd-line { stroke: #555; stroke-width: 1.5; fill: none; }
    .rd-box { fill: #e8f0fe; stroke: #4285f4; stroke-width: 1; }
    .rd-text { font-family: monospace; font-size: 13px; fill: #333; dominant-baseline: middle; }
    .rd-special { fill: #fef7e0; stroke: #f9ab00; }
    .rd-special + .rd-text, .rd-text.rd-special { }
    .rd-class { fill: #e6f4ea; stroke: #34a853; }
    .rd-class + .rd-text { }
    .rd-anchor { fill: #fce8e6; stroke: #ea4335; }
    .rd-group { fill: #f3e8fd; stroke: #9334e6; }
    .rd-loop { stroke: #9334e6; stroke-width: 1.5; stroke-dasharray: 3,2; }
    .rd-loop-text { font-family: monospace; font-size: 10px; fill: #9334e6; }
    .rd-end { fill: #4285f4; }
  </style>
  ${svg.join('\n  ')}
  </g>
</svg>`

    return { width: finalWidth, height: height + 10, svg: svgStr }
  } catch (e) {
    return null
  }
}
