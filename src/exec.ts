import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { type } from 'node:os';
const { exec } = require("child_process");

export class Execution{
    public appType: string;
    public previousCommit: string;
    public currentCommit: string;
    public cmd: string;
    constructor(root: string) {
        const configJsonPath = path.join(root, '/config/saver_config.json');
        const configJson = JSON.parse(fs.readFileSync(configJsonPath, 'utf-8'));
        this.appType = configJson.app;
        this.previousCommit = configJson.previous_commit;
        this.currentCommit = configJson.current_commit;
        let scriptPath = configJson.script_path;
        if (this.appType === "rails"){
            let scriptName: string = "execute.rb";
            this.cmd = "cd " + scriptPath + " && ruby "  + scriptName + " " + root + " " + this.currentCommit + " " + this.previousCommit;
            console.log("CMD IS " + this.cmd);
        }else{
            this.cmd = "python " + this.previousCommit + " " + this.currentCommit;
        }
    }

    execute(){
        exec(this.cmd, (error:any, stdout:any, stderr:any) => {
          if (error) {
              console.log(`error: ${error.message}`);
              return;
          }
          if (stderr) {
              console.log(`stderr: ${stderr}`);
              return;
          }
          console.log(`stdout: ${stdout}`);
      });
    } 
} 