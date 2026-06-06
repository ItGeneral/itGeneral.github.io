# Markdown Editor User Guide

## Quick Start

### 1. Create Document

Click **+ Markdown Docs** button in left sidebar to create a new document.

### 2. Edit Document

Type Markdown content in the left editor. Preview updates in real-time on the right.

### 3. Auto Save

Content is automatically saved to local browser storage.

## Markdown Basic Syntax

### Headings

```markdown
# Heading 1
## Heading 2
### Heading 3
```

### Text Styles

```markdown
**Bold text**
*Italic text*
~~Strikethrough text==
`Inline code`
```

### Lists

**Unordered List:**
```markdown
- Item 1
- Item 2
  - Subitem
```

**Ordered List:**
```markdown
1. First item
2. Second item
```

### Links and Images

```markdown
[Link text](https://example.com)
![Image description](https://example.com/image.jpg)
```

### Blockquotes

```markdown
> This is a quote
>
> Can be multiple lines
```

### Code Blocks

````markdown
```javascript
function hello() {
  console.log('Hello!');
}
```
````

### Tables

```markdown
| Column 1 | Column 2 |
|----------|----------|
| Data 1   | Data 2   |
```

### Task Lists

```markdown
- [x] Completed task
- [ ] Incomplete task
```

## Manage Documents

### Create Document
Click **+ Markdown Docs** button

### Switch Document
Click document item in left sidebar

### Rename Document
1. Hover over document item
2. Click **✎** icon
3. Enter new name
4. Press Enter to confirm

### Delete Document
1. Hover over document item
2. Click **×** icon
3. Confirm deletion

## View Statistics

Bottom status bar shows:
- **Words**: Total word count
- **Chars**: Total character count
- **Lines**: Total line count
- **Read time**: Estimated reading time

## Usage Tips

### Quick Formatting

#### Code Blocks
Type ``` ` ``` ``` followed by language name, like:
```javascript
```

#### Quick Lists
Type `- ` or `1. ` followed by space to auto-create list.

#### Quick Headings
Type `# ` followed by space to auto-create heading.

### Nested Lists

Use Tab key for nesting:
```markdown
- Level 1 item
  - Level 2 item
    - Level 3 item
```

### Escape Characters

Use `\` to escape special characters:
```markdown
\* Not italic
\[ Not link
```

## Important Notes

⚠️ **Data Security**
- Documents stored in browser LocalStorage
- Clearing browser data will lose documents
- Recommend regular export of important documents

⚠️ **Compatibility**
- Supports CommonMark standard
- Supports GitHub Flavored Markdown (GFM)
- Some advanced features may not be fully supported

## FAQ

**Q: Edit and preview not synced?**
A: Check:
- Is Markdown syntax correct?
- Any unmatched brackets?
- Do special characters need escaping?

**Q: Code highlighting not working?**
A: Ensure code block language identifier is correct:
- Use `javascript` not `js`
- Use `python` not `py`
- Language names in lowercase

**Q: Table display messed up?**
A: Check table format:
- Column separators `|` must be aligned
- Must have `|------|` separator between header and content
- Each row must have same number of columns

**Q: Document lost?**
A: Possible reasons:
- Cleared browser cache
- Used incognito/private mode
- Browser storage limit reached

**Prevention:**
- Regularly export documents
- Use multiple browsers
- Enable browser sync
