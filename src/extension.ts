// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
import { registerHighlightProvider } from './highlight';
const DOCUMENT_SELECTOR: { language: string; scheme: string }[] = [
	{ language: 'ruby', scheme: 'file' },
	{ language: 'ruby', scheme: 'untitled' },
	{ language: 'python', scheme: 'file' },
];

export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "snake" is now active!');

	registerHighlightProvider(context, DOCUMENT_SELECTOR);
	
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('snake.detectinconsistency', () => {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Detecting inconsistency');
	});
	
	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
