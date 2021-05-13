import * as vscode from 'vscode';
import { DocumentSelector, ExtensionContext } from 'vscode';

export function registerHighlightProvider(ctx: ExtensionContext, documentSelector: DocumentSelector) {
	// highlight provider
	ctx.subscriptions.push(vscode.languages.registerDocumentHighlightProvider(documentSelector, {
		provideDocumentHighlights: (doc, pos) => {
            console.log("highlight");
            let results:vscode.DocumentHighlight[] = []
            for(let i = 0 ; i < fs.length; i ++){
                let f = fs[i]
                if(doc.uri.toString().includes(f.file)){
                    for(let j = 0; j < f.issues.length; j ++){
                        let p = new vscode.Range(f.issues[j].position.start.line, f.issues[j].position.start.column, f.issues[j].position.end.line, f.issues[j].position.end.column)
                        let docHigh = new vscode.DocumentHighlight(p, vscode.DocumentHighlightKind.Read)
                        results.push(docHigh)
                    }
                }
            }
            console.log("results: " + results.length);
        return results;
		}
	}));

    ctx.subscriptions.push(vscode.languages.registerHoverProvider('*', {
        provideHover(doc, position, token) {
            for(let i = 0 ; i < fs.length; i ++){
                let f = fs[i]
                for(let j = 0; j < f.issues.length; j ++){
                    console.log(f.issues[j].position.start.line, f.issues[j].position.start.column, f.issues[j].position.end.line, f.issues[j].position.end.column)
                    let p = new vscode.Range(f.issues[j].position.start.line, f.issues[j].position.start.column, f.issues[j].position.end.line, f.issues[j].position.end.column)
                    if(doc.uri.toString().includes(f.file)){
                        if ((position.line == p.start.line && position.character >= p.start.character) || position.line > p.start.line )
                            if ((position.line == p.end.line && position.character <= p.end.character) || position.line < p.end.line ){
                                return {
                                    contents: [f.issues[j].reason.detailed]
                                };
                            }
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
        let folder = vscode.workspace.rootPath;
        console.log("folder " + vscode.workspace.rootPath)
        if(folder){
            let fn = folder + "/output.json"
            console.log("fn " + fn)
            fs = require(fn)
        }
	}
}