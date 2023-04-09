# selfie-grader

This is a VSCode extension that allows you to run the grader for the [selfie system](https://github.com/cksystemsteaching/selfie) conveniently with the click of a button.

## Features

### Buttons

If in a Workspace with /selfie/ in the name of the current working directory, the extension adds two buttons at the upper right corner of the editor.
>Hint: The two buttons are compressed into one button and a dropdown/select menu by VSCode. 

The Labels of the buttons are:
* `▷ Run Grader`: Runs the grader 
* `⚙ Grader Options`: Lets you select the assignment you want to run the grader for.

The `▷ Run Grader` button has the option, if you hover over it, to press `Shift/Alt` to activate the `⚙ Grader Options` button instead. \
This should make it more convenient to select a different assignment to run the grader for.

### Commands

In addition, the extension adds the functionality of the two buttons to the command palette as well. \
You can access the command palette by pressing `Ctrl + Shift + P` or `Cmd + Shift + P` on Mac.
* `Grader: Run Grader`: Runs the grader 
* `Grader: Grader Options`: Lets you select the assignment you want to run the grader for.

## Quality of Life Features

If you run `Run Grader` without selecting an assignment beforehand, the Extension will run `Grader Options` automatically.
> Hint: After opening the Workspace, no assignment is selected.

Furthermore, if you run `Grader Options` and select an assignment, the extension will run `Run Grader` afterward automatically. 

## Requirements

This extension only works if the current working directory contains /selfie/ somewhere in the name. Otherwise, all functionality is disabled, to make sure that the extension does not interfere with other projects. \
Furthermore, the requirements for the selfie system apply.\
 E.g. Python3, C Compiler, ... must be installed and working.

## Extension Settings

This extension contributes the following settings:

* `selfie-grader.clearPreviousOutput`: Whether to clear previous output before each run.  (Default is __true__)
* `selfie-grader.runInTerminal`: Whether to run the grader in Integrated Terminal. (Default is __false__)
* `selfie-grader.runInTerminal`: Whether to preserve focus on the code editor after the grader is triggered. (Default is __true__)
* `selfie-grader.graderArguments`: Arguments to pass to the grader. (Default is __empty__) \
Possibilities (that are interesting for students) are `-q` for print grade only and `-s` for do not show the processing spinner.
* `selfie-grader.showAssignmentGroups`: Assignment groups to be shown in 'Grader Options'. \
The format is: `"<name of the assignment group>": boolean`. \
Default assignments are: `general`, `compiler`, and `systems`. \
If ever new assignment groups are added to the selfie system, just add them to the list, I made the decision to make it like that and not via a button for each assignment, to future proof the extension. \
Furthermore, assignments are only hidden if the corresponding boolean is set to `false`, so if a group is not in the list, it will be shown.

## Instalation

### From the Marketplace

1. Open the Extensions View on VSCode (`Ctrl + Shift + X` or `Cmd + Shift + X` on Mac)
2. Search for `selfie-grader`
3. Click on `Install`

### From a .vsix File

1. Download the latest .vsix file from the [Releases](https://github.com/ob-julian/vscode-selfie-grader/releases) page.
2. Open the Extensions View on VSCode (`Ctrl + Shift + X` or `Cmd + Shift + X` on Mac)
3. Click on the `...` button in the upper right corner of the Extensions View
4. Click on `Install from VSIX...`
5. Select the .vsix file you downloaded in step 1.

### From Source

Prerequisites:
1. If you have not installed the [Node.js](https://nodejs.org/en/) runtime, install it
2. Open a terminal and run `npm install -g @vscode/vsce`

Steps:

1. Clone the [GitHub Repository](https://github.com/ob-julian/vscode-selfie-grader) or download the source code as a .zip file from the `<> Code` button or download the source code as a .zip file from the [Releases](https://github.com/ob-julian/vscode-selfie-grader/releases) page or the [GitHub Repository](https://github.com/ob-julian/vscode-selfie-grader)
2. If you downloaded the source code as a .zip file, extract the .zip file
3. Open a terminal and navigate to the directory where you cloned the repository or extracted the .zip file
4. Run `vsce package` to create a .vsix file
5. Follow the steps from the `From a .vsix File` section

## WLS Support

If you are using the Windows Subsystem for Linux (WSL) and want to use this extension, make sure you follow the following steps:

1. Install the [Remote - WSL](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-wsl) extension and enable it
2. Connect to the WSL instance by clicking on the green button `Open a Remote Window` in the lower left corner of the editor and selecting the WSL instance you want to connect to
3. Install the extension in the WSL instance (Follow the steps from the `Installation` section)
4. Open your project in the WSL instance in VSCode (You can check if you are in the WSL instance by looking at the bottom left corner of the editor. If it says `WSL: <name of the WSL instance>`, you are in the WSL instance)

## Known Issues

* If selecting the `Grader Options` button from the Dropdown Menu, the `Grader Options` is now the active Button that is shown, even though the `Run Grader` button would be the more convenient one to be active. \
This is the default behavior of the VSCode API and I have not found a way to change it.
* If running the extension with other extensions like `Code Runner` and/or `C/C++` installed, the Dropdown Menu can get cramped with the functionality/buttons of the other extensions. \
My suggestion is to disable the other extensions in this workspace, as they are not needed for the selfie system anyways (Execpt IntelliSense for C) (Correct me if I am wrong).

## Why

Valid Question: Why did I create this extension? \
Answer: I was tired of typing `python3 /selfie/grader/self.py` to list all Options, then Copy the assignment I want to run the grader for, to then Paste `python3 /selfie/grader/self.py <assignment>` to run the grader.
> Note: Yes I made an alias for `python3 /selfie/grader/self.py`, but I still had to type `grade` to run the alias.

And if something went wrong and I run some local tests, I had to type `grade <assignment>` again to run the grader again, or I had to go through like 20 - 40 history commands to find the command I used to run the grader.

So I did what every normal person would do: I spent six days of my life creating a Program that solves a problem that would take me in total not more than 5 minutes to solve manually every time. \
Your welcome =\)

## Release Notes

[CHANGELOG.md](CHANGELOG.md)

---

**Enjoy!**