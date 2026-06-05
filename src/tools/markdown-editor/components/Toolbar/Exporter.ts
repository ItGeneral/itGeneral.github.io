import type { ExportOptions } from '../../types'

export class Exporter {
  exportHTML(markdown: string, styles: string, filename: string = 'document.html'): void {
    const previewEl = document.querySelector('.preview-content')
    const renderedHtml = previewEl?.innerHTML || markdown

    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exported Document</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      line-height: 1.6;
    }
    ${styles}
    @media print {
      body { background: white; }
      .preview-content { max-width: 100%; margin: 0; padding: 20px; }
      .preview-content pre { white-space: pre-wrap; word-wrap: break-word; }
      .preview-content table, .preview-content pre, .preview-content blockquote { page-break-inside: avoid; }
      .preview-content h1, .preview-content h2, .preview-content h3 { page-break-after: avoid; }
    }
  </style>
</head>
<body>
  <div class="preview-content">
    ${renderedHtml}
  </div>
  <script>
    document.querySelectorAll('a[href^="http"]').forEach(link => {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    });
    function printDocument() { window.print(); }
    document.addEventListener('keydown', function(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') { e.preventDefault(); printDocument(); }
    });
  </script>
</body>
</html>`

    this.downloadFile(filename, html, 'text/html')
  }

  exportMarkdown(content: string, filename: string = 'document.md'): void {
    this.downloadFile(filename, content, 'text/markdown')
  }

  private downloadFile(filename: string, content: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}
