"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
const highlight_1 = require("./highlight");
const treeprovider_1 = require("./treeprovider");
const exec_1 = require("./exec");
const DOCUMENT_SELECTOR = [
    { language: '*', scheme: 'file' },
    { language: 'erb', scheme: 'file' },
    { language: 'ruby', scheme: 'untitled' },
    { language: 'python', scheme: 'file' },
];
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "snake" is now active!');
    let provider;
    if (vscode.workspace.rootPath) {
        const rootPath = vscode.workspace.rootPath;
        const execute = new exec_1.Execution(rootPath);
        execute.execute();
        const treeprovider = new treeprovider_1.NodeDependenciesProvider(vscode.workspace.rootPath);
        const tree = vscode.window.createTreeView('nodeDependencies', {
            treeDataProvider: treeprovider
        });
        let cmd = "";
        tree.onDidChangeSelection(e => {
            if (provider) {
                provider[0].dispose();
                provider[1].dispose();
            }
            provider = highlight_1.registerHighlightProvider(context, treeprovider.files);
            for (let i = 0; i < e.selection.length; i++) {
                let selection = e.selection[i];
                let file = e.selection[i].label;
                let filepath = path.join(rootPath, file);
                let f = treeprovider.files[e.selection[i].file];
                let version = e.selection[i].version;
                let index = e.selection[i].index;
                console.log("filepath " + filepath);
                // filename 
                if (fs.existsSync(filepath)) {
                    // open the file
                    vscode.workspace.openTextDocument(filepath).then(iDoc => {
                        vscode.window.showTextDocument(iDoc);
                    });
                }
                else if (file.startsWith("Issue:")) {
                    // issue
                    filepath = path.join(rootPath, f.file);
                    let issue = f.issues[index];
                    // open the file at corresponding line 
                    vscode.workspace.openTextDocument(filepath).then(iDoc => {
                        vscode.window.showTextDocument(iDoc).then(editor => {
                            let p = new vscode.Range(issue.position.start.line, issue.position.start.column, issue.position.end.line, issue.position.end.column);
                            // locate the line
                            editor.revealRange(p);
                        });
                    });
                }
                else if (file === "Fix") {
                    if (selection.isFixed === false) {
                        let issue = f.issues[index];
                        filepath = path.join(rootPath, f.file);
                        vscode.workspace.openTextDocument(filepath).then(iDoc => {
                            vscode.window.showTextDocument(iDoc).then(editor => {
                                let p = new vscode.Range(issue.position.start.line, issue.position.start.column, issue.position.end.line, issue.position.end.column);
                                // locate the line
                                let workspaceEdit = new vscode.WorkspaceEdit();
                                workspaceEdit.replace(iDoc.uri, p, issue.patch);
                                vscode.workspace.applyEdit(workspaceEdit);
                            });
                        });
                        selection.isFixed = true;
                    }
                }
            }
        });
        // refresh
        vscode.commands.registerCommand('nodeDependencies.refreshEntry', () => {
            treeprovider.refresh();
            provider[0].dispose();
            provider[1].dispose();
            provider = highlight_1.registerHighlightProvider(context, treeprovider.files);
        });
    }
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('snake.detectinconsistency', () => {
        vscode.window.showInformationMessage('Detecting inconsistency');
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map