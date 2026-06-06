# Regex Tester User Guide

## Quick Start

### 1. Input Regex Pattern

Enter your regex pattern in the **Pattern** input box:

```
\d{4}-\d{2}-\d{2}
```

### 2. Set Flags (Optional)

Add modifiers in the flags input box:
- `g`: Global match (find all matches)
- `i`: Case-insensitive
- `m`: Multiline mode
- `s`: Dot matches newline
- `u`: Unicode mode

Example: `gi` means global and case-insensitive

### 3. Input Test Text

Enter text to test in the **Test Text** area:

```
Today is 2024-01-15
Tomorrow is 2024-01-16
```

### 4. View Match Results

- **Match Results**: Show all matched content
- **Capture Groups**: Show details of each capture group
- **Position**: Show position of each match in text

## Common Patterns

Click common pattern buttons at the top to quickly use:

| Pattern | Description | Example |
|---------|-------------|---------|
| `[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}` | Email | `user@example.com` |
| `1[3-9]\d{9}` | Phone (CN) | `13812345678` |
| `https?://[^\s]+` | URL | `https://www.example.com` |
| `\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}` | IPv4 | `192.168.1.1` |
| `[\u4e00-\u9fa5]+` | Chinese chars | `你好世界` |
| `\d{4}-\d{2}-\d{2}` | Date (YYYY-MM-DD) | `2024-01-15` |
| `#[0-9a-fA-F]{6}` | Hex color | `#FF5733` |

## Basic Syntax

| Symbol | Description | Example |
|--------|-------------|---------|
| `.` | Any character except newline | `a.c` matches "abc" |
| `\d` | Digit | `\d{3}` matches "123" |
| `\w` | Word character | `\w+` matches "user_123" |
| `\s` | Whitespace | `\s+` matches spaces, tabs |
| `*` | 0 or more times | `a*` matches "", "a", "aaa" |
| `+` | 1 or more times | `a+` matches "a", "aaa" |
| `?` | 0 or 1 time | `a?` matches "", "a" |
| `{n}` | Exactly n times | `\d{4}` matches "2024" |
| `{n,m}` | n to m times | `\d{1,3}` matches "1", "12", "123" |
| `[abc]` | Character set | `[abc]` matches "a" |
| `^` | Start of line | `^Hello` matches "Hello" at start |
| `$` | End of line | `World$` matches "World" at end |
| `()` | Capture group | `(ab)+` matches "abab" |
| `(?:)` | Non-capture group | `(?:ab)+` doesn't capture |
| `a\|b` | OR | `cat\|dog` matches "cat" or "dog" |

## Practical Examples

### Extract Email Addresses

**Pattern:**
```
\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b
```

**Flags:** `gi`

**Text:**
```
Contact us: support@example.com or sales@company.com
```

**Result:**
```
support@example.com
sales@company.com
```

### Match Dates

**Pattern:**
```
\d{4}-\d{2}-\d{2}
```

**Flags:** `g`

**Text:**
```
2024-01-15, 2024-02-20, 2024-03-25
```

**Result:**
```
2024-01-15
2024-02-20
2024-03-25
```

### Extract HTML Tag Content

**Pattern:**
```
<h[1-6]>(.*?)</h[1-6]>
```

**Flags:** `gis`

**Text:**
```
<h1>Title</h1><p>Content</p>
```

**Result:**
```
<h1>Title</h1>
```

## Usage Tips

### 1. Case-Insensitive Matching

Check `i` flag:
- `abc` matches "ABC", "Abc", "abc"

### 2. Match Newlines

Add `s` flag:
- `.` also matches newlines
- Or use `[\s\S]*` to match all characters

### 3. Match Chinese Characters

Use Unicode mode:
- Add `u` flag
- Use `[\u4e00-\u9fa5]` to match Chinese

### 4. Avoid Greedy Matching

Use non-greedy quantifiers:
- `.*?` instead of `.*`
- `.+?` instead of `.+`

## FAQ

**Q: Pattern not matching?**
A: Check:
- Escape characters: `.`, `*`, `?` need `\` to escape
- Bracket matching: Check if `()`, `[]`, `{}` are paired
- Flags: Add `g` flag for global matching

**Q: Incomplete match results?**
A: Possible reasons:
- Missing `g` flag (only matches first)
- Pattern too strict, try relaxing conditions
- Use `.*` or `.+` to match more content

**Q: How to match special characters?**
A: Use escape character:
- `\.` matches dot
- `\\` matches backslash
- `\*` matches asterisk
