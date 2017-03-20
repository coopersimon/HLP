export function saveCodeMirror(myEditor)
{
	myEditor.save();
	myEditor.addLineClass(3, 'background', 'line-error');
	return document.getElementById("editor").value;
}

export function initializeCodeMirror() {
	var editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
			lineNumbers: true
		});
	return editor
}

export function highlightLine(lineNumber,myEditor) {
	console.log(lineNumber)
	myEditor.addLineClass(lineNumber, 'background', 'line-error');
}

