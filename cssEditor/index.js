let status = {};

window.loadEditor = () => {
	status.save = document.getElementById("status-save");
	status.line = document.getElementById("status-line");
	status.col = document.getElementById("status-col");

	CodeMirror.keyMap.default["Ctrl-Space"] = "autocomplete";
	
	window.editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
		mode: "css",
		lineNumbers: true,
        theme: "ayu-dark",
		indentUnit: 4
	});

    editor.on("change", () => {
		let css = editor.getValue();
		status.save.style.opacity = (window.savedCSS == css) ? 0 : 1;
		window.updatePreview(css);
	});

	editor.on("cursorActivity", () => {
		let { line, ch } = editor.getCursor();
		status.line.innerHTML = line + 1;
		status.col.innerHTML = ch + 1;
	});
}