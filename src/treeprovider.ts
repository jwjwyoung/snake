import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { type } from 'node:os';

export class NodeDependenciesProvider implements vscode.TreeDataProvider<Dependency> {
  public files: any;
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
      let types = [];
      if (this.pathExists(path.join(this.workspaceRoot, element.label))){
        console.log("issues "  + element.file.issues);
        let file = this.files[element.file];
        for(let i = 0; i < file.issues.length; i ++){
          let issue = file.issues[i];
          let dep = new Dependency(
            "Issue: " +  issue.reason.type + " at line " + (issue.position.start.line + 1),
            i + "",
            vscode.TreeItemCollapsibleState.Collapsed,
            element.file,
          );
          types.push(dep);
        }
      }else{
        let dep = new Dependency(
          "Fix",
          '',
          vscode.TreeItemCollapsibleState.None,
          element.file,
        );
        types.push(dep);
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
      this.files = packageJson;
      const toDep = (moduleName: string, version: string, file: any): Dependency => {
        console.log("path " + path.join(this.workspaceRoot, moduleName));
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

      let deps:any = [];
      for(let i = 0 ; i < packageJson.length; i ++){
        let f = packageJson[i];
        let issueLen = f.issues.length; 
        let suffix = " error";
        if (issueLen > 1){
          suffix = " errors";
        }
        let tooltip: string = issueLen + suffix;
        let dep = toDep(f.file, tooltip, i);
        deps.push(dep);
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
    public version: string,
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
