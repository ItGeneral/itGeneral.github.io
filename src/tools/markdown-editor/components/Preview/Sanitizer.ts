import DOMPurify from 'dompurify'

const ALLOWED_TAGS = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'br', 'strong', 'em', 'code', 'pre',
  'a', 'img', 'ul', 'ol', 'li',
  'blockquote', 'table', 'thead', 'tbody',
  'tr', 'th', 'td', 'hr', 'del', 's',
  'div', 'span', 'svg', 'path', 'rect',
  'circle', 'ellipse', 'line', 'polygon',
  'polyline', 'text', 'g', 'foreignObject'
]

const ALLOWED_ATTR = [
  'href', 'src', 'alt', 'title', 'target',
  'rel', 'class', 'id', 'width', 'height',
  'viewBox', 'xmlns', 'fill', 'stroke',
  'stroke-width', 'd', 'cx', 'cy', 'r',
  'x', 'y', 'x1', 'y1', 'x2', 'y2',
  'points', 'transform', 'text-anchor',
  'font-size', 'font-family', 'font-weight',
  'dominant-baseline', 'text-anchor', 'fill-opacity',
  'stroke-opacity', 'stroke-linecap', 'stroke-linejoin',
  'stroke-dasharray', 'marker-end', 'marker-start',
  'filter', 'opacity', 'rx', 'ry', 'preserveAspectRatio',
  'stroke-dashoffset', 'clip-path', 'mask', 'style',
  'text-decoration', 'cursor', 'visibility', 'display',
  'color', 'background-color', 'font-style', 'text-transform'
]

export class Sanitizer {
  static sanitize(html: string): string {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS,
      ALLOWED_ATTR,
      ALLOW_DATA_ATTR: false,
      ALLOW_UNKNOWN_PROTOCOLS: false,
      ALLOW_CSS: true,
      ALLOW_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
      ADD_ATTR: [
        'data-*',
        'aria-*',
        'role',
        'xml:*',
        'xlink:*'
      ],
      ADD_TAGS: [
        'defs',
        'marker',
        'linearGradient',
        'radialGradient',
        'stop',
        'pattern',
        'mask',
        'clipPath',
        'use',
        'image',
        'animate',
        'animateTransform',
        'animateMotion',
        'mpath',
        'set',
        'feMerge',
        'feMergeNode',
        'feDropShadow',
        'filter'
      ]
    })
  }

  static isSafe(html: string): boolean {
    const sanitized = this.sanitize(html)
    return sanitized === html
  }
}
