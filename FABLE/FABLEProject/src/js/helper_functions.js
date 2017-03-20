export function saveHtml(myEditor)
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
    //Line number is zero based index
	console.log(lineNumber)
	myEditor.addLineClass(lineNumber, 'background', 'line-error');
    //Set line CSS class to the line number & affecting the background of the line with the css class of line-error
    
}

