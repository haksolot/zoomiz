import * as vscode from 'vscode';

// Label charsets
const CHARSETS = {
    flash: 'asdfjklghqwertyuiopzxcvbnmASDFJKLGHQWERTYUIOPZXCVBNM',
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numeric: '0123456789'
};

interface JumpTarget {
    range: vscode.Range;
    label: string;
}

export function activate(context: vscode.ExtensionContext) {

    const disposable = vscode.commands.registerCommand('zoomiz.jump', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

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

        inputBox.onDidChangeValue((value) => {
            if (!value) {
                // Clear everything if input is empty
                editor.setDecorations(matchDecorationType, []);
                editor.setDecorations(labelDecorationType, []);
                currentTargets = [];
                return;
            }

            const lastChar = value.slice(-1);
            
            // 1. PERFORM SEARCH FIRST
            const query = value; 
            const visibleRanges = editor.visibleRanges;
            const text = editor.document.getText();
            
            // Helper to find matches
            const findMatches = (searchQuery: string) => {
                const results: JumpTarget[] = [];
                if (searchQuery.length === 0) {
                    return results;
                }
                
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
                        
                        results.push({ range: matchRange, label: '' });
                        index = compareText.indexOf(finalQuery, index + 1);
                    }
                }
                return results;
            };

            const searchResults = findMatches(query);

            // 2. DECIDE: IS IT A JUMP OR A SEARCH?
            let isJump = false;
            let targetLabel = '';

            if (charsetMode === 'uppercase') {
                 if (jumpLabels.includes(lastChar)) {
                     isJump = true;
                     targetLabel = lastChar;
                 }
            } else {
                if (searchResults.length > 0) {
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
                    editor.selection = new vscode.Selection(target.range.start, target.range.start);
                    editor.revealRange(target.range);
                    inputBox.hide();
                    return;
                }
            }

            // UPDATE STATE (If not jumped)
            currentTargets = [];
            let labelIndex = 0;

            // Collect all characters that immediately follow any match.
            // These characters cannot be used as labels because typing them would be interpreted as refining the search.
            const forbiddenChars = new Set<string>();
            for (const target of searchResults) {
                const endOffset = editor.document.offsetAt(target.range.end);
                if (endOffset < text.length) {
                    const char = text.charAt(endOffset);
                    forbiddenChars.add(isCaseSensitive ? char : char.toLowerCase());
                }
            }

            for (const target of searchResults) {
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

            // Render
            const matchOptions: vscode.DecorationOptions[] = currentTargets.map(t => ({ range: t.range }));
            const labelOptions: vscode.DecorationOptions[] = currentTargets.map(t => ({
                range: t.range,
                renderOptions: {
                    after: { contentText: t.label }
                }
            }));

            editor.setDecorations(matchDecorationType, matchOptions);
            editor.setDecorations(labelDecorationType, labelOptions);
        });

        inputBox.onDidAccept(() => {
            if (currentTargets.length > 0) {
                const target = currentTargets[0];
                editor.selection = new vscode.Selection(target.range.start, target.range.start);
                editor.revealRange(target.range);
                inputBox.hide();
            }
        });

        inputBox.onDidHide(() => {
            editor.setDecorations(matchDecorationType, []);
            editor.setDecorations(labelDecorationType, []);
            matchDecorationType.dispose();
            labelDecorationType.dispose();
            inputBox.dispose();
        });
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}