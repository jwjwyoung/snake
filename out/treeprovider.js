"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeDependenciesProvider = void 0;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
class NodeDependenciesProvider {
    constructor(workspaceRoot) {
        this.workspaceRoot = workspaceRoot;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!this.workspaceRoot) {
            vscode.window.showInformationMessage('No dependency in empty workspace');
            return Promise.resolve([]);
        }
        if (element) {
            let types = [];
            if (this.pathExists(path.join(this.workspaceRoot, element.label))) {
                console.log("issues " + element.file.issues);
                let file = this.files[element.file];
                for (let i = 0; i < file.issues.length; i++) {
                    let issue = file.issues[i];
                    let dep = new Dependency("Issue: " + issue.reason.type + " at line " + (issue.position.start.line + 1), i + "", vscode.TreeItemCollapsibleState.Collapsed, element.file);
                    types.push(dep);
                }
            }
            else {
                let dep = new Dependency("Fix", '', vscode.TreeItemCollapsibleState.None, element.file);
                types.push(dep);
            }
            return Promise.resolve(types);
        }
        else {
            const packageJsonPath = path.join(this.workspaceRoot, 'output.json');
            if (this.pathExists(packageJsonPath)) {
                return Promise.resolve(this.getDepsInPackageJson(packageJsonPath));
            }
            else {
                vscode.window.showInformationMessage('Workspace has no package.json');
                return Promise.resolve([]);
            }
        }
    }
    /**
     * Given the path to package.json, read all its dependencies and devDependencies.
     */
    getDepsInPackageJson(packageJsonPath) {
        if (this.pathExists(packageJsonPath)) {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
            this.files = packageJson;
            const toDep = (moduleName, version, file) => {
                console.log("path " + path.join(this.workspaceRoot, moduleName));
                if (this.pathExists(path.join(this.workspaceRoot, moduleName))) {
                    return new Dependency(moduleName, version, vscode.TreeItemCollapsibleState.Collapsed, file);
                }
                else {
                    return new Dependency(moduleName, version, vscode.TreeItemCollapsibleState.None, file);
                }
            };
            let deps = [];
            for (let i = 0; i < packageJson.length; i++) {
                let f = packageJson[i];
                let issueLen = f.issues.length;
                let suffix = " error";
                if (issueLen > 1) {
                    suffix = " errors";
                }
                let tooltip = issueLen + suffix;
                let dep = toDep(f.file, tooltip, i);
                deps.push(dep);
            }
            return deps;
        }
        else {
            return [];
        }
    }
    pathExists(p) {
        try {
            fs.accessSync(p);
        }
        catch (err) {
            return false;
        }
        return true;
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
}
exports.NodeDependenciesProvider = NodeDependenciesProvider;
class Dependency extends vscode.TreeItem {
    constructor(label, version, collapsibleState, file) {
        super(label, collapsibleState);
        this.label = label;
        this.version = version;
        this.collapsibleState = collapsibleState;
        this.file = file;
        this.iconPath = {
            light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
            dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
        };
        this.tooltip = `${this.version}`;
        this.description = this.version;
        this.file = file;
    }
}
//# sourceMappingURL=treeprovider.js.map