# Text Dedup User Guide

## Quick Start

### 1. Input Text

Enter text to deduplicate in the left input box, one per line:

```
apple
banana
Apple
cherry
banana
date
```

### 2. Select Separator

Select separator in the top toolbar:
- **Newline** - One per line (default)
- **Comma** - Comma separated
- **Space** - Space separated
- **Tab** - Tab separated
- **Semicolon** - Semicolon separated
- **Custom** - Enter custom separator

### 3. Configure Options

Check desired options:
- **Ignore case** - `Apple` and `apple` treated as same
- **Trim spaces** - Auto remove leading/trailing spaces
- **Remove empty** - Auto delete empty lines
- **Sort result** - Sort alphabetically after deduplication

### 4. View and Copy Result

Result automatically appears on the right. Click **📋 Copy** button to copy.

## Use Cases

### Clean Duplicate Emails

**Input:**
```
user1@example.com
user2@example.com
user1@example.com
user3@example.com
```

**Settings:**
- Separator: Newline
- Remove empty: ✓

**Output:**
```
user1@example.com
user2@example.com
user3@example.com
```

### Deduplicate Keywords

**Input:**
```
JavaScript, Python, Go, JavaScript, Java, Python
```

**Settings:**
- Separator: Comma
- Sort result: ✓

**Output:**
```
Go, Java, JavaScript, Python
```

### Case-Insensitive Deduplication

**Input:**
```
APPLE
banana
APPLE
Cherry
```

**Settings:**
- Separator: Newline
- Ignore case: ✓

**Output:**
```
APPLE
banana
Cherry
```

## Option Details

### Ignore Case

When checked, different cases are treated as same:
- `Apple` = `apple` = `APPLE`
- `Hello` = `hello` = `HELLO`

### Trim Spaces

Auto remove leading/trailing spaces and tabs from each line:
- `  John  ` → `John`
- `  Jane` → `Jane`

### Remove Empty

Auto delete empty lines or lines with only spaces:
- `` (empty line) → Deleted
- `   ` (only spaces) → Deleted

### Sort Result

Sort alphabetically after deduplication:
- Numbers: 1, 2, 10, 100
- Letters: Apple, Banana, Cherry
- Chinese: Sort by pinyin

## Usage Tips

### Process CSV Data

**Input:**
```
name,email,age
John,john@example.com,25
John,john@example.com,25
```

**Settings:**
- Separator: Newline
- Remove empty: ✓

**Output:**
```
name,email,age
John,john@example.com,25
```

### Process Tags

**Input:**
```
#JavaScript #Python #Go #JavaScript
```

**Settings:**
- Separator: Custom
- Custom separator: ` #` (space + #)
- Trim spaces: ✓

**Output:**
```
#Go #JavaScript #Python
```

## FAQ

**Q: Incomplete deduplication?**
A: Check:
- Is separator correct?
- Is "Ignore case" checked?
- Any hidden characters (spaces, tabs)?
- Try checking "Trim spaces"

**Q: Custom separator not working?**
A: Note:
- Custom separator is exact match
- Watch for spaces: ` ` and `  ` are different
- Special characters must be entered correctly

**Q: Large text processing slow?**
A: Suggest:
- Process in batches
- Disable unnecessary options
- Recommend max 100,000 lines per session

## Important Notes

⚠️ **Data Limits**
- Recommend max 100,000 lines per session
- Extra large data may cause browser lag

⚠️ **Data Security**
- All processing done locally in browser
- Data never uploaded to any server
