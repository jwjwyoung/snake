// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
import { registerHighlightProvider } from './highlight';
import {NodeDependenciesProvider} from "./treeprovider";
import {Execution} from "./exec";
const DOCUMENT_SELECTOR: { language: string; scheme: string }[] = [
	{ language: '*', scheme: 'file' },
	{ language: 'erb', scheme: 'file' },
	{ language: 'ruby', scheme: 'untitled' },
	{ language: 'python', scheme: 'file' },
];

export function activate(context: vscode.ExtensionContext) {


	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let provider: any;

	if(vscode.workspace.rootPath){
		const rootPath: string = vscode.workspace.rootPath;

		const packageJsonPath = path.join(vscode.workspace.rootPath, 'output.json');
		const execute = new Execution(rootPath);
		execute.execute();
		while(true){
			if (fs.existsSync(packageJsonPath)) {
				console.log("Log file is created");
				try {
					JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
					break;
				} catch (error) {
					console.log("file is not ready for reading");
				}
			}
		}
		const treeprovider = new NodeDependenciesProvider(vscode.workspace.rootPath);

		const tree = vscode.window.createTreeView('nodeDependencies', {
			treeDataProvider: treeprovider
		  });
		// remove the file
		// fs.unlinkSync(packageJsonPath);
		tree.onDidChangeSelection( e =>{
			if (provider){
				provider[0].dispose();
				provider[1].dispose();
			}
			provider = registerHighlightProvider(context, treeprovider.files);
			for(let i = 0; i < e.selection.length; i ++){
				let selection = e.selection[i];
				let file = e.selection[i].label;
				let filepath = path.join(rootPath, file);
				let f = treeprovider.files[e.selection[i].file];
				let version = e.selection[i].version;
				let index = e.selection[i].index
				console.log("filepath " + filepath);
				// filename 
				if (fs.existsSync(filepath)){
					// open the file
					vscode.workspace.openTextDocument(filepath).then(iDoc => {
						vscode.window.showTextDocument(iDoc);
					});
				}
				else if (file.startsWith("Issue:")){
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
				}else if (file === "Fix"){
					if (selection.isFixed === false){
						let issue = f.issues[index];
						filepath = path.join(rootPath, f.file);
						vscode.workspace.openTextDocument(filepath).then(iDoc => {
							vscode.window.showTextDocument(iDoc).then(editor => {
								let p = new vscode.Range(issue.position.start.line, issue.position.start.column, issue.position.end.line, issue.position.end.column);
								console.log("issue.reason " + issue.reason);
								console.log("issue location " + issue.position.start.column + " " + issue.position.end.column);
								// locate the line
								let workspaceEdit = new vscode.WorkspaceEdit();
								let reason = issue.reason.type;
								if (reason === "column rename" || reason === "table rename"  || reason === "association rename"){
									workspaceEdit.replace(iDoc.uri, p, issue.patch);
									vscode.workspace.applyEdit(workspaceEdit);
									console.log("applied edit");
									for(let j = 0; j  < f.issues.length; j ++){
										let issueJ = f.issues[j];
										// in the same line and after the change
										if(issueJ.position.start.line === issue.position.start.line && issueJ.position.start.column > issue.position.start.column){
											let delta = issue.patch.length - (issue.position.end.column - issue.position.start.column);
											console.log("changed issue length " + delta);
											console.log("before " + issueJ.position.start.column + " " + issueJ.position.end.column);
											issueJ.position.start.column = issueJ.position.start.column + delta;
											issueJ.position.end.column = issueJ.position.end.column + delta;
											console.log("after " + issueJ.position.start.column + " " + issueJ.position.end.column);
										}
									}
								}
								if (reason === "column delete"){
									console.log("column delete");
									let firstLine = iDoc.lineAt(issue.position.start.line);
									console.log(firstLine.range.start, firstLine.range.end);
									let p = new vscode.Range(firstLine.range.start, firstLine.range.end);
									workspaceEdit.replace(iDoc.uri, p, '');
									vscode.workspace.applyEdit(workspaceEdit);
								}
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
			provider = registerHighlightProvider(context, treeprovider.files);
		}
		
	  );
	}
	let disposable = vscode.commands.registerCommand('snake.detectinconsistency', () => {
		vscode.window.showInformationMessage('Detecting inconsistency');
			// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "snake" is now active!');

	});
	
	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
