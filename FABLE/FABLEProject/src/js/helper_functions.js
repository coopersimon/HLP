export function saveCodeMirror(myEditor)
{
	myEditor.save();
	return document.getElementById("editor").value;
}

export function initializeCodeMirror() {
	var editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
			lineNumbers: true
		});
	return editor
}

export function highlightLine(lineNumber,myEditor,colour) {
	var actualLine = lineNumber - 1
	if(colour == 1) {
		var actualLine = lineNumber - 1
		myEditor.addLineClass(actualLine, 'background', 'error');
	}
	if(colour == 2) {
		var actualLine = lineNumber - 1
		myEditor.addLineClass(actualLine, 'background', 'select');
	}
	myEditor.refresh();
}

export function clearAllLines(myEditor) {
	console.log(myEditor.lineCount())
	for (var i = 0; i < myEditor.lineCount(); i++) {
		myEditor.removeLineClass(i, 'background', 'error');
		myEditor.removeLineClass(i, 'background', 'select')
	}
	myEditor.refresh();
}


export function readFromConsole() {
	const readline = require('readline');
	return readline()
}