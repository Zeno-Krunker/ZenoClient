window.loadEditor = () => {
	CodeMirror.keyMap.default["Ctrl-Space"] = "autocomplete";
	
	window.editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
		mode: "css",
		lineNumbers: true,
		value: "/* Your CSS Here */",
        theme: "ayu-dark",
		indentUnit: 4
	});

    editor.on("change", () => window.updatePreview(editor.getValue()));
}