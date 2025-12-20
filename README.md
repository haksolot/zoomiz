# <img src="./images/zoomiz.png" width="45" style="vertical-align: middle; margin-right: 10px;"> <span style="vertical-align: middle;">Zoomiz</span>

Zoomiz is a high-performance navigation tool for Visual Studio Code, inspired by the mechanics of Flash.nvim. It enables rapid cursor movement across the visible editor viewport without relying on the mouse or repetitive arrow key usage.

<br>
<p align="center">
  <img src="./images/zoomiz.gif" alt="Zoomiz Demo" width="700">
</p>

## Features

* **Rapid Navigation:** Jump to any word or specific location in the viewport instantly.
* **Superior Configurability:** Unlike other marketplace alternatives, Zoomiz offers granular control over every visual aspect and behavior, allowing it to seamlessly adapt to your specific workflow and theme.
* **Flexible Labeling:** Configure the jump characters exactly how you want. Concatenate uppercase letters, lowercase letters, or numbers to define the jump targets to your preference.
* **Flash.vim Inspiration:** Brings the efficiency of Vim-like search-and-jump navigation to the VS Code environment without the steep learning curve.

## Usage

1. Trigger Zoomiz using the default keybinding: `Alt` + `f`.
2. Type the characters you are looking for.
3. Zoomiz will overlay unique labels on all matches within the viewport.
4. Type the label characters to move the cursor to that location immediately.

## Configuration

You can customize Zoomiz by modifying your user `settings.json`.

### Appearance
Adjust the colors to match your theme or improve accessibility.

```json
"zoomiz.backgroundColor": "#ff007f",
"zoomiz.textColor": "#ffffff",
"zoomiz.matchColor": "#FFFF00"
```

### Character Set
Define the pool of characters used for generating jump labels. You can combine uppercase, lowercase, and numeric characters.

```json
// Example: Restrict to lowercase only
"zoomiz.characters": "abcdefghijklmnopqrstuvwxyz"

// Example: Use numbers and uppercase for specific keyboard layouts
"zoomiz.characters": "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ"
```

## Keybindings

| Command | Keybinding |
| :--- | :--- |
| `zoomiz.jump` | `Alt` + `f` |

You can remap this command via the Keyboard Shortcuts menu (`Ctrl`+`K` `Ctrl`+`S`) by searching for `zoomiz.jump`.

## Contributing

Found a bug or have a feature request? Feel free to open an issue or submit a pull request on GitHub.

## License

This project is licensed under the MIT License.