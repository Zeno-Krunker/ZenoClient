window.loadEditor = () => {
	window.editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
		mode: "css",
		lineNumbers: true,
		value: "/* Your CSS Here */",
        theme: "ayu-dark",
		indentWithTabs: true,
		indentUnit: 0
	});
    editor.on("change", () => window.updatePreview(editor.getValue()));
}