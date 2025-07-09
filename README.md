# PR Description Updater

A GitHub Action that updates pull request descriptions using regex patterns for content matching and replacement. This action allows you to dynamically update PR descriptions with content from files or direct text input, supporting various regex matching strategies.

## Features

- **Regex-based content replacement**: Replace specific sections of PR descriptions using regex patterns
- **Content from files or direct input**: Use file contents or direct text as the new content
- **Flexible matching options**: Support for case-insensitive, global, multiline, and other regex flags
- **Conditional updates**: Only update PR descriptions when specific patterns are found
- **Content extraction**: Extract specific parts from content using regex before updating
- **Automatic PR detection**: Works with PR events or commit-based PR lookup

## Inputs

| Input                      | Description                                                                          | Required | Default |
| -------------------------- | ------------------------------------------------------------------------------------ | -------- | ------- |
| `content`                  | Content to use for PR description update or file path if `contentIsFilePath` is true | Yes      | -       |
| `contentIsFilePath`        | Whether content input is a file path (`true`) or direct content (`false`)            | No       | `false` |
| `contentRegex`             | Regex pattern to extract specific content from the content input                     | No       | `""`    |
| `contentRegexFlags`        | Regex flags for `contentRegex` (e.g., `g`, `i`, `m`, `s`)                            | No       | `""`    |
| `regex`                    | Regex pattern to match in PR body for replacement                                    | No       | `---.*` |
| `regexFlags`               | Regex flags for regex pattern (e.g., `g`, `i`, `m`, `s`)                             | No       | `""`    |
| `appendContentOnMatchOnly` | Only update PR body if regex matches (`true`) or always update (`false`)             | No       | `false` |
| `token`                    | GitHub token for API access                                                          | Yes      | -       |

## Usage Examples

### Basic Usage - Replace Default Pattern

```yaml
name: Update PR Description
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  update-description:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Update PR Description
        uses: step-security/update-pr-description@v1
        with:
          content: |
            ## Summary
            This PR implements new features and bug fixes.

            ## Changes
            - Added new functionality
            - Fixed existing issues
          token: ${{ secrets.GITHUB_TOKEN }}
```

### Advanced Usage - File-based Content with Regex

```yaml
name: Update PR Description from File
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  update-description:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Update PR Description
        uses: step-security/update-pr-description@v1
        with:
          content: .github/pr-template.md
          contentIsFilePath: true
          regex: '## Description.*?(?=##|$)'
          regexFlags: 's'
          appendContentOnMatchOnly: true
          token: ${{ secrets.GITHUB_TOKEN }}
```

### Extract Content with Regex

```yaml
name: Extract and Update PR Description
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  update-description:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Update PR Description
        uses: step-security/update-pr-description@v1
        with:
          content: |
            <!-- START_EXTRACT -->
            ## Important Changes
            This section will be extracted and used.
            <!-- END_EXTRACT -->
            This content will be ignored.
          contentRegex: '<!-- START_EXTRACT -->(.*?)<!-- END_EXTRACT -->'
          contentRegexFlags: 's'
          regex: '---.*'
          token: ${{ secrets.GITHUB_TOKEN }}
```

### Case-Insensitive Global Replacement

```yaml
name: Global Case-Insensitive Update
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  update-description:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Update PR Description
        uses: step-security/update-pr-description@v1
        with:
          content: '**UPDATED**'
          regex: 'todo'
          regexFlags: 'gi'
          token: ${{ secrets.GITHUB_TOKEN }}
```

### Conditional Update Only on Match

```yaml
name: Conditional PR Description Update
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  update-description:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Update PR Description
        uses: step-security/update-pr-description@v1
        with:
          content: |
            ## Automated Update
            This PR has been automatically updated.
          regex: '\[AUTO-UPDATE\]'
          appendContentOnMatchOnly: true
          token: ${{ secrets.GITHUB_TOKEN }}
```

## How It Works

1. **PR Detection**: The action first identifies the pull request number from the event context or by looking up PRs associated with the current commit
2. **Content Preparation**: Loads content from direct input or file, then optionally extracts specific parts using `contentRegex`
3. **Pattern Matching**: Tests the current PR description against the specified `regex` pattern
4. **Content Update**: Based on the match result and `appendContentOnMatchOnly` setting:
   - If pattern matches: Replaces the matched section with new content
   - If no match and `appendContentOnMatchOnly` is `false`: Appends content to existing description or sets as new description if empty
   - If no match and `appendContentOnMatchOnly` is `true`: Skips the update

## Regex Flags

Common regex flags you can use:

- `g` - Global: Replace all matches, not just the first one
- `i` - Case-insensitive: Ignore case when matching
- `m` - Multiline: `^` and `$` match start/end of lines
- `s` - Dotall: `.` matches newline characters

## License

This project is licensed under the MIT License.
