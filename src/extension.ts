import * as vscode from 'vscode';

// Label charsets
const CHARSETS = {
    flash: 'asdfjklghqwertyuiopzxcvbnmASDFJKLGHQWERTYUIOPZXCVBNM',
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numeric: '0123456789'
};

interface JumpTarget {
    editor: vscode.TextEditor;
    range: vscode.Range;
    label: string;
}

export function activate(context: vscode.ExtensionContext) {

    const jumpCommand = vscode.commands.registerCommand('zoomiz.jump', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            startZoomiz([editor]);
        }
    });

    const jumpAllCommand = vscode.commands.registerCommand('zoomiz.jumpAll', () => {
        const editors = vscode.window.visibleTextEditors;
        if (editors.length > 0) {
            startZoomiz(editors);
        }
    });

    context.subscriptions.push(jumpCommand, jumpAllCommand);
}

function startZoomiz(editors: readonly vscode.TextEditor[]) {
    // Load Settings
    const config = vscode.workspace.getConfiguration('zoomiz');
    const charsetMode = config.get<string>('labelCharset', 'flash') as keyof typeof CHARSETS;
    const jumpLabels = CHARSETS[charsetMode] || CHARSETS.flash;
    const isCaseSensitive = config.get<boolean>('searchCaseSensitive', false);
    
    // Dynamic Decoration Styles
    const matchDecorationType = vscode.window.createTextEditorDecorationType({
        backgroundColor: config.get('matchBackgroundColor'),
        border: `1px solid ${config.get('matchBorderColor')}`
    });

    const labelDecorationType = vscode.window.createTextEditorDecorationType({
        after: {
            margin: '0 0 0 0',
            fontWeight: 'bold',
            color: config.get('labelForegroundColor'),
            backgroundColor: config.get('labelBackgroundColor'),
            height: '100%',
            border: `1px solid ${config.get('labelBorderColor')}`,
            width: '1em'
        }
    });

    const inputBox = vscode.window.createInputBox();
    inputBox.title = "Zoomiz";
    inputBox.placeholder = `Search... (Labels: ${charsetMode}, Case Sensitive: ${isCaseSensitive})`;
    inputBox.show();

    let currentTargets: JumpTarget[] = [];

    const executeJump = (target: JumpTarget) => {
        // If target is in another editor, focus it
        if (vscode.window.activeTextEditor !== target.editor) {
            vscode.window.showTextDocument(target.editor.document, target.editor.viewColumn);
        }
        
        target.editor.selection = new vscode.Selection(target.range.start, target.range.start);
        target.editor.revealRange(target.range);
        inputBox.hide();
    };

    inputBox.onDidChangeValue((value) => {
        if (!value) {
            // Clear everything if input is empty
            editors.forEach(editor => {
                editor.setDecorations(matchDecorationType, []);
                editor.setDecorations(labelDecorationType, []);
            });
            currentTargets = [];
            return;
        }

        const lastChar = value.slice(-1);
        
        // 1. PERFORM SEARCH FIRST
        const query = value; 
        
        // Helper to find matches in a single editor
        const findMatchesInEditor = (editor: vscode.TextEditor, searchQuery: string) => {
            const results: JumpTarget[] = [];
            if (searchQuery.length === 0) {
                return results;
            }
            
            const visibleRanges = editor.visibleRanges;
            const text = editor.document.getText();
            const finalQuery = isCaseSensitive ? searchQuery : searchQuery.toLowerCase();

            for (const range of visibleRanges) {
                const startOffset = editor.document.offsetAt(range.start);
                const endOffset = editor.document.offsetAt(range.end);
                const rawRangeText = text.substring(startOffset, endOffset);
                const compareText = isCaseSensitive ? rawRangeText : rawRangeText.toLowerCase();

                let index = compareText.indexOf(finalQuery);
                while (index !== -1) {
                    const absoluteOffset = startOffset + index;
                    const pos = editor.document.positionAt(absoluteOffset);
                    const matchRange = new vscode.Range(pos, editor.document.positionAt(absoluteOffset + searchQuery.length));
                    
                    results.push({ editor, range: matchRange, label: '' });
                    index = compareText.indexOf(finalQuery, index + 1);
                }
            }
            return results;
        };

        // Gather all matches from all editors
        let allSearchResults: JumpTarget[] = [];
        for (const editor of editors) {
            allSearchResults = allSearchResults.concat(findMatchesInEditor(editor, query));
        }

        // 2. DECIDE: IS IT A JUMP OR A SEARCH?
        let isJump = false;
        let targetLabel = '';

        if (charsetMode === 'uppercase') {
             if (jumpLabels.includes(lastChar)) {
                 isJump = true;
                 targetLabel = lastChar;
             }
        } else {
            if (allSearchResults.length > 0) {
                isJump = false;
            } else {
                const potentialMatch = currentTargets.find(t => t.label === lastChar);
                if (potentialMatch) {
                    isJump = true;
                    targetLabel = lastChar;
                }
            }
        }

        // EXECUTE JUMP
        if (isJump) {
            const target = currentTargets.find(t => t.label === targetLabel);
            if (target) {
                executeJump(target);
                return;
            }
        }

        // UPDATE STATE (If not jumped)
        currentTargets = [];
        let labelIndex = 0;

        // Collect forbidden characters from all matches in all editors
        const forbiddenChars = new Set<string>();
        for (const target of allSearchResults) {
            const text = target.editor.document.getText();
            const endOffset = target.editor.document.offsetAt(target.range.end);
            if (endOffset < text.length) {
                const char = text.charAt(endOffset);
                forbiddenChars.add(isCaseSensitive ? char : char.toLowerCase());
            }
        }

        for (const target of allSearchResults) {
            if (labelIndex >= jumpLabels.length) {
                break;
            }

            let candidateLabel = jumpLabels[labelIndex];

            // Skip label if it conflicts with any possible search continuation
            while (candidateLabel && forbiddenChars.has(isCaseSensitive ? candidateLabel : candidateLabel.toLowerCase())) {
                labelIndex++;
                if (labelIndex >= jumpLabels.length) {
                    candidateLabel = '';
                    break;
                }
                candidateLabel = jumpLabels[labelIndex];
            }

            if (candidateLabel) {
                target.label = candidateLabel;
                currentTargets.push(target);
                labelIndex++;
            }
        }

        // Render decorations for each editor
        editors.forEach(editor => {
            const editorTargets = currentTargets.filter(t => t.editor === editor);
            const matchOptions: vscode.DecorationOptions[] = editorTargets.map(t => ({ range: t.range }));
            const labelOptions: vscode.DecorationOptions[] = editorTargets.map(t => ({
                range: t.range,
                renderOptions: {
                    after: { contentText: t.label }
                }
            }));

            editor.setDecorations(matchDecorationType, matchOptions);
            editor.setDecorations(labelDecorationType, labelOptions);
        });
    });

    inputBox.onDidAccept(() => {
        if (currentTargets.length > 0) {
            executeJump(currentTargets[0]);
        }
    });

    inputBox.onDidHide(() => {
        editors.forEach(editor => {
            editor.setDecorations(matchDecorationType, []);
            editor.setDecorations(labelDecorationType, []);
        });
        matchDecorationType.dispose();
        labelDecorationType.dispose();
        inputBox.dispose();
    });
}

export function deactivate() {}
