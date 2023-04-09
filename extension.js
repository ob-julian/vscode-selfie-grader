const vscode = require('vscode');

let outputChannel;
let errorChannel;
let terminal;

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	const disclaimer1 = 'VSCodes output channel does not support ANSI escape codes, so the output is not colored.';
	const disclaimer2 = 'Change the setting "selfie-grader.runInTerminal" to true to switch to the terminal, which supports ANSI escape codes.';
	let out = disclaimer1 + '\n' + disclaimer2 + '\n\n';
	let grading = false;

	const path = require('path');
	const workspaceRoot = vscode.workspace.workspaceFolders[0].uri.fsPath;
	const absolutePathToPyProgramm = path.join(workspaceRoot, 'grader', 'self.py');
	const relativePathToPyProgramm = path.join('grader','self.py')

	const assignments = [];
	let selected = '';

	let runGraderCommand = vscode.commands.registerCommand('selfie-grader.runGrader', function () {
		if (grading) {
			vscode.window.showErrorMessage('Grader is already running');
			return;
		}
		if(!isInSelfie()){
			vscode.window.showErrorMessage('Please open the selfie folder as workspace');
			return;
		}
		if(vscode.workspace.isTrusted === false){
			vscode.window.showErrorMessage('Executing the Selfie Grader is disabled in a untrusted workspace');
			return;
		}
		grading = true;


		const clearPreviousOutput = vscode.workspace.getConfiguration('selfie-grader').get('clearPreviousOutput') === true;
		const preserveFocus = vscode.workspace.getConfiguration('selfie-grader').get('preserveFocus') === true;
		const graderArguments = vscode.workspace.getConfiguration('selfie-grader').get('graderArguments');

		//const exec = require('child_process').exec;
		//const pythonFileRelativePath = path.relative(workspaceRoot, path.join(currentDir, 'grader', 'self.py'));
		if(selected === ''){
			vscode.commands.executeCommand('selfie-grader.graderOptions',);
			grading = false;
		}
		else if(vscode.workspace.getConfiguration('selfie-grader').get('runInTerminal') === true){
			//run the command in a terminal

			if(terminal === undefined){
				terminal = vscode.window.createTerminal('Grader');
			}
			//setup
			terminal.sendText(''); //to dispose of the previous text in the terminal
			terminal.sendText('cd \'' + workspaceRoot + '\'');

			//clean up
			if(clearPreviousOutput){
				terminal.sendText('clear');
			}
			if(outputChannel !== undefined || errorChannel !== undefined){
				outputChannel.hide();
				errorChannel.hide();
			}
			terminal.show(preserveFocus);
			terminal.sendText('python3 \'' + relativePathToPyProgramm + '\' ' + selected + ' ' + graderArguments);
			//5 sec timeout to prevent spamming the grader
			setTimeout(function(){
				grading = false;
			}, 5000);
			terminal.show(preserveFocus);
		}
		else {
			//run the command in the output channel

			if(errorChannel === undefined){
				errorChannel = vscode.window.createOutputChannel('Grader Error');
			}
			if(outputChannel === undefined){
				outputChannel = vscode.window.createOutputChannel('Grader Output');
			}
			//clean up
			if(clearPreviousOutput){
				outputChannel.clear();
				errorChannel.clear();
				out = disclaimer1 + '\n' + disclaimer2 + '\n\n';
			}
			if(terminal !== undefined){
				terminal.hide();
			}
			outputChannel.show(preserveFocus);

			const { spawn } = require('child_process');
			
			const info = 'Running grader for assignment ' + selected + '...';
			outputChannel.appendLine(disclaimer1);
			outputChannel.appendLine(disclaimer2);
			outputChannel.appendLine('');
			outputChannel.appendLine(info);

			const pythonProcess = spawn('python3', [relativePathToPyProgramm, selected, graderArguments], { cwd: workspaceRoot });

			let stdoutUsed = false;
			let stderrUsed = false;
			if(out != disclaimer1 + '\n' + disclaimer2 + '\n\n'){
				out = out + '\n' + '-'.repeat(50) + '\n\n';
			}
			out = out + info + '\n';

			pythonProcess.stdout.on('data', (data) => {
				if(data.includes('\b')) {
					out = out.split('\n[  |   \]')[0];;
					out = out.replace(/\r/g, '');
					outputChannel.replace(out);
					return;
				}
				const dataString  = cleanData(data);
				if(dataString !== ''){
					out = out + dataString + "\n";
					outputChannel.append(dataString);
					stdoutUsed = true;
				}
			});

			pythonProcess.stderr.on('data', (data) => {
				const dataString  = cleanData(data);
				errorChannel.append(dataString);
				stderrUsed = true;
			});

			pythonProcess.on('close', (code) => {
				outputChannel.replace(out);
				if(stderrUsed){
					if(code !== 0)
						errorChannel.appendLine('Exited with code ' + code);
					errorChannel.show(preserveFocus);
				}
				else if(stdoutUsed){
					outputChannel.show(preserveFocus);
				}
				grading = false;
			});

		}
	});

	context.subscriptions.push(runGraderCommand);

	vscode.window.withProgress({
		location: vscode.ProgressLocation.Notification,
		title: "Initializing Selfie Grader Assignments",
		cancellable: false
	}, () => {
		return new Promise((resolve) => {
			const fs = require('fs');


			const readStream = fs.createReadStream(absolutePathToPyProgramm, { encoding: 'utf-8' });
			let assignment = '';
			readStream.on('data', function(chunk) {
				const data = chunk.toString(); //(chunk can be Buffer or String) so toString() is to avoid that a Buffer split (which does not exist) is called
				const assignmentRaw = data.split('Assignment(\'');
				for (let i = 1; i < assignmentRaw.length; i++) {
					const assignmentSplit = assignmentRaw[i].split('\', \'')
					if(assignmentSplit[1] !== assignment) {
						assignment = assignmentSplit[1];
						assignments.push([assignment + ' Assignments', 'separator']);
					}
					assignments.push([assignmentSplit[0], assignment.toLocaleLowerCase()]);
				}
			});

			readStream.on('error', function(err) {
				vscode.window.showErrorMessage('Error reading file: ' + err.message);
			});

			readStream.on('end', function() {
				resolve();
			});	

		});
	});

	const showOptionsCommand = vscode.commands.registerTextEditorCommand('selfie-grader.graderOptions', () => {
		if(!isInSelfie()){
			vscode.window.showErrorMessage('Please open the selfie folder as workspace');
			return;
		}
		if(vscode.workspace.isTrusted === false){
			vscode.window.showErrorMessage('Executing the Selfie Grader is disabled in a untrusted workspace');
			return;
		}

		if(assignments.length === 0){
			vscode.window.showErrorMessage('No assignments yet available');
			return;
		}
		
		const quickPick = vscode.window.createQuickPick();
		const showAssignmentGroups = vscode.workspace.getConfiguration('selfie-grader').get('showAssignmentGroups');
		const assignmentsFilter = [];
		let selectedItem;
		for (const [key, value] of Object.entries(showAssignmentGroups)) {
			if(value == 'false'){
				assignmentsFilter.push(key.toLocaleLowerCase());
			}
		}
		quickPick.items = assignments.filter( (value) => {
			let assignment = value[1].toLowerCase();
			if(assignmentsFilter.includes(assignment))
				return false;
			return true;
			}
		).map(label => {
			if(label[1] === 'separator'){
				return { label: label[0], kind: vscode.QuickPickItemKind.Separator };
			}
			if(label[0] === selected){
				selectedItem = {label: label[0]};
				return selectedItem;
			}
			return {label: label[0]};
		});
		quickPick.placeholder = 'Select an assignment';
		quickPick.canSelectMany = false;
		quickPick.onDidHide(() => quickPick.dispose());
		quickPick.onDidAccept(() => {
			quickPick.dispose();
			vscode.commands.executeCommand('selfie-grader.runGrader',);
		});
		quickPick.onDidChangeSelection(selection => {
			if (selection[0]) {
				selected = selection[0].label;
				quickPick.dispose();
				vscode.commands.executeCommand('selfie-grader.runGrader',);
			}
		});
		quickPick.onDidHide(() => quickPick.dispose());
		quickPick.show();
		quickPick.activeItems = [selectedItem];

		});

	context.subscriptions.push(showOptionsCommand);
}

function deactivate() {
	if(outputChannel !== undefined)
		outputChannel.dispose();
	if(errorChannel !== undefined)
		errorChannel.dispose();
	if(terminal !== undefined)
		terminal.dispose();
	//TODO: dispose at exit or reengage at startup
}

module.exports = {
	activate,
	deactivate
}

function isInSelfie(){
	return vscode.workspace.name.includes('selfie');
}

function cleanData(data){
	//removes all ANSI escape codes from the data
	let dataString  = data.toString('utf-8');
	const regex = /(\x9B|\x1B\[)[0-?]*[ -\/]*[@-~]/g;
	dataString = dataString.replace(regex, '');
	//removing other control characters
	dataString = dataString.replace(/\n$/g, '');
	dataString = dataString.replace(/\r/g, '');
	//spacing Tests:
	dataString = dataString.replace(/\[FAILED\]/g, '\n[FAILED]');
	dataString = dataString.replace(/\[PASSED\]/g, '\n[PASSED]');
	dataString = dataString.replace(/\[  |   \]/g, '\n[  |   \]');
	dataString = dataString.replace(/executing test/g, '\nexecuting test');
	return dataString.replace(/\b/g, '');


	//return dataString.replace(/\n$/g, '');
}