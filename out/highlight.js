"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerHighlightProvider = void 0;
const vscode = require("vscode");
function registerHighlightProvider(ctx, fs) {
    const DOCUMENT_SELECTOR = [
        { language: '*', scheme: '*' },
    ];
    let provider1 = vscode.languages.registerDocumentHighlightProvider(DOCUMENT_SELECTOR, {
        provideDocumentHighlights: (doc, pos) => {
            console.log("highlight");
            let results = [];
            for (let i = 0; i < fs.length; i++) {
                let f = fs[i];
                if (doc.uri.toString().includes(f.file)) {
                    for (let j = 0; j < f.issues.length; j++) {
                        let p = new vscode.Range(f.issues[j].position.start.line, f.issues[j].position.start.column, f.issues[j].position.end.line, f.issues[j].position.end.column);
                        let docHigh = new vscode.DocumentHighlight(p, vscode.DocumentHighlightKind.Read);
                        results.push(docHigh);
                    }
                }
            }
            console.log("results: " + results.length);
            return results;
        }
    });
    ctx.subscriptions.push(provider1);
    let provider2 = vscode.languages.registerHoverProvider('*', {
        provideHover(doc, position, token) {
            for (let i = 0; i < fs.length; i++) {
                let f = fs[i];
                for (let j = 0; j < f.issues.length; j++) {
                    console.log(f.issues[j].position.start.line, f.issues[j].position.start.column, f.issues[j].position.end.line, f.issues[j].position.end.column);
                    let p = new vscode.Range(f.issues[j].position.start.line, f.issues[j].position.start.column, f.issues[j].position.end.line, f.issues[j].position.end.column);
                    if (doc.uri.toString().includes(f.file)) {
                        if ((position.line === p.start.line && position.character >= p.start.character) || position.line > p.start.line) {
                            if ((position.line === p.end.line && position.character <= p.end.character) || position.line < p.end.line) {
                                return {
                                    contents: [f.issues[j].reason.detailed]
                                };
                            }
                        }
                    }
                }
            }
        }
    });
    ctx.subscriptions.push(provider2);
    return [provider1, provider2];
}
exports.registerHighlightProvider = registerHighlightProvider;
//# sourceMappingURL=highlight.js.map