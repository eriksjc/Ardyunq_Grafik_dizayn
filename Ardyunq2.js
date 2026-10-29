
document.body.innerHTML = "";

document.body.style.cssText = `
    margin: 0;
    font-family: Arial, sans-serif;
    background: #0b1120;
    color: #e5e7eb;
`;

const style = document.createElement("style");
style.textContent = `
    * { box-sizing: border-box; }

    nav {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        padding: 15px 24px;
        background: #111c30;
        border-bottom: 1px solid #293750;
    }

    button {
        padding: 11px 17px;
        border: 1px solid #34445e;
        border-radius: 9px;
        background: #1b2940;
        color: #e5e7eb;
        cursor: pointer;
        font-size: 14px;
        transition: .2s;
    }

    button:hover {
        background: #365caa;
        border-color: #6090f0;
        transform: translateY(-1px);
    }

    .menu { position: relative; }

    .submenu {
        display: none;
        position: absolute;
        top: calc(100% + 5px);
        left: 0;
        min-width: 190px;
        padding: 7px;
        border: 1px solid #34445e;
        border-radius: 12px;
        background: #172238;
        box-shadow: 0 15px 40px #0008;
        z-index: 10;
    }

    .menu.open .submenu {
        display: flex;
        flex-direction: column;
    }

    .submenu button {
        text-align: left;
        border: 0;
        background: transparent;
    }

    main {
        max-width: 1050px;
        margin: 35px auto;
        padding: 0 20px;
    }

    .panel {
        padding: 25px;
        background: #111c30;
        border: 1px solid #293750;
        border-radius: 18px;
        box-shadow: 0 15px 45px #0003;
    }

    h1 { font-size: 30px; margin-top: 0; }
    h2 { font-size: 19px; }

    .muted { color: #94a3b8; line-height: 1.7; }

    .toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin: 15px 0;
    }

    input, select, textarea {
        width: 100%;
        padding: 12px;
        border-radius: 9px;
        border: 1px solid #34445e;
        background: #0b1120;
        color: white;
        font: inherit;
        margin: 6px 0 14px;
    }

    textarea {
        min-height: 250px;
        resize: vertical;
        line-height: 1.7;
    }

    .primary {
        background: #3867d6;
        border-color: #3867d6;
    }

    .danger { color: #fca5a5; }

    #status {
        margin-top: 14px;
        color: #86efac;
        overflow-wrap: anywhere;
    }

    .stat {
        display: inline-block;
        margin: 10px 15px 0 0;
        color: #93c5fd;
        font-size: 13px;
    }

    .preview {
        min-height: 100px;
        padding: 18px;
        border: 1px dashed #475569;
        border-radius: 10px;
        overflow-wrap: anywhere;
        line-height: 1.7;
    }

    @media(max-width:600px) {
        h1 { font-size: 24px; }
        .panel { padding: 16px; }
    }
`;
document.head.appendChild(style);

// Main menu
const navbar = document.createElement("nav");
document.body.appendChild(navbar);

const main = document.createElement("main");
document.body.appendChild(main);

const menuData = [
    { name: "File", items: ["New document", "Open text", "Download", "Print"] },
    { name: "Edit", items: ["Undo", "Clear editor", "Select all"] },
    { name: "Format", items: ["Bold", "Italic", "Uppercase"] },
    { name: "Tools", items: ["Word count", "Preview", "Change theme"] },
    { name: "Help", items: ["Instructions", "About"] }
];

let editor;
let status;
let preview;
let titleInput;
let wordStat;
let charStat;
let history = [];
let dark = true;

function message(text) {
    status.textContent = text;
}

function saveHistory() {
    history.push(editor.value);
    if (history.length > 30) history.shift();
}

function updateStats() {
    const words = editor.value.trim()
        ? editor.value.trim().split(/\s+/).length
        : 0;

    wordStat.textContent = `Words: ${words}`;
    charStat.textContent = `Characters: ${editor.value.length}`;
}

function makeButton(label, action, className = "") {
    const button = document.createElement("button");
    button.textContent = label;
    button.type = "button";
    if (className) button.className = className;
    button.addEventListener("click", action);
    return button;
}

function buildEditor() {
    main.innerHTML = "";

    const panel = document.createElement("section");
    panel.className = "panel";
    main.appendChild(panel);

    const heading = document.createElement("h1");
    heading.textContent = "✦ Creative Text Studio";
    panel.appendChild(heading);

    const subtitle = document.createElement("p");
    subtitle.className = "muted";
    subtitle.textContent =
        "Write, format, preview and download your work in one place.";
    panel.appendChild(subtitle);

    const titleLabel = document.createElement("label");
    titleLabel.textContent = "Document title";
    panel.appendChild(titleLabel);

    titleInput = document.createElement("input");
    titleInput.value = "My Creative Document";
    titleInput.placeholder = "Enter a title...";
    panel.appendChild(titleInput);

    const editorLabel = document.createElement("h2");
    editorLabel.textContent = "Your text";
    panel.appendChild(editorLabel);

    const toolbar = document.createElement("div");
    toolbar.className = "toolbar";
    panel.appendChild(toolbar);

    editor = document.createElement("textarea");
    editor.placeholder =
        "Start writing your ideas here...\n\nCreate a story, notes, an essay or a plan.";
    editor.spellcheck = true;
    panel.appendChild(editor);

    wordStat = document.createElement("span");
    wordStat.className = "stat";

    charStat = document.createElement("span");
    charStat.className = "stat";

    panel.append(wordStat, charStat);

    const actions = document.createElement("div");
    actions.className = "toolbar";
    panel.appendChild(actions);

    status = document.createElement("div");
    status.id = "status";
    panel.appendChild(status);

    const previewHeading = document.createElement("h2");
    previewHeading.textContent = "Live preview";
    panel.appendChild(previewHeading);

    preview = document.createElement("div");
    preview.className = "preview";
    preview.textContent = "Your preview will appear here.";
    panel.appendChild(preview);

    // Formatting buttons
    toolbar.append(
        makeButton("B Bold", () => wrapSelection("**", "**")),
        makeButton("I Italic", () => wrapSelection("*", "*")),
        makeButton("H1 Heading", () => wrapSelection("# ", "")),
        makeButton("Quote", () => wrapSelection("“", "”")),
        makeButton("Date", () => insertText(new Date().toLocaleDateString())),
        makeButton("✨ Idea", () => insertText("\n✨ Idea: "))
    );

    // Document actions
    actions.append(
        makeButton("＋ New", newDocument, "primary"),
        makeButton("↶ Undo", undo),
        makeButton("Select all", () => {
            editor.focus();
            editor.select();
            message("All text selected.");
        }),
        makeButton("Clear", () => {
            if (confirm("Delete all text in the editor?")) {
                saveHistory();
                editor.value = "";
                refresh();
                message("Editor cleared.");
            }
        }),
        makeButton("Download .txt", downloadText, "primary"),
        makeButton("Print", () => window.print())
    );

    editor.addEventListener("input", refresh);

    editor.addEventListener("keydown", event => {
        if ((event.ctrlKey || event.metaKey) &&
            event.key.toLowerCase() === "s") {
            event.preventDefault();
            downloadText();
        }

        if ((event.ctrlKey || event.metaKey) &&
            event.key.toLowerCase() === "b") {
            event.preventDefault();
            wrapSelection("**", "**");
        }

        if ((event.ctrlKey || event.metaKey) &&
            event.key.toLowerCase() === "i") {
            event.preventDefault();
            wrapSelection("*", "*");
        }
    });

    refresh();
}

function refresh() {
    updateStats();

    // Safe plain-text preview; HTML is not executed.
    preview.textContent = editor.value || "Your preview will appear here.";
}

function insertText(text) {
    saveHistory();

    const start = editor.selectionStart;
    const end = editor.selectionEnd;

    editor.setRangeText(text, start, end, "end");
    editor.focus();
    refresh();
    message("Content inserted.");
}

function wrapSelection(before, after) {
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selected = editor.value.slice(start, end);

    saveHistory();
    editor.setRangeText(
        before + selected + after,
        start,
        end,
        "select"
    );

    editor.focus();
    refresh();
    message("Formatting markers added.");
}

function newDocument() {
    if (editor.value && !confirm("Create a new document?")) return;

    saveHistory();
    titleInput.value = "Untitled Document";
    editor.value = "";
    refresh();
    message("New document created.");
    editor.focus();
}

function undo() {
    if (!history.length) {
        message("Nothing to undo.");
        return;
    }

    editor.value = history.pop();
    refresh();
    message("Last change reverted.");
}

function downloadText() {
    const title = titleInput.value.trim() || "document";
    const content = title + "\n\n" + editor.value;
    const blob = new Blob([content], {
        type: "text/plain;charset=utf-8"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = title.replace(/[\\/:*?"<>|]/g, "_") + ".txt";
    link.click();

    URL.revokeObjectURL(url);
    message("Download started.");
}

function closeMenus() {
    document.querySelectorAll(".menu").forEach(menu => {
        menu.classList.remove("open");
        menu.querySelector(".main-button")
            .setAttribute("aria-expanded", "false");
    });
}

// Create functional dropdown menus
menuData.forEach(data => {
    const menu = document.createElement("div");
    menu.className = "menu";

    const button = makeButton(data.name, () => {
        const wasOpen = menu.classList.contains("open");
        closeMenus();

        if (!wasOpen) {
            menu.classList.add("open");
            button.setAttribute("aria-expanded", "true");
        }
    });

    button.classList.add("main-button");
    button.setAttribute("aria-expanded", "false");

    const submenu = document.createElement("div");
    submenu.className = "submenu";

    data.items.forEach(item => {
        submenu.appendChild(makeButton(item, () => {
            runCommand(data.name, item);
            closeMenus();
        }));
    });

    menu.addEventListener("mouseenter", () => {
        closeMenus();
        menu.classList.add("open");
        button.setAttribute("aria-expanded", "true");
    });

    menu.addEventListener("mouseleave", () => {
        menu.classList.remove("open");
        button.setAttribute("aria-expanded", "false");
    });

    menu.append(button, submenu);
    navbar.appendChild(menu);
});

function runCommand(group, item) {
    if (item === "New document") return newDocument();

    if (item === "Open text") {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".txt,.md,.csv";
        input.hidden = true;

        input.addEventListener("change", async () => {
            const file = input.files[0];
            if (!file) return;

            saveHistory();
            editor.value = await file.text();
            titleInput.value = file.name.replace(/\.[^.]+$/, "");
            refresh();
            message("File opened: " + file.name);
            input.remove();
        });

        document.body.appendChild(input);
        input.click();
        return;
    }

    if (item === "Download") return downloadText();
    if (item === "Print") return window.print();

    if (item === "Undo") return undo();

    if (item === "Clear editor") {
        if (confirm("Clear all text?")) {
            saveHistory();
            editor.value = "";
            refresh();
            message("Editor cleared.");
        }
        return;
    }

    if (item === "Select all") {
        editor.focus();
        editor.select();
        return;
    }

    if (item === "Bold") return wrapSelection("**", "**");
    if (item === "Italic") return wrapSelection("*", "*");
    if (item === "Uppercase") {
        saveHistory();
        editor.value = editor.value.toUpperCase();
        refresh();
        message("Text converted to uppercase.");
        return;
    }

    if (item === "Word count") {
        updateStats();
        message(wordStat.textContent + " | " + charStat.textContent);
        return;
    }

    if (item === "Preview") {
        preview.scrollIntoView({ behavior: "smooth" });
        message("Live preview updated.");
        return;
    }

    if (item === "Change theme") {
        dark = !dark;
        document.body.style.background = dark ? "#0b1120" : "#edf2f7";
        document.body.style.color = dark ? "#e5e7eb" : "#172033";
        message("Theme changed.");
        return;
    }

    if (item === "Instructions") {
        message("Write in the editor, select text to format it, and download your work as a text file.");
        return;
    }

    if (item === "About") {
        message("Creative Text Studio — a JavaScript menu and text editor demo.");
    }
}

// Close menus when clicking outside
document.addEventListener("click", event => {
    if (!navbar.contains(event.target)) closeMenus();
});

// Start application
buildEditor();
