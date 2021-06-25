"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Execution = void 0;
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
class Execution {
    constructor(root) {
        const configJsonPath = path.join(root, '/config/saver_config.json');
        const configJson = JSON.parse(fs.readFileSync(configJsonPath, 'utf-8'));
        this.appType = configJson.app;
        this.previousCommit = configJson.previous_commit;
        this.currentCommit = configJson.current_commit;
        this.script_Dir = configJson.script_path;
        if (this.appType === "rails") {
            let scriptDir = path.join(root, '/../evolution_helper/formatchecker/constraint_analyzer');
            let scriptName = "execute.rb";
            this.cmd = "cd " + scriptDir + " && ruby " + scriptName + " " + root + " " + this.currentCommit + " " + this.previousCommit;
            console.log("CMD IS " + this.cmd);
        }
        else {
            let scriptName = "execute.py";
            this.cmd = "cd " + this.script_Dir + " && python " + scriptName + " -c1 " + this.previousCommit + " -c2 " + this.currentCommit + " -ad " + root;
        }
    }
    execute() {
        exec(this.cmd, (error, stdout, stderr) => {
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
exports.Execution = Execution;
//# sourceMappingURL=exec.js.map