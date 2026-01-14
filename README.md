# <img src="./images/zoomiz.png" width="45" style="vertical-align: middle; margin-right: 10px;"> <span style="vertical-align: middle;">Zoomiz</span>

Zoomiz is a high-performance navigation tool for Visual Studio Code, inspired by the mechanics of Flash.nvim. It enables rapid cursor movement across the visible editor viewport without relying on the mouse or repetitive arrow key usage.

<br>
<p align="center">
  <img src="./images/zoomiz.gif" alt="Zoomiz Demo" width="700">
</p>

## Features

* **Rapid Navigation:** Jump to any word or specific location in the viewport instantly.
* **Extend Selection:** Seamlessly extend your text selection from your current position to any jump target.
* **Vim Integration:** Designed to work flawlessly with VSCode Vim. 
    * Press `s` in Normal mode to jump.
    * Press `s` in Visual mode to extend the selection to the jump target.
* **Superior Configurability:** Granular control over every visual aspect (colors, borders) and behavior (case sensitivity, labels).
* **Flash.vim Inspiration:** Brings the efficiency of Vim-like search-and-jump navigation to the VS Code environment.

## Usage

### Basic Jumping
1. Trigger Zoomiz using the default keybinding: `Alt` + `f` (or `s` in Vim Normal mode).
2. Type the characters you are looking for.
3. Zoomiz will overlay unique labels on all matches within the viewport.
4. Type the label characters to move the cursor to that location immediately.

### Extending Selection
1. Trigger Zoomiz using `Alt` + `Shift` + `f` (or `s` in Vim Visual mode).
2. Follow the same search-and-jump process.
3. The selection will be extended from your starting point to the end of the target match.

*Note: If `zoomiz.extendWhenSelected` is enabled (default), triggering a standard jump while text is already selected will automatically switch to "Extend Selection" mode.*

## Configuration

You can customize Zoomiz by modifying your user `settings.json`.

### Behavior

```json
"zoomiz.searchCaseSensitive": true, // Match case when searching
"zoomiz.extendWhenSelected": true   // Automatically extend selection if text is already selected when jumping
```

### Appearance
Adjust the colors to match your theme.

```json
"zoomiz.matchBackgroundColor": "#f9e2af4D",
"zoomiz.matchBorderColor": "#f9e2af80",

"zoomiz.labelBackgroundColor": "#cba6f7",
"zoomiz.labelForegroundColor": "#1e1e2e",
"zoomiz.labelBorderColor": "#cba6f7"
```

### Character Set
Define the pool of characters used for generating jump labels.

```json
"zoomiz.labelCharset": "flash" // Options: "flash", "uppercase", "lowercase", "numeric"
```

## Keybindings

| Command | Keybinding | Context |
| :--- | :--- | :--- |
| `zoomiz.jump` | `Alt` + `f` | Editor Focus |
| `zoomiz.extendSelection` | `Alt` + `Shift` + `f` | Editor Focus |
| `zoomiz.jump` | `s` | Vim Normal Mode |
| `zoomiz.jump` | `s` | Vim Visual Mode (Extends selection) |

You can remap these commands via the Keyboard Shortcuts menu (`Ctrl`+`K` `Ctrl`+`S`) by searching for `zoomiz.jump` or `zoomiz.extendSelection`.

## Contributing

Found a bug or have a feature request? Feel free to open an issue or submit a pull request on GitHub.

## License

This project is licensed under the MIT License.
