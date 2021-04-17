import * as vscode from 'vscode';
import { DocumentSelector, ExtensionContext } from 'vscode';

export function registerHighlightProvider(ctx: ExtensionContext, documentSelector: DocumentSelector) {
	// highlight provider
	ctx.subscriptions.push(vscode.languages.registerDocumentHighlightProvider(documentSelector, {
		provideDocumentHighlights: (doc, pos) => {
            console.log("highlight");
            let results:vscode.DocumentHighlight[] = []
            for(let i = 0; i < pairs.length; i ++){
                let docHigh = new vscode.DocumentHighlight(pairs[i])
                results.push(docHigh)
            }
            console.log("results: " + results.length);
        return results;
		}
	}));
    ctx.subscriptions.push(vscode.languages.registerHoverProvider('*', {
        provideHover(document, position, token) {
            for(let i = 0 ; i < fs.length; i ++){
                let f = fs[i]
                for(let j = 0; j < f.issues.length; j ++){
                let p = new vscode.Range(f.issues[j].position.start.line, f.issues[j].position.start.column, f.issues[j].position.end.line, f.issues[j].position.end.column)
                
                if ((position.line == p.start.line && position.character >= p.start.character) || position.line > p.start.line )
                    if ((position.line == p.end.line && position.character <= p.end.character) || position.line < p.end.line ){
                        return {
                            contents: [f.issues[j].reason]
                        };
                    }
                }
            }
        }
      })
      );

    let pairs: vscode.Range[] = []
    let fs: any;
	if (vscode.window && vscode.window.activeTextEditor) {
        console.log("active window and editor")
        fs = require("/home/junwen/Research/snake/output.json")
        let p = new vscode.Range(fs[0].issues[0].position.start.line, fs[0].issues[0].position.start.column, fs[0].issues[0].position.end.line, fs[0].issues[0].position.end.column)
        console.log("file " + fs[0].file + p.start.line + "  " + p.end.line);
        pairs.push(p)
        console.log("pairs: " + pairs.length);
	}
}