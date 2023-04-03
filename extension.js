const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	console.log('selfie-grader is now active!');

	let outputChannel;
	let errorChannel;
	let terminal;

	const path = require('path');
	const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
	const pathToPy = path.join(workspaceRoot, 'grader', 'self.py');

	const assignments = [];
	let selected = '';

	const config = vscode.workspace.getConfiguration('selfie-grader');
	

	let runGraderCommand = vscode.commands.registerCommand('selfie-grader.runGrader', function () {
		if(vscode.workspace.name !== 'selfie'){
			vscode.window.showErrorMessage('Please open the selfie folder as workspace');
			return;
		}

		const clearPreviousOutput = config.get('clearPreviousOutput') === true;
		const preserveFocus = config.get('preserveFocus') === true;

		//const exec = require('child_process').exec;
		//const pythonFileRelativePath = path.relative(workspaceRoot, path.join(currentDir, 'grader', 'self.py'));
		if(selected === ''){
			vscode.commands.executeCommand('selfie-grader.graderOptions',);
		}
		else if(config.get('runInTerminal') === true){
			//run the command in a terminal

			if(terminal === undefined){
				terminal = vscode.window.createTerminal('Grader');
			}

			if(clearPreviousOutput){
				terminal.sendText('clear');
			}
			terminal.sendText('python3 \'' + pathToPy + '\' ' + selected);

			/*vscode.commands.executeCommand('workbench.action.terminal.sendSequence', {
			text: `${'python3 \'' + pathToPy + '\' ' + selected}`
			});*/
			terminal.show(preserveFocus);
		}
		else {
			//run the command in the output channel
			const clearPreviousOutput = config.get('clearPreviousOutput') === true;
			const preserveFocus = config.get('preserveFocus') === true;

			if(outputChannel === undefined){
				outputChannel = vscode.window.createOutputChannel('Grader Output');
			}
			if(errorChannel === undefined){
				errorChannel = vscode.window.createOutputChannel('Grader Error');
			}
			if(clearPreviousOutput){
				outputChannel.clear();
				errorChannel.clear();
			}
			const { spawn } = require('child_process');

			const pythonProcess = spawn('python3', [pathToPy, selected]);

			let stdoutUsed = false;
			let stderrUsed = false;

			pythonProcess.stdout.on('data', (data) => {
				const dataString  = data.toString('utf-8');
				outputChannel.append(dataString);
				stdoutUsed = true;
			});

			pythonProcess.stderr.on('data', (data) => {
				const dataString  = data.toString('utf-8');
				errorChannel.append(dataString);
				stderrUsed = true;
			});

			pythonProcess.on('close', (code) => {
				//console.log(`child process exited with code ${code}`);
				if(stderrUsed){
					errorChannel.show(preserveFocus);
				}
				else if(stdoutUsed){
					outputChannel.show(preserveFocus);
				}
			});

			/*exec('python3 "' + pathToPy + '" ' + selected, (error, stdout, stderr) => {
				if(stdout !== ''){
					outputChannel.append(stdout);
					outputChannel.show(preserveFocus);
				}
				else{
					errorChannel.append(stderr);
					errorChannel.show(preserveFocus);
				}
			});*/

		}

	});

	context.subscriptions.push(runGraderCommand);


	const fs = require('fs');


	const readStream = fs.createReadStream(pathToPy, { encoding: 'utf-8' });

	readStream.on('data', function(chunk) {
		const lines = chunk.toString().split('\n'); //(chunk can be Buffer or String) so toString() is to avoid that a Buffer split (which does not exist) is called
		let insideAssignments = false;

		for (let i = 0; i < lines.length; i++) {
			if (lines[i].startsWith('assignments: List[Assignment] = [')) {
				insideAssignments = true;
				continue;
			}
			if (lines[i].trim() === ']') {
				insideAssignments = false;
				continue;
			}
			if (insideAssignments) {
				assignments.push(lines[i].trim().replace('assignment_', '').replace(',','').replace(/_/g,'-'));
			}
		}
	});

	readStream.on('error', function(err) {
		vscode.window.showErrorMessage('Error reading file: ' + err.message);
	});



	const showOptionsCommand = vscode.commands.registerTextEditorCommand('selfie-grader.graderOptions', () => {
		if(vscode.workspace.name !== 'selfie'){
			vscode.window.showErrorMessage('Please open the selfie folder as workspace');
			return;
		}
		const quickPick = vscode.window.createQuickPick();
		quickPick.items = assignments.map(label => ({ label }));
		quickPick.onDidChangeSelection(selection => {
			if (selection[0]) {
				//vscode.window.showInformationMessage(`You selected ${selection[0].label}`);
				selected = selection[0].label;
				quickPick.dispose();
				vscode.commands.executeCommand('selfie-grader.runGrader',);
			}
		});
		quickPick.show();
	});

	context.subscriptions.push(showOptionsCommand);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}

//