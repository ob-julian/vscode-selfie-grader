# selfie-grader

This is a VSCode extension that allows you to run the grader for the [selfie system](https://github.com/cksystemsteaching/selfie) conveniently with the click of a button.

## Features

If in a Workspace with /selfie/ as the current working directory, the extension adds two buttons at the upper right corner of the editor. \
Hint: The two buttons are compressed into one button and a dropdown/select menu by VSCode. \
The Labels of the buttons are:
* `▷ Run Grader`: Runs the grader 
* `⚙ Grader Options`: Lets you select the assignment you want to run the grader for.

In addition, the extension adds the functionality of the two buttons to the command palette as well.
* `Grader: Run Grader`: Runs the grader 
* `Grader: Grader Options`: Lets you select the assignment you want to run the grader for.

## Quality of Life Features

After opening the Workspace, no assignment is selected. \
If you run `Run Grader` without selecting an assignment beforehand, the Extension will run `Grader Options` automatically. \
Furthermore, if you run `Grader Options` and select an assignment, the extension will run `Run Grader` afterward automatically. 

## Requirements

This extension only works if /selfie/ is the current working directory. Otherwise, all functionality is disabled, to make sure that the extension does not interfere with other projects. \
Furthermore, the requirements for the selfie system apply.\
 E.g. Python3, C Compiler, ... must be installed and working.

## Extension Settings

This extension contributes the following settings:

* `selfie-grader.clearPreviousOutput:`: Whether to clear previous output before each run.  (Default is __true__)
* `selfie-grader.runInTerminal`: Whether to run the grader in Integrated Terminal. (Default is __false__)
* `selfie-grader.runInTerminal`: Whether to preserve focus on the code editor after the grader is triggered. (Default is __true__)

## Known Issues

* If selecting the `Grader Options` button from the Dropdown Menu, the `Grader Options` is now the active Button that is shown, even though the `Run Grader` button would be the more convenient one to be active. \
This is the default behavior of the VSCode API and I have not found a way to change it.
* If running the extension with other extensions like `Code Runner` and/or `C/C++` installed, the Dropdown Menu can get cramped with the functionality/buttons of the other extensions. \
My suggestion is to disable the other extensions in this workspace, as they are not needed for the selfie system anyways (Correct me if I am wrong). \
* If running `Run Grader` in the Output Channel on Windows, the Output will be a unreadable mess. This is a issue with the grader itself and not the extension. \

## Why

Valid Question: Why did I create this extension? \
Answer: I was tired of typing `python3 /selfie/grader/self.py` to list all Options, then Copy the assignment I want to run the grader for, to then Paste `python3 /selfie/grader/self.py <assignment>` to run the grader. \
> Note: Yes I made an alias for `python3 /selfie/grader/self.py`, but I still had to type `grade` to run the alias.

And if something went wrong and I run some local tests, I had to type `grade <assignment>` again to run the grader again, or I had to go through like 20 - 40 history commands to find the command I used to run the grader. \

So I did what every normal person would do: I spent three days of my life creating a Program that solves a problem that would take me in total not more than 5 minutes to solve manually every time. \
Your welcome =\)

## Release Notes

[CHANGELOG.md](CHANGELOG.md)

---

**Enjoy!**
