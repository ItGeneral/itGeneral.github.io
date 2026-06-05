import { marked } from 'marked'
import { Sanitizer } from './Sanitizer'
import { ImagePaste } from '../Editor/ImagePaste'

export class MarkdownRenderer {
  private imagePaste: ImagePaste

  constructor() {
    this.imagePaste = new ImagePaste()
    this.configureMarked()
  }

  private configureMarked(): void {
    marked.setOptions({
      gfm: true,
      breaks: false,
      pedantic: false,
      sanitize: false,
      smartLists: true,
      smartypants: false
    })
  }

  async render(markdown: string): Promise<string> {
    const processed = await this.processImages(markdown)
    const html = marked(processed) as string
    return Sanitizer.sanitize(html)
  }

  private async processImages(markdown: string): Promise<string> {
    return markdown.replace(
      /!\[([^\]]*)\]\(uuid:\/\/([^)]+)\)/g,
      async (match, alt, id) => {
        const base64 = await this.imagePaste.loadImage(id)
        if (base64) {
          return `![${alt}](${base64})`
        }
        return `![${alt}](data:image/svg+xml;base64,${this.placeholderSVG()})`
      }
    )
  }

  private placeholderSVG(): string {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="100">
      <rect width="200" height="100" fill="#f0f0f0"/>
      <text x="100" y="50" font-size="14" text-anchor="middle" fill="#999">图片加载失败</text>
    </svg>`
    return btoa(svg)
  }
}
