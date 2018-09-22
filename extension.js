// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const { window } = require('vscode');
const kubernetes = require('./lib/kubernetes.js');
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('kubernetes.debug-pod', async () => {
        // The code you place here will be executed every time your command is executed
        kubernetes.init();
        const pods = await kubernetes.pods('default');
        const podNames = pods.map(p => p.metadata.name)
        const selectedPod = await window.showQuickPick(podNames.map(i => ({ label: i })), {
            placeHolder: 'select pod to debug'
        });
        if (!selectedPod) {
            window.showInformationMessage('No pod was selected');
            return;
        }
        await kubernetes.enableDebug('default', selectedPod.label)
        window.showInformationMessage(`Got: ${selectedPod.label}`);

    });

    context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;