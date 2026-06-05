export interface TOCItem {
  level: number
  title: string
  anchor: string
  children: TOCItem[]
}

export class TOCGenerator {
  generate(html: string): TOCItem[] {
    const toc: TOCItem[] = []
    const stack: TOCItem[] = []

    const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h\1>/gi
    let match
    let anchorIndex = 0

    while ((match = headingRegex.exec(html)) !== null) {
      const level = parseInt(match[1])
      const title = this.stripHtmlTags(match[2])
      const anchor = `heading-${anchorIndex++}`

      const item: TOCItem = {
        level,
        title,
        anchor,
        children: []
      }

      while (stack.length > 0 && stack[stack.length - 1].level >= level) {
        stack.pop()
      }

      if (stack.length === 0) {
        toc.push(item)
      } else {
        stack[stack.length - 1].children.push(item)
      }

      stack.push(item)
    }

    return toc
  }

  private stripHtmlTags(html: string): string {
    return html.replace(/<[^>]*>/g, '').trim()
  }

  addAnchors(html: string): string {
    let anchorIndex = 0
    return html.replace(
      /<h([1-6])([^>]*)>(.*?)<\/h\1>/gi,
      (match, level, attrs, content) => {
        return `<h${level} id="heading-${anchorIndex++}"${attrs}>${content}</h${level}>`
      }
    )
  }
}
