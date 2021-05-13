import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { type } from 'node:os';

export class NodeDependenciesProvider implements vscode.TreeDataProvider<Dependency> {
  constructor(private workspaceRoot: string) {}

  getTreeItem(element: Dependency): vscode.TreeItem {
    return element;
  }

  getChildren(element?: Dependency): Thenable<Dependency[]> {
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage('No dependency in empty workspace');
      return Promise.resolve([]);
    }

    if (element) {
      let types = []
      console.log("issues "  + element.file.issues)
      for(let i = 0; i < element.file.issues.length; i ++){
        let issue = element.file.issues[i]
        
        let dep = new Dependency(
          issue.reason.type + " at line " + issue.position.start.line,
          issue.position.start.line,
          vscode.TreeItemCollapsibleState.None,
          element.file,
        );
        types.push(dep)
      }
      return Promise.resolve(types);
    } else {
      const packageJsonPath = path.join(this.workspaceRoot, 'output.json');
      if (this.pathExists(packageJsonPath)) {
        return Promise.resolve(this.getDepsInPackageJson(packageJsonPath));
      } else {
        vscode.window.showInformationMessage('Workspace has no package.json');
        return Promise.resolve([]);
      }
    }
  }

  /**
   * Given the path to package.json, read all its dependencies and devDependencies.
   */
  private getDepsInPackageJson(packageJsonPath: string): Dependency[] {
    if (this.pathExists(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

      const toDep = (moduleName: string, version: string, file: any): Dependency => {
        console.log("path " + path.join(this.workspaceRoot, moduleName))
        if (this.pathExists(path.join(this.workspaceRoot, moduleName))) {
          return new Dependency(
            moduleName,
            version,
            vscode.TreeItemCollapsibleState.Collapsed,
            file,
          );
        } else {
          return new Dependency(moduleName, version, vscode.TreeItemCollapsibleState.None, file);
        }
      };

      let deps:any = []
      for(let i = 0 ; i < packageJson.length; i ++){
        let f = packageJson[i]
        let issue_len = f.issues.length 
        let suffix = " error"
        if (issue_len > 1){
          suffix = " errors"
        }
        let tooltip: string = issue_len + suffix
        let dep = toDep(f.file, tooltip, f)
        deps.push(dep)
      }

      return deps;
    } else {
      return [];
    }

  }

  private pathExists(p: string): boolean {
    try {
      fs.accessSync(p);
    } catch (err) {
      return false;
    }
    return true;
  }
  private _onDidChangeTreeData: vscode.EventEmitter<Dependency | undefined | null | void> = new vscode.EventEmitter<Dependency | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<Dependency | undefined | null | void> = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
}

class Dependency extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    private version: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public file : any
  ) {
    super(label, collapsibleState);
    this.tooltip = `${this.version}`;
    this.description = this.version;
    this.file = file;
  }

  iconPath = {
    light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
    dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
  };
}
