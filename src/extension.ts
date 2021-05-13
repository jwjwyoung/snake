// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
import { registerHighlightProvider } from './highlight';
import {NodeDependenciesProvider} from "./treeprovider"
const DOCUMENT_SELECTOR: { language: string; scheme: string }[] = [
	{ language: 'ruby', scheme: 'file' },
	{ language: 'ruby', scheme: 'untitled' },
	{ language: 'python', scheme: 'file' },
];

export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "snake" is now active!');
	let provider = registerHighlightProvider(context, DOCUMENT_SELECTOR);
	

	if(vscode.workspace.rootPath){
		const rootPath: string = vscode.workspace.rootPath
		const treeprovider = new NodeDependenciesProvider(vscode.workspace.rootPath)
		const tree = vscode.window.createTreeView('nodeDependencies', {
			treeDataProvider: treeprovider
		  });
		tree.onDidChangeSelection( e =>{
			for(let i = 0; i < e.selection.length; i ++){
				let file = e.selection[i].label
				let filepath = path.join(rootPath, file)
				console.log("filepath " + filepath)
				if (fs.existsSync(filepath)){
					vscode.workspace.openTextDocument(filepath).then(iDoc => {
						vscode.window.showTextDocument(iDoc)
					})
				}
			}
		});

		vscode.commands.registerCommand('nodeDependencies.refreshEntry', () => {
			treeprovider.refresh();
			provider[0].dispose();
			provider[1].dispose();
			provider = registerHighlightProvider(context, DOCUMENT_SELECTOR)
		}
		
	  );
	}
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('snake.detectinconsistency', () => {
		vscode.window.showInformationMessage('Detecting inconsistency');
	});
	
	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
