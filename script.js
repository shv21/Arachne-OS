// DOM Elements
const lockScreen = document.querySelector(".descktop-lockScreen");
const mainScreen = document.querySelector(".descktop-main-screen");
const loginBtn = document.querySelector(".login-btn");
const startBtn = document.querySelector(".start");
const appBox = document.querySelector(".appBox");

// App launcher & Window elements
const calcAppBtn = document.getElementById("calcAppBtn");
const calcWindow = document.getElementById("calcWindow");
const calcHeader = document.getElementById("calcHeader");
const closeCalcBtn = document.getElementById("closeCalcBtn");
const minCalcBtn = document.getElementById("minCalcBtn");

// Calculator Display Elements
const calcOutput = document.getElementById("calcOutput");
const calcHistory = document.getElementById("calcHistory");
const calcButtons = document.querySelectorAll(".calc-btn");

// Calculator Engine State
let currentInput = "0";
let previousInput = "";
let selectedOperator = null;
let shouldResetScreen = false;

// -------------------------------------------------------------
// Desktop & OS Navigation Logic
// -------------------------------------------------------------

loginBtn.addEventListener("click", () => {
    mainScreen.classList.remove("hide");
    lockScreen.classList.add("hide");
});

startBtn.addEventListener("click", () => {
    appBox.classList.toggle("hide");
});

// Calculator Launcher Events
const calcAppBtns = document.querySelectorAll(".calc-app-btn");
calcAppBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        calcWindow.classList.remove("hide");
        appBox.classList.add("hide"); // Auto-close start menu when app launches
        bringToFront(calcWindow);
    });
});

closeCalcBtn.addEventListener("click", () => {
    calcWindow.classList.add("hide");
});

minCalcBtn.addEventListener("click", () => {
    calcWindow.classList.add("hide");
});

// Z-Index Window Management
let highestZIndex = 100;
function bringToFront(windowElement) {
    highestZIndex++;
    windowElement.style.zIndex = highestZIndex;
}

calcWindow.addEventListener("mousedown", () => {
    bringToFront(calcWindow);
});

// -------------------------------------------------------------
// Draggable Window Functionality
// -------------------------------------------------------------

function makeDraggable(windowEl, headerEl) {
    let offsetX = 0, offsetY = 0, isDragging = false;

    headerEl.addEventListener("mousedown", (e) => {
        if (e.target.classList.contains("win-btn") || windowEl.classList.contains("maximized")) return; // Don't drag if clicking buttons or if maximized
        isDragging = true;
        offsetX = e.clientX - windowEl.offsetLeft;
        offsetY = e.clientY - windowEl.offsetTop;
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
    });

    function onMouseMove(e) {
        if (!isDragging) return;
        let newX = e.clientX - offsetX;
        let newY = e.clientY - offsetY;

        // Keep window within viewport bounds
        const maxWidth = window.innerWidth - windowEl.offsetWidth;
        const maxHeight = window.innerHeight - windowEl.offsetHeight - 80; // keep above dock

        newX = Math.max(0, Math.min(newX, maxWidth));
        newY = Math.max(0, Math.min(newY, maxHeight));

        windowEl.style.left = `${newX}px`;
        windowEl.style.top = `${newY}px`;
    }

    function onMouseUp() {
        isDragging = false;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
    }
}

makeDraggable(calcWindow, calcHeader);

// -------------------------------------------------------------
// Calculator Mathematical Logic
// -------------------------------------------------------------

function updateDisplay() {
    calcOutput.textContent = currentInput;
    if (selectedOperator !== null && previousInput !== "") {
        const opSymbol = selectedOperator === "*" ? "×" : selectedOperator === "/" ? "÷" : selectedOperator === "-" ? "−" : "+";
        calcHistory.textContent = `${previousInput} ${opSymbol}`;
    } else {
        calcHistory.textContent = "";
    }
}

function handleNumber(numStr) {
    if (currentInput === "0" || shouldResetScreen) {
        currentInput = numStr === "." ? "0." : numStr;
        shouldResetScreen = false;
    } else {
        if (numStr === "." && currentInput.includes(".")) return;
        if (currentInput.length >= 12) return; // limit display digits
        currentInput += numStr;
    }
    updateDisplay();
}

function handleOperator(op) {
    if (selectedOperator !== null && !shouldResetScreen) {
        calculateResult();
    }
    previousInput = currentInput;
    selectedOperator = op;
    shouldResetScreen = true;
    updateDisplay();
}

function calculateResult() {
    if (selectedOperator === null || previousInput === "") return;

    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);
    let result = 0;

    switch (selectedOperator) {
        case "+":
            result = prev + current;
            break;
        case "-":
            result = prev - current;
            break;
        case "*":
            result = prev * current;
            break;
        case "/":
            if (current === 0) {
                currentInput = "Error";
                selectedOperator = null;
                previousInput = "";
                shouldResetScreen = true;
                updateDisplay();
                return;
            }
            result = prev / current;
            break;
    }

    // Format output precision
    result = Math.round(result * 1e8) / 1e8;
    currentInput = result.toString();
    selectedOperator = null;
    previousInput = "";
    shouldResetScreen = true;
    updateDisplay();
}

function handleClear() {
    currentInput = "0";
    previousInput = "";
    selectedOperator = null;
    shouldResetScreen = false;
    updateDisplay();
}

function handleToggleSign() {
    if (currentInput === "0" || currentInput === "Error") return;
    currentInput = (parseFloat(currentInput) * -1).toString();
    updateDisplay();
}

function handlePercent() {
    if (currentInput === "Error") return;
    currentInput = (parseFloat(currentInput) / 100).toString();
    updateDisplay();
}

// Button Click Listener Setup
calcButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const num = btn.getAttribute("data-num");
        const op = btn.getAttribute("data-op");
        const action = btn.getAttribute("data-action");

        if (num !== null) {
            handleNumber(num);
        } else if (op !== null) {
            handleOperator(op);
        } else if (action !== null) {
            if (action === "clear") handleClear();
            else if (action === "equals") calculateResult();
            else if (action === "toggle-sign") handleToggleSign();
            else if (action === "percent") handlePercent();
        }
    });
});

// Keyboard Accessibility Support
document.addEventListener("keydown", (e) => {
    if (calcWindow && !calcWindow.classList.contains("hide")) {
        if (e.key >= "0" && e.key <= "9") handleNumber(e.key);
        else if (e.key === ".") handleNumber(".");
        else if (e.key === "+") handleOperator("+");
        else if (e.key === "-") handleOperator("-");
        else if (e.key === "*") handleOperator("*");
        else if (e.key === "/") handleOperator("/");
        else if (e.key === "Enter" || e.key === "=") {
            e.preventDefault();
            calculateResult();
        } else if (e.key === "Escape" || e.key.toLowerCase() === "c") handleClear();
        else if (e.key === "Backspace") {
            if (currentInput.length > 1 && currentInput !== "Error") {
                currentInput = currentInput.slice(0, -1);
            } else {
                currentInput = "0";
            }
            updateDisplay();
        }
    }
});

// -------------------------------------------------------------
// Chrome Browser Application Module
// -------------------------------------------------------------

const chromeWindow = document.getElementById("chromeWindow");
const chromeHeader = document.getElementById("chromeHeader");
const closeChromeBtn = document.getElementById("closeChromeBtn");
const minChromeBtn = document.getElementById("minChromeBtn");
const maxChromeBtn = document.getElementById("maxChromeBtn");

const chromeAppBtns = document.querySelectorAll(".chrome-app-btn");
const tabsList = document.getElementById("tabsList");
const addTabBtn = document.getElementById("addTabBtn");
const chromeViewport = document.getElementById("chromeViewport");

const chromeUrlForm = document.getElementById("chromeUrlForm");
const chromeUrlInput = document.getElementById("chromeUrlInput");
const chromeBackBtn = document.getElementById("chromeBackBtn");
const chromeForwardBtn = document.getElementById("chromeForwardBtn");
const chromeReloadBtn = document.getElementById("chromeReloadBtn");
const chromeHomeBtn = document.getElementById("chromeHomeBtn");
const bookmarkChips = document.querySelectorAll(".bookmark-chip");
const chromeBookmarkBtn = document.getElementById("chromeBookmarkBtn");

// State Management for Chrome Browser
let tabs = [];
let activeTabId = null;
let tabIdCounter = 0;

// Open Chrome Window
chromeAppBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        chromeWindow.classList.remove("hide");
        appBox.classList.add("hide"); // Close start menu on launch
        bringToFront(chromeWindow);
        if (tabs.length === 0) {
            createNewTab();
        }
    });
});

chromeWindow.addEventListener("mousedown", () => {
    bringToFront(chromeWindow);
});

makeDraggable(chromeWindow, chromeHeader);

// Window Controls
closeChromeBtn.addEventListener("click", () => {
    chromeWindow.classList.add("hide");
});

minChromeBtn.addEventListener("click", () => {
    chromeWindow.classList.add("hide");
});

let isMaximized = false;
maxChromeBtn.addEventListener("click", () => {
    isMaximized = !isMaximized;
    if (isMaximized) {
        chromeWindow.classList.add("maximized");
        maxChromeBtn.textContent = "❐";
    } else {
        chromeWindow.classList.remove("maximized");
        maxChromeBtn.textContent = "□";
    }
});

// Tab Creation & Switching
function createNewTab(initialUrl = "chrome://newtab", title = "New Tab") {
    tabIdCounter++;
    const tabId = `tab-${tabIdCounter}`;

    const tabData = {
        id: tabId,
        url: initialUrl,
        title: title,
        favicon: "🕸️",
        history: [initialUrl],
        historyIndex: 0
    };

    tabs.push(tabData);

    // Create Tab UI element
    const tabEl = document.createElement("div");
    tabEl.className = "chrome-tab";
    tabEl.id = `tab-btn-${tabId}`;
    tabEl.innerHTML = `
        <span class="tab-favicon">${tabData.favicon}</span>
        <span class="tab-title">${tabData.title}</span>
        <button class="tab-close-btn" title="Close tab">✕</button>
    `;

    tabEl.addEventListener("click", (e) => {
        if (e.target.classList.contains("tab-close-btn")) {
            e.stopPropagation();
            closeTab(tabId);
        } else {
            switchToTab(tabId);
        }
    });

    tabsList.appendChild(tabEl);

    // Create Viewport Container for this Tab
    const contentEl = document.createElement("div");
    contentEl.className = "tab-content";
    contentEl.id = `tab-content-${tabId}`;
    chromeViewport.appendChild(contentEl);

    switchToTab(tabId);
    navigateTab(tabId, initialUrl);
}

function switchToTab(tabId) {
    activeTabId = tabId;
    const tabData = tabs.find(t => t.id === tabId);
    if (!tabData) return;

    // Update active tab buttons
    document.querySelectorAll(".chrome-tab").forEach(el => el.classList.remove("active"));
    const activeTabBtn = document.getElementById(`tab-btn-${tabId}`);
    if (activeTabBtn) activeTabBtn.classList.add("active");

    // Update active viewport content
    document.querySelectorAll(".tab-content").forEach(el => el.classList.remove("active"));
    const activeContent = document.getElementById(`tab-content-${tabId}`);
    if (activeContent) activeContent.classList.add("active");

    // Update Address Bar & Nav Buttons
    chromeUrlInput.value = tabData.url === "chrome://newtab" ? "" : tabData.url;
    updateNavControls(tabData);
}

function closeTab(tabId) {
    const tabIndex = tabs.findIndex(t => t.id === tabId);
    if (tabIndex === -1) return;

    // Remove DOM elements
    const tabBtn = document.getElementById(`tab-btn-${tabId}`);
    const tabContent = document.getElementById(`tab-content-${tabId}`);
    if (tabBtn) tabBtn.remove();
    if (tabContent) tabContent.remove();

    tabs.splice(tabIndex, 1);

    if (tabs.length === 0) {
        createNewTab();
    } else {
        const nextTab = tabs[Math.max(0, tabIndex - 1)];
        switchToTab(nextTab.id);
    }
}

addTabBtn.addEventListener("click", () => {
    createNewTab();
});

// Navigation Engine
function navigateTab(tabId, input) {
    const tabData = tabs.find(t => t.id === tabId);
    if (!tabData) return;

    let targetUrl = input.trim();
    let displayTitle = "Web Page";
    let icon = "🌐";

    if (!targetUrl || targetUrl === "chrome://newtab") {
        targetUrl = "chrome://newtab";
        displayTitle = "New Tab";
        icon = "🕸️";
    } else if (targetUrl.startsWith("arachne://portal")) {
        targetUrl = "arachne://portal";
        displayTitle = "Arachne Web Portal";
        icon = "🕷️";
    } else {
        const isUrlPattern = /^(https?:\/\/)?([\w\-]+\.)+[\w\-]+(\/.*)?$/i.test(targetUrl);
        if (!isUrlPattern && !targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
            targetUrl = `https://www.google.com/search?q=${encodeURIComponent(targetUrl)}`;
        } else if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
            targetUrl = `https://${targetUrl}`;
        }

        try {
            const urlObj = new URL(targetUrl);
            displayTitle = urlObj.hostname.replace("www.", "");
            if (displayTitle.includes("google")) icon = "🔍";
            else if (displayTitle.includes("github")) icon = "🐙";
            else if (displayTitle.includes("wikipedia")) icon = "📚";
        } catch (e) {
            displayTitle = targetUrl;
        }
    }

    tabData.url = targetUrl;
    tabData.title = displayTitle;
    tabData.favicon = icon;

    // Update Tab UI Title & Icon
    const tabBtn = document.getElementById(`tab-btn-${tabId}`);
    if (tabBtn) {
        tabBtn.querySelector(".tab-title").textContent = displayTitle;
        tabBtn.querySelector(".tab-favicon").textContent = icon;
    }

    if (activeTabId === tabId) {
        chromeUrlInput.value = targetUrl === "chrome://newtab" ? "" : targetUrl;
    }

    // Render Viewport Content
    const contentEl = document.getElementById(`tab-content-${tabId}`);
    if (!contentEl) return;

    if (targetUrl === "chrome://newtab") {
        contentEl.innerHTML = renderNewTabPage(tabId);
        bindNtpEvents(contentEl, tabId);
    } else if (targetUrl === "arachne://portal") {
        contentEl.innerHTML = renderArachnePortal();
    } else {
        renderWebFrame(contentEl, targetUrl, displayTitle);
    }

    updateNavControls(tabData);
}

function renderNewTabPage(tabId) {
    return `
        <div class="chrome-new-tab-page">
            <div class="ntp-hero">
                <div class="ntp-logo"><span>🕷️</span> Arachne Chrome</div>
                <div class="ntp-sub">Cyber Spider Edition Web Engine</div>
            </div>
            
            <div class="ntp-search-box">
                <form class="ntp-search-form" onsubmit="event.preventDefault(); handleNtpSearch('${tabId}', this.querySelector('input').value);">
                    <span class="ntp-search-icon">🔍</span>
                    <input type="text" class="ntp-search-input" placeholder="Search Google or type a URL..." autofocus>
                </form>
            </div>

            <div class="ntp-shortcuts">
                <a class="ntp-shortcut" onclick="navigateTab('${tabId}', 'https://google.com')">
                    <div class="shortcut-icon-box">🔍</div>
                    <span class="shortcut-name">Google</span>
                </a>
                <a class="ntp-shortcut" onclick="navigateTab('${tabId}', 'https://wikipedia.org')">
                    <div class="shortcut-icon-box">🌐</div>
                    <span class="shortcut-name">Wikipedia</span>
                </a>
                <a class="ntp-shortcut" onclick="navigateTab('${tabId}', 'https://github.com')">
                    <div class="shortcut-icon-box">🐙</div>
                    <span class="shortcut-name">GitHub</span>
                </a>
                <a class="ntp-shortcut" onclick="navigateTab('${tabId}', 'arachne://portal')">
                    <div class="shortcut-icon-box">🕸️</div>
                    <span class="shortcut-name">Arachne Web</span>
                </a>
            </div>
        </div>
    `;
}

function bindNtpEvents(contentEl, tabId) {
    const input = contentEl.querySelector(".ntp-search-input");
    if (input) input.focus();
}

window.handleNtpSearch = function (tabId, query) {
    if (query) {
        navigateTab(tabId, query);
    }
};

window.navigateTab = navigateTab;

function renderArachnePortal() {
    return `
        <div class="simulated-web-page">
            <div class="sim-header">
                <div class="sim-title">🕸️ Arachne OS Web Portal</div>
                <span style="color:#00ffff; font-size: 13px;">Version 2.5 (Cyber Spider Edition)</span>
            </div>

            <div class="sim-notice">
                <span>⚡ Welcome to Arachne OS Cyber Portal! Your gateway to web applications, developer tools, and high-tech OS utilities.</span>
            </div>

            <div class="sim-card-grid">
                <div class="sim-card">
                    <h3>🕷️ Wallpapers & Custom Themes</h3>
                    <p>Customize your Arachne OS lockscreen, desktop glow effects, neon cyan boundaries, and spider web background wallpaper.</p>
                </div>
                <div class="sim-card">
                    <h3>🧮 Arachne Calculator</h3>
                    <p>Built-in glassmorphism scientific engine supporting precision mathematical operations and keyboard accessibility.</p>
                </div>
                <div class="sim-card">
                    <h3>🌐 Arachne Chrome Browser</h3>
                    <p>Multi-tab browsing engine with tab management, next tab feature, URL bar navigation, bookmarks bar, and security indicators.</p>
                </div>
                <div class="sim-card">
                    <h3>💻 VS Code Web Studio</h3>
                    <p>Next-gen code editor workspace tailored for JavaScript, HTML, CSS, and modern web application development.</p>
                </div>
            </div>
        </div>
    `;
}

function renderWebFrame(container, url, displayTitle) {
    container.innerHTML = `
        <iframe src="${url}" class="chrome-iframe" title="${displayTitle}" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>
    `;
}

// Navigation Controls Listeners
chromeUrlForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (activeTabId && chromeUrlInput.value) {
        const tabData = tabs.find(t => t.id === activeTabId);
        if (tabData) {
            tabData.history.push(chromeUrlInput.value);
            tabData.historyIndex = tabData.history.length - 1;
        }
        navigateTab(activeTabId, chromeUrlInput.value);
    }
});

chromeBackBtn.addEventListener("click", () => {
    if (!activeTabId) return;
    const tabData = tabs.find(t => t.id === activeTabId);
    if (tabData && tabData.historyIndex > 0) {
        tabData.historyIndex--;
        navigateTab(activeTabId, tabData.history[tabData.historyIndex]);
    }
});

chromeForwardBtn.addEventListener("click", () => {
    if (!activeTabId) return;
    const tabData = tabs.find(t => t.id === activeTabId);
    if (tabData && tabData.historyIndex < tabData.history.length - 1) {
        tabData.historyIndex++;
        navigateTab(activeTabId, tabData.history[tabData.historyIndex]);
    }
});

chromeReloadBtn.addEventListener("click", () => {
    if (!activeTabId) return;
    const tabData = tabs.find(t => t.id === activeTabId);
    if (tabData) {
        navigateTab(activeTabId, tabData.url);
    }
});

chromeHomeBtn.addEventListener("click", () => {
    if (!activeTabId) return;
    navigateTab(activeTabId, "chrome://newtab");
});

bookmarkChips.forEach(chip => {
    chip.addEventListener("click", () => {
        const targetUrl = chip.getAttribute("data-url");
        if (activeTabId && targetUrl) {
            navigateTab(activeTabId, targetUrl);
        }
    });
});

chromeBookmarkBtn.addEventListener("click", () => {
    chromeBookmarkBtn.classList.toggle("active");
});

function updateNavControls(tabData) {
    chromeBackBtn.disabled = tabData.historyIndex <= 0;
    chromeForwardBtn.disabled = tabData.historyIndex >= tabData.history.length - 1;
}

// -------------------------------------------------------------
// VS Code Studio Application Module
// -------------------------------------------------------------

const vscodeWindow = document.getElementById("vscodeWindow");
const vscodeHeader = document.getElementById("vscodeHeader");
const closeVscodeBtn = document.getElementById("closeVscodeBtn");
const minVscodeBtn = document.getElementById("minVscodeBtn");
const maxVscodeBtn = document.getElementById("maxVscodeBtn");
const vscodeAppBtns = document.querySelectorAll(".vscode-app-btn");

const vscodeTabsList = document.getElementById("vscodeTabsList");
const addCodeTabBtn = document.getElementById("addCodeTabBtn");
const codeEditor = document.getElementById("codeEditor");
const lineNumbers = document.getElementById("lineNumbers");
const runCodeBtn = document.getElementById("runCodeBtn");
const terminalConsole = document.getElementById("terminalConsole");
const clearTerminalBtn = document.getElementById("clearTerminalBtn");
const vscodeCurrentFileName = document.getElementById("vscodeCurrentFileName");
const vscodeCursorPos = document.getElementById("vscodeCursorPos");
const vscodeLangMode = document.getElementById("vscodeLangMode");
const fileTreeItems = document.querySelectorAll(".file-item");

// Default Project Code Files
const projectFiles = {
    "script.js": `// Arachne OS Cyber Script Engine
console.log("🕸️ Initializing Arachne OS...");

function calculateSpiderWeb(powerLevel) {
    const webDensity = powerLevel * 42;
    console.log("🕸️ Web Density calculated:", webDensity + " N/m²");
    return webDensity;
}

const spiderPower = 100;
calculateSpiderWeb(spiderPower);
console.log("✨ Arachne OS Script execution complete!");`,

    "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Arachne OS Cyber Portal</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="cyber-container">
        <h1>🕸️ Welcome to Arachne OS</h1>
        <p>Cyber Spider Edition Web Environment</p>
    </div>
</body>
</html>`,

    "style.css": `/* Arachne OS Theme Styles */
body {
    background: #090c15;
    color: #00ffff;
    font-family: Arial, sans-serif;
}

.cyber-container {
    padding: 30px;
    border: 1px solid rgba(0, 225, 255, 0.4);
    box-shadow: 0 0 25px rgba(0, 225, 255, 0.3);
}`,

    "main.py": `# Arachne OS Python Module
print("🐍 Arachne Python Engine v3.12")

def activate_spider_mode(agent_name):
    print(f"🕸️ Activating Cyber Suit for {agent_name}...")
    return True

activate_spider_mode("Peter Parker")
print("✅ Cyber Spider Suit Online!")`,

    "README.md": `# Arachne OS - Cyber Spider Edition
Welcome to **Arachne OS**!

### Features:
- 🌐 **Chrome Browser**: Multi-tab browsing engine with address bar & bookmarks.
- 💙 **VS Code Studio**: Interactive code editor with live terminal code execution.
- 🧮 **Arachne Calculator**: High-precision glassmorphic scientific calculator.
- 🕷️ **Spider-Man Glassmorphism Theme**: Cyber cyan and neon pink aesthetic.
`
};

let openVsCodeTabs = [];
let activeVsCodeFile = null;

// Open VS Code Application
vscodeAppBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        vscodeWindow.classList.remove("hide");
        appBox.classList.add("hide"); // Auto-close start menu
        bringToFront(vscodeWindow);
        if (openVsCodeTabs.length === 0) {
            openVsCodeFile("script.js");
        }
    });
});

vscodeWindow.addEventListener("mousedown", () => {
    bringToFront(vscodeWindow);
});

makeDraggable(vscodeWindow, vscodeHeader);

// Window Controls
closeVscodeBtn.addEventListener("click", () => {
    vscodeWindow.classList.add("hide");
});

minVscodeBtn.addEventListener("click", () => {
    vscodeWindow.classList.add("hide");
});

let isVsCodeMaximized = false;
maxVscodeBtn.addEventListener("click", () => {
    isVsCodeMaximized = !isVsCodeMaximized;
    if (isVsCodeMaximized) {
        vscodeWindow.classList.add("maximized");
        maxVscodeBtn.textContent = "❐";
    } else {
        vscodeWindow.classList.remove("maximized");
        maxVscodeBtn.textContent = "□";
    }
});

// File Explorer Click Listeners
fileTreeItems.forEach(item => {
    item.addEventListener("click", () => {
        const fileName = item.getAttribute("data-filename");
        if (fileName) {
            openVsCodeFile(fileName);
        }
    });
});

function openVsCodeFile(fileName) {
    let tabData = openVsCodeTabs.find(t => t.name === fileName);

    if (!tabData) {
        let content = projectFiles[fileName] || `// New file: ${fileName}\n`;
        let icon = fileName.endsWith(".html") ? "📄" : fileName.endsWith(".css") ? "🎨" : fileName.endsWith(".py") ? "🐍" : fileName.endsWith(".md") ? "📝" : "⚡";

        tabData = {
            name: fileName,
            icon: icon,
            content: content
        };

        openVsCodeTabs.push(tabData);
        renderVsCodeTabButton(tabData);
    }

    switchToVsCodeFile(fileName);
}

function renderVsCodeTabButton(tabData) {
    const tabEl = document.createElement("div");
    tabEl.className = "vscode-tab";
    tabEl.id = `vstab-${tabData.name.replace(".", "-")}`;
    tabEl.innerHTML = `
        <span class="file-icon">${tabData.icon}</span>
        <span class="tab-name">${tabData.name}</span>
        <button class="tab-close-btn" title="Close file">✕</button>
    `;

    tabEl.addEventListener("click", (e) => {
        if (e.target.classList.contains("tab-close-btn")) {
            e.stopPropagation();
            closeVsCodeTab(tabData.name);
        } else {
            switchToVsCodeFile(tabData.name);
        }
    });

    vscodeTabsList.appendChild(tabEl);
}

function switchToVsCodeFile(fileName) {
    if (activeVsCodeFile && codeEditor) {
        // Save current changes into active file cache
        const currentTab = openVsCodeTabs.find(t => t.name === activeVsCodeFile);
        if (currentTab) {
            currentTab.content = codeEditor.value;
        }
    }

    activeVsCodeFile = fileName;
    const tabData = openVsCodeTabs.find(t => t.name === fileName);
    if (!tabData) return;

    // Update active tab buttons
    document.querySelectorAll(".vscode-tab").forEach(el => el.classList.remove("active"));
    const activeTabEl = document.getElementById(`vstab-${fileName.replace(".", "-")}`);
    if (activeTabEl) activeTabEl.classList.add("active");

    // Update Explorer sidebar active state
    fileTreeItems.forEach(item => {
        if (item.getAttribute("data-filename") === fileName) {
            item.classList.add("active");
        } else {
            item.classList.remove("active");
        }
    });

    // Update Code Editor Content
    codeEditor.value = tabData.content;
    vscodeCurrentFileName.textContent = fileName;

    // Update Language Mode
    const lang = fileName.endsWith(".html") ? "HTML" : fileName.endsWith(".css") ? "CSS" : fileName.endsWith(".py") ? "Python" : fileName.endsWith(".md") ? "Markdown" : "JavaScript";
    vscodeLangMode.textContent = lang;

    updateLineNumbers();
    updateCursorPosition();
}

function closeVsCodeTab(fileName) {
    const index = openVsCodeTabs.findIndex(t => t.name === fileName);
    if (index === -1) return;

    const tabEl = document.getElementById(`vstab-${fileName.replace(".", "-")}`);
    if (tabEl) tabEl.remove();

    openVsCodeTabs.splice(index, 1);

    if (openVsCodeTabs.length === 0) {
        activeVsCodeFile = null;
        codeEditor.value = "";
        vscodeCurrentFileName.textContent = "Untitled";
        updateLineNumbers();
    } else {
        const nextTab = openVsCodeTabs[Math.max(0, index - 1)];
        switchToVsCodeFile(nextTab.name);
    }
}

addCodeTabBtn.addEventListener("click", () => {
    const newName = `file${openVsCodeTabs.length + 1}.js`;
    openVsCodeFile(newName);
});

// Line Numbers Calculation & Sync
function updateLineNumbers() {
    const lines = codeEditor.value.split("\n").length;
    lineNumbers.innerHTML = Array.from({ length: lines }, (_, i) => i + 1).join("<br>");
}

codeEditor.addEventListener("input", () => {
    if (activeVsCodeFile) {
        const tabData = openVsCodeTabs.find(t => t.name === activeVsCodeFile);
        if (tabData) tabData.content = codeEditor.value;
    }
    updateLineNumbers();
});

codeEditor.addEventListener("scroll", () => {
    lineNumbers.scrollTop = codeEditor.scrollTop;
});

function updateCursorPosition() {
    const pos = codeEditor.selectionStart;
    const textBefore = codeEditor.value.substring(0, pos);
    const lines = textBefore.split("\n");
    const currentLine = lines.length;
    const currentCol = lines[lines.length - 1].length + 1;
    vscodeCursorPos.textContent = `Ln ${currentLine}, Col ${currentCol}`;
}

codeEditor.addEventListener("keyup", updateCursorPosition);
codeEditor.addEventListener("click", updateCursorPosition);

// Code Execution Terminal Engine
runCodeBtn.addEventListener("click", runCode);

function runCode() {
    if (!codeEditor.value.trim()) return;

    appendTerminalLine(`▶ Executing ${activeVsCodeFile || "Script"}...`, "info");

    const code = codeEditor.value;

    try {
        // Intercept console output
        let outputs = [];
        const customConsole = {
            log: (...args) => outputs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(" ")),
            error: (...args) => outputs.push("❌ Error: " + args.join(" ")),
            warn: (...args) => outputs.push("⚠️ Warning: " + args.join(" "))
        };

        // Safe evaluation scope
        const runFn = new Function("console", code);
        runFn(customConsole);

        if (outputs.length > 0) {
            outputs.forEach(msg => appendTerminalLine(msg, msg.startsWith("❌") ? "error" : "success"));
        } else {
            appendTerminalLine("✓ Code executed with no console output.", "success");
        }
    } catch (err) {
        appendTerminalLine(`❌ Runtime Exception: ${err.message}`, "error");
    }
}

function appendTerminalLine(text, type = "info") {
    const lineEl = document.createElement("div");
    lineEl.className = `term-line ${type}`;
    lineEl.textContent = `[${new Date().toLocaleTimeString()}] ${text}`;
    terminalConsole.appendChild(lineEl);
    terminalConsole.scrollTop = terminalConsole.scrollHeight;
}

clearTerminalBtn.addEventListener("click", () => {
    terminalConsole.innerHTML = `
        <div class="term-line info">Arachne Cyber Terminal v2.5 [Node v24.12.0]</div>
        <div class="term-line success">Terminal cleared.</div>
    `;
});

// -------------------------------------------------------------
// File Explorer Application Module
// -------------------------------------------------------------

const filesWindow = document.getElementById("filesWindow");
const filesHeader = document.getElementById("filesHeader");
const closeFilesBtn = document.getElementById("closeFilesBtn");
const minFilesBtn = document.getElementById("minFilesBtn");
const maxFilesBtn = document.getElementById("maxFilesBtn");
const filesAppBtns = document.querySelectorAll(".files-app-btn");

const filesPathInput = document.getElementById("filesPathInput");
const filesSearchInput = document.getElementById("filesSearchInput");
const filesGrid = document.getElementById("filesGrid");
const gridViewBtn = document.getElementById("gridViewBtn");
const listViewBtn = document.getElementById("listViewBtn");
const newFolderBtn = document.getElementById("newFolderBtn");

const filesBackBtn = document.getElementById("filesBackBtn");
const filesForwardBtn = document.getElementById("filesForwardBtn");
const filesUpBtn = document.getElementById("filesUpBtn");
const filesRefreshBtn = document.getElementById("filesRefreshBtn");
const filesSidebarItems = document.querySelectorAll(".files-sidebar .sidebar-item");

const filesItemCount = document.getElementById("filesItemCount");
const filesSelectionCount = document.getElementById("filesSelectionCount");

// Virtual File System Database
const virtualFS = {
    "Desktop": [
        { name: "Projects", isFolder: true, icon: "📁", meta: "Folder" },
        { name: "wallpapers", isFolder: true, icon: "📁", meta: "Folder" },
        { name: "index.html", isFolder: false, icon: "📄", meta: "4.3 KB" },
        { name: "style.css", isFolder: false, icon: "🎨", meta: "19.4 KB" },
        { name: "script.js", isFolder: false, icon: "⚡", meta: "31.9 KB" },
        { name: "main.py", isFolder: false, icon: "🐍", meta: "1.2 KB" },
        { name: "README.md", isFolder: false, icon: "📝", meta: "2.8 KB" },
        { name: "spider-icon.png", isFolder: false, icon: "🖼️", meta: "152 KB" }
    ],
    "Documents": [
        { name: "Spider-Notes.txt", isFolder: false, icon: "📝", meta: "3.2 KB" },
        { name: "Project-Plan.pdf", isFolder: false, icon: "📕", meta: "1.4 MB" },
        { name: "System-Report.docx", isFolder: false, icon: "📘", meta: "840 KB" },
        { name: "Arachne-API.json", isFolder: false, icon: "⚙️", meta: "18.5 KB" }
    ],
    "Downloads": [
        { name: "cyber-beat.mp3", isFolder: false, icon: "🎵", meta: "4.8 MB" },
        { name: "ArachneOS-v2.5.zip", isFolder: false, icon: "📦", meta: "42.1 MB" },
        { name: "spider-wallpaper.png", isFolder: false, icon: "🖼️", meta: "3.7 MB" },
        { name: "Setup.exe", isFolder: false, icon: "💿", meta: "12.0 MB" }
    ],
    "Pictures": [
        { name: "spider-man-across.png", isFolder: false, icon: "🖼️", meta: "1.9 MB" },
        { name: "spider-man-logo.png", isFolder: false, icon: "🖼️", meta: "374 KB" },
        { name: "avatar-spider.png", isFolder: false, icon: "🖼️", meta: "520 KB" },
        { name: "neon-city.jpg", isFolder: false, icon: "🖼️", meta: "2.4 MB" }
    ],
    "Music": [
        { name: "synthwave-drive.mp3", isFolder: false, icon: "🎵", meta: "5.2 MB" },
        { name: "cyber-spider-theme.wav", isFolder: false, icon: "🎵", meta: "14.8 MB" },
        { name: "neon-nights.flac", isFolder: false, icon: "🎵", meta: "28.1 MB" }
    ],
    "Videos": [
        { name: "arachne-os-demo.mp4", isFolder: false, icon: "📽️", meta: "48.2 MB" },
        { name: "spider-man-trailer.mkv", isFolder: false, icon: "📽️", meta: "120 MB" }
    ],
    "Projects": [
        { name: "Arachne-OS", isFolder: true, icon: "🕸️", meta: "Folder" },
        { name: "Ask-Gemini-App", isFolder: true, icon: "🤖", meta: "Folder" },
        { name: "Spider-Web-Bot", isFolder: true, icon: "🕷️", meta: "Folder" }
    ],
    "Cyber Storage (C:)": [
        { name: "Desktop", isFolder: true, icon: "🖥️", meta: "Folder" },
        { name: "Documents", isFolder: true, icon: "📁", meta: "Folder" },
        { name: "Downloads", isFolder: true, icon: "⬇️", meta: "Folder" },
        { name: "Pictures", isFolder: true, icon: "🖼️", meta: "Folder" },
        { name: "Music", isFolder: true, icon: "🎵", meta: "Folder" },
        { name: "Videos", isFolder: true, icon: "📽️", meta: "Folder" }
    ]
};

// Navigation History State
let currentFolderPath = "Desktop";
let filesHistory = ["Desktop"];
let filesHistoryIndex = 0;
let selectedFileNames = new Set();
let isListView = false;

// Open File Explorer Application
filesAppBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        filesWindow.classList.remove("hide");
        appBox.classList.add("hide"); // Auto-close start menu
        bringToFront(filesWindow);
        renderCurrentFolder();
    });
});

filesWindow.addEventListener("mousedown", () => {
    bringToFront(filesWindow);
});

makeDraggable(filesWindow, filesHeader);

// Window Controls
closeFilesBtn.addEventListener("click", () => {
    filesWindow.classList.add("hide");
});

minFilesBtn.addEventListener("click", () => {
    filesWindow.classList.add("hide");
});

let isFilesMaximized = false;
maxFilesBtn.addEventListener("click", () => {
    isFilesMaximized = !isFilesMaximized;
    if (isFilesMaximized) {
        filesWindow.classList.add("maximized");
        maxFilesBtn.textContent = "❐";
    } else {
        filesWindow.classList.remove("maximized");
        maxFilesBtn.textContent = "□";
    }
});

// Sidebar Quick Access Click Handling
filesSidebarItems.forEach(item => {
    item.addEventListener("click", () => {
        const targetPath = item.getAttribute("data-path");
        if (targetPath) {
            navigateToFolder(targetPath);
        }
    });
});

function navigateToFolder(folderName) {
    if (!virtualFS[folderName] && folderName !== "Cyber Storage (C:)") {
        // Create dynamic subfolder if not existing
        virtualFS[folderName] = [
            { name: "README.txt", isFolder: false, icon: "📝", meta: "1.0 KB" }
        ];
    }

    currentFolderPath = folderName;
    filesHistory.push(folderName);
    filesHistoryIndex = filesHistory.length - 1;
    selectedFileNames.clear();

    renderCurrentFolder();
}

function renderCurrentFolder(searchQuery = "") {
    filesPathInput.value = `Cyber Storage (C:) > ${currentFolderPath}`;

    // Update Sidebar Active state
    filesSidebarItems.forEach(item => {
        if (item.getAttribute("data-path") === currentFolderPath) {
            item.classList.add("active");
        } else {
            item.classList.remove("active");
        }
    });

    let items = virtualFS[currentFolderPath] || [];

    if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        items = items.filter(i => i.name.toLowerCase().includes(q));
    }

    filesGrid.innerHTML = "";
    if (isListView) {
        filesGrid.classList.add("list-mode");
    } else {
        filesGrid.classList.remove("list-mode");
    }

    items.forEach(item => {
        const card = document.createElement("div");
        card.className = "file-card";
        if (selectedFileNames.has(item.name)) card.classList.add("selected");

        card.innerHTML = `
            <div class="card-icon">${item.icon}</div>
            <div class="card-name" title="${item.name}">${item.name}</div>
            <div class="card-meta">${item.meta}</div>
        `;

        // Single click select
        card.addEventListener("click", (e) => {
            if (!e.ctrlKey) {
                selectedFileNames.clear();
                document.querySelectorAll(".file-card").forEach(c => c.classList.remove("selected"));
            }
            selectedFileNames.add(item.name);
            card.classList.add("selected");
            updateFilesStatusBar(items.length);
        });

        // Double click navigate / open
        card.addEventListener("dblclick", () => {
            if (item.isFolder) {
                navigateToFolder(item.name);
            } else {
                openFilePreview(item);
            }
        });

        filesGrid.appendChild(card);
    });

    updateFilesNavButtons();
    updateFilesStatusBar(items.length);
}

function openFilePreview(item) {
    if (item.name.endsWith(".html") || item.name.endsWith(".js") || item.name.endsWith(".css") || item.name.endsWith(".py")) {
        // Open in VS Code
        vscodeWindow.classList.remove("hide");
        bringToFront(vscodeWindow);
        openVsCodeFile(item.name);
    } else {
        alert(`📄 Opening file "${item.name}" (${item.meta}) in Arachne OS Viewer...`);
    }
}

// Search Filter
filesSearchInput.addEventListener("input", (e) => {
    renderCurrentFolder(e.target.value);
});

// View Toggles
gridViewBtn.addEventListener("click", () => {
    isListView = false;
    gridViewBtn.classList.add("active");
    listViewBtn.classList.remove("active");
    renderCurrentFolder(filesSearchInput.value);
});

listViewBtn.addEventListener("click", () => {
    isListView = true;
    listViewBtn.classList.add("active");
    gridViewBtn.classList.remove("active");
    renderCurrentFolder(filesSearchInput.value);
});

newFolderBtn.addEventListener("click", () => {
    const folderName = prompt("Enter new folder name:", "New Folder");
    if (folderName) {
        if (!virtualFS[currentFolderPath]) virtualFS[currentFolderPath] = [];
        virtualFS[currentFolderPath].push({
            name: folderName,
            isFolder: true,
            icon: "📁",
            meta: "Folder"
        });
        virtualFS[folderName] = [];
        renderCurrentFolder();
    }
});

// Navigation Toolbar Listeners
filesBackBtn.addEventListener("click", () => {
    if (filesHistoryIndex > 0) {
        filesHistoryIndex--;
        currentFolderPath = filesHistory[filesHistoryIndex];
        selectedFileNames.clear();
        renderCurrentFolder();
    }
});

filesForwardBtn.addEventListener("click", () => {
    if (filesHistoryIndex < filesHistory.length - 1) {
        filesHistoryIndex++;
        currentFolderPath = filesHistory[filesHistoryIndex];
        selectedFileNames.clear();
        renderCurrentFolder();
    }
});

filesUpBtn.addEventListener("click", () => {
    if (currentFolderPath !== "Cyber Storage (C:)") {
        navigateToFolder("Cyber Storage (C:)");
    }
});

filesRefreshBtn.addEventListener("click", () => {
    renderCurrentFolder(filesSearchInput.value);
});

function updateFilesNavButtons() {
    filesBackBtn.disabled = filesHistoryIndex <= 0;
    filesForwardBtn.disabled = filesHistoryIndex >= filesHistory.length - 1;
    filesUpBtn.disabled = currentFolderPath === "Cyber Storage (C:)";
}

function updateFilesStatusBar(totalItems) {
    filesItemCount.textContent = `${totalItems} Items`;
    filesSelectionCount.textContent = `${selectedFileNames.size} selected`;
}

// -------------------------------------------------------------
// Settings Application & Wallpaper Management Module
// -------------------------------------------------------------

const settingsWindow = document.getElementById("settingsWindow");
const settingsHeader = document.getElementById("settingsHeader");
const closeSettingsBtn = document.getElementById("closeSettingsBtn");
const minSettingsBtn = document.getElementById("minSettingsBtn");
const maxSettingsBtn = document.getElementById("maxSettingsBtn");
const settingsAppBtns = document.querySelectorAll(".settings-app-btn");

const settingsNavItems = document.querySelectorAll(".settings-nav-item");
const settingsTabPanels = document.querySelectorAll(".settings-tab-panel");

// Preview Elements
const miniDesktopScreen = document.getElementById("miniDesktopScreen");
const miniScreenLabel = document.getElementById("miniScreenLabel");
const activeDesktopName = document.getElementById("activeDesktopName");
const activeLockName = document.getElementById("activeLockName");
const previewLockscreenBtn = document.getElementById("previewLockscreenBtn");

// Controls & Custom Options
const wallpaperGrid = document.getElementById("wallpaperGrid");
const wallpaperFitSelect = document.getElementById("wallpaperFitSelect");
const customWallpaperFile = document.getElementById("customWallpaperFile");
const browseFileBtn = document.getElementById("browseFileBtn");
const customWallpaperUrl = document.getElementById("customWallpaperUrl");
const applyCustomUrlBtn = document.getElementById("applyCustomUrlBtn");

const brightnessRange = document.getElementById("brightnessRange");
const brightnessVal = document.getElementById("brightnessVal");
const contrastRange = document.getElementById("contrastRange");
const contrastVal = document.getElementById("contrastVal");
const glassBlurToggle = document.getElementById("glassBlurToggle");

const soundEffectsToggle = document.getElementById("soundEffectsToggle");
const volumeRange = document.getElementById("volumeRange");
const volumeVal = document.getElementById("volumeVal");
const testSoundBtn = document.getElementById("testSoundBtn");

const resetSettingsBtn = document.getElementById("resetSettingsBtn");
const settingsToast = document.getElementById("settingsToast");
const toastMsg = document.getElementById("toastMsg");

// Default Wallpapers Metadata
const wallpaperCatalog = [
    { url: "./images/spider-man-logo-10k-3840x2160-15274.png", name: "Spider-Man Logo 10K" },
    { url: "./images/spider-man-across-3840x2160-11476.png", name: "Across Spider-Verse" },
    { url: "./images/wallpaper1.jfif", name: "Cyber Web Matrix" },
    { url: "./images/wallpaper2.jfif", name: "Neon Red Cyber Grid" },
    { url: "./images/wallpaper3.jfif", name: "Arachne Webweave" }
];

// OS Wallpaper State with LocalStorage Persistence
let currentDesktopWallpaper = localStorage.getItem("arachne_desktop_wallpaper") || "./images/spider-man-logo-10k-3840x2160-15274.png";
let currentDesktopName = localStorage.getItem("arachne_desktop_name") || "Spider-Man Logo 10K";

let currentLockWallpaper = localStorage.getItem("arachne_lock_wallpaper") || "./images/spider-man-across-3840x2160-11476.png";
let currentLockName = localStorage.getItem("arachne_lock_name") || "Across Spider-Verse";

let currentWallpaperFit = localStorage.getItem("arachne_wallpaper_fit") || "cover";

// Open Settings Application
settingsAppBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        settingsWindow.classList.remove("hide");
        appBox.classList.add("hide"); // Auto-close start menu
        bringToFront(settingsWindow);
    });
});

settingsWindow.addEventListener("mousedown", () => {
    bringToFront(settingsWindow);
});

makeDraggable(settingsWindow, settingsHeader);

// Window Controls
closeSettingsBtn.addEventListener("click", () => {
    settingsWindow.classList.add("hide");
});

minSettingsBtn.addEventListener("click", () => {
    settingsWindow.classList.add("hide");
});

let isSettingsMaximized = false;
maxSettingsBtn.addEventListener("click", () => {
    isSettingsMaximized = !isSettingsMaximized;
    if (isSettingsMaximized) {
        settingsWindow.classList.add("maximized");
        maxSettingsBtn.textContent = "❐";
    } else {
        settingsWindow.classList.remove("maximized");
        maxSettingsBtn.textContent = "□";
    }
});

// Sidebar Navigation Tabs
settingsNavItems.forEach(item => {
    item.addEventListener("click", () => {
        const targetTab = item.getAttribute("data-tab");

        settingsNavItems.forEach(nav => nav.classList.remove("active"));
        settingsTabPanels.forEach(panel => panel.classList.add("hide"));

        item.classList.add("active");
        const activePanel = document.getElementById(`tab-${targetTab}`);
        if (activePanel) activePanel.classList.remove("hide");
    });
});

// Toast Notification Engine
let toastTimeout = null;
function showToast(message, icon = "✨") {
    if (!settingsToast) return;
    toastMsg.textContent = message;
    settingsToast.querySelector(".toast-icon").textContent = icon;

    settingsToast.classList.remove("hide");

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        settingsToast.classList.add("hide");
    }, 3200);
}

// Play Cyber Beep Sound
function playCyberBeep() {
    if (soundEffectsToggle && !soundEffectsToggle.checked) return;
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const vol = (parseInt(volumeRange.value, 10) || 80) / 100 * 0.15;

        osc.type = "sine";
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(vol, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);

        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
        console.warn("Audio Context error:", e);
    }
}

if (testSoundBtn) {
    testSoundBtn.addEventListener("click", () => {
        playCyberBeep();
        showToast("🔊 Testing Arachne OS Audio Beep", "🔊");
    });
}

// Initialize Wallpaper & UI State
function applyDesktopWallpaper(url, name = "Custom Wallpaper") {
    currentDesktopWallpaper = url;
    currentDesktopName = name;

    localStorage.setItem("arachne_desktop_wallpaper", url);
    localStorage.setItem("arachne_desktop_name", name);

    if (mainScreen) {
        mainScreen.style.backgroundImage = `url("${url}")`;
        mainScreen.style.backgroundSize = currentWallpaperFit;
    }

    if (miniDesktopScreen) {
        miniDesktopScreen.style.backgroundImage = `url("${url}")`;
        miniDesktopScreen.style.backgroundSize = currentWallpaperFit;
    }

    if (miniScreenLabel) miniScreenLabel.textContent = name;
    if (activeDesktopName) activeDesktopName.textContent = name;

    updateWallpaperGalleryBadges();
    showToast(`Desktop Wallpaper updated to "${name}"!`, "🎨");
    playCyberBeep();
}

function applyLockWallpaper(url, name = "Custom Lock Screen") {
    currentLockWallpaper = url;
    currentLockName = name;

    localStorage.setItem("arachne_lock_wallpaper", url);
    localStorage.setItem("arachne_lock_name", name);

    if (lockScreen) {
        lockScreen.style.backgroundImage = `url("${url}")`;
    }

    if (activeLockName) activeLockName.textContent = name;

    updateWallpaperGalleryBadges();
    showToast(`Lock Screen Wallpaper updated to "${name}"!`, "🔒");
    playCyberBeep();
}

function updateWallpaperGalleryBadges() {
    const cards = document.querySelectorAll(".wallpaper-card");
    cards.forEach(card => {
        const cardUrl = card.getAttribute("data-url");

        // Remove existing badges inside thumb
        const wrapper = card.querySelector(".wallpaper-thumb-wrapper");
        if (wrapper) {
            const oldBadges = wrapper.querySelectorAll(".wallpaper-badge");
            oldBadges.forEach(b => b.remove());

            if (cardUrl === currentDesktopWallpaper) {
                const badge = document.createElement("span");
                badge.className = "wallpaper-badge desktop-badge";
                badge.textContent = "DESKTOP";
                wrapper.appendChild(badge);
                card.classList.add("active-desktop");
            } else {
                card.classList.remove("active-desktop");
            }

            if (cardUrl === currentLockWallpaper) {
                const badge = document.createElement("span");
                badge.className = "wallpaper-badge lock-badge";
                badge.textContent = "LOCK SCREEN";
                wrapper.appendChild(badge);
                card.classList.add("active-lock");
            } else {
                card.classList.remove("active-lock");
            }
        }
    });
}

function initOSWallpapers() {
    if (mainScreen) {
        mainScreen.style.backgroundImage = `url("${currentDesktopWallpaper}")`;
        mainScreen.style.backgroundSize = currentWallpaperFit;
    }
    if (lockScreen) {
        lockScreen.style.backgroundImage = `url("${currentLockWallpaper}")`;
    }
    if (miniDesktopScreen) {
        miniDesktopScreen.style.backgroundImage = `url("${currentDesktopWallpaper}")`;
        miniDesktopScreen.style.backgroundSize = currentWallpaperFit;
    }
    if (miniScreenLabel) miniScreenLabel.textContent = currentDesktopName;
    if (activeDesktopName) activeDesktopName.textContent = currentDesktopName;
    if (activeLockName) activeLockName.textContent = currentLockName;
    if (wallpaperFitSelect) wallpaperFitSelect.value = currentWallpaperFit;

    updateWallpaperGalleryBadges();
}

// Bind Gallery Buttons
if (wallpaperGrid) {
    wallpaperGrid.addEventListener("click", (e) => {
        const desktopBtn = e.target.closest(".apply-desktop-btn");
        const lockBtn = e.target.closest(".apply-lock-btn");
        const card = e.target.closest(".wallpaper-card");

        if (desktopBtn) {
            e.stopPropagation();
            const url = desktopBtn.getAttribute("data-url");
            const name = desktopBtn.getAttribute("data-name");
            applyDesktopWallpaper(url, name);
        } else if (lockBtn) {
            e.stopPropagation();
            const url = lockBtn.getAttribute("data-url");
            const name = lockBtn.getAttribute("data-name");
            applyLockWallpaper(url, name);
        } else if (card) {
            const url = card.getAttribute("data-url");
            const name = card.getAttribute("data-name");
            applyDesktopWallpaper(url, name);
        }
    });
}

// Wallpaper Fit Mode Selector
if (wallpaperFitSelect) {
    wallpaperFitSelect.addEventListener("change", (e) => {
        currentWallpaperFit = e.target.value;
        localStorage.setItem("arachne_wallpaper_fit", currentWallpaperFit);
        if (mainScreen) mainScreen.style.backgroundSize = currentWallpaperFit;
        if (miniDesktopScreen) miniDesktopScreen.style.backgroundSize = currentWallpaperFit;
        showToast(`Wallpaper scaling set to "${currentWallpaperFit}"`, "🖼️");
    });
}

// Preview Lock Screen Button
if (previewLockscreenBtn) {
    previewLockscreenBtn.addEventListener("click", () => {
        mainScreen.classList.add("hide");
        lockScreen.classList.remove("hide");
        showToast("Lock Screen preview active. Click Unlock to return.", "👁️");
    });
}

// Browse Custom File Upload
if (browseFileBtn && customWallpaperFile) {
    browseFileBtn.addEventListener("click", () => {
        customWallpaperFile.click();
    });

    customWallpaperFile.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const dataUrl = event.target.result;
                applyDesktopWallpaper(dataUrl, file.name);
            };
            reader.readAsDataURL(file);
        }
    });
}

// Apply Custom URL
if (applyCustomUrlBtn && customWallpaperUrl) {
    applyCustomUrlBtn.addEventListener("click", () => {
        const url = customWallpaperUrl.value.trim();
        if (url) {
            applyDesktopWallpaper(url, "Web URL Wallpaper");
            customWallpaperUrl.value = "";
        } else {
            showToast("Please enter a valid image URL!", "⚠️");
        }
    });
}

// Display Brightness & Contrast Controls
function updateDisplayFilters() {
    const bright = brightnessRange ? brightnessRange.value : 100;
    const contrast = contrastRange ? contrastRange.value : 100;

    if (brightnessVal) brightnessVal.textContent = `${bright}%`;
    if (contrastVal) contrastVal.textContent = `${contrast}%`;

    if (mainScreen) {
        mainScreen.style.filter = `brightness(${bright}%) contrast(${contrast}%)`;
    }
    if (miniDesktopScreen) {
        miniDesktopScreen.style.filter = `brightness(${bright}%) contrast(${contrast}%)`;
    }
}

if (brightnessRange) brightnessRange.addEventListener("input", updateDisplayFilters);
if (contrastRange) contrastRange.addEventListener("input", updateDisplayFilters);

// Volume Range Display
if (volumeRange && volumeVal) {
    volumeRange.addEventListener("input", () => {
        volumeVal.textContent = `${volumeRange.value}%`;
    });
}

// Glass Blur Toggle
if (glassBlurToggle) {
    glassBlurToggle.addEventListener("change", (e) => {
        const windows = document.querySelectorAll(".window");
        windows.forEach(w => {
            if (e.target.checked) {
                w.style.backdropFilter = "blur(20px)";
            } else {
                w.style.backdropFilter = "none";
            }
        });
        showToast(e.target.checked ? "Glassmorphism blur enabled" : "Glassmorphism blur disabled", "✨");
    });
}

// Reset Settings Button
if (resetSettingsBtn) {
    resetSettingsBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to reset all settings and wallpapers to default?")) {
            localStorage.removeItem("arachne_desktop_wallpaper");
            localStorage.removeItem("arachne_desktop_name");
            localStorage.removeItem("arachne_lock_wallpaper");
            localStorage.removeItem("arachne_lock_name");
            localStorage.removeItem("arachne_wallpaper_fit");

            currentDesktopWallpaper = "./images/spider-man-logo-10k-3840x2160-15274.png";
            currentDesktopName = "Spider-Man Logo 10K";
            currentLockWallpaper = "./images/spider-man-across-3840x2160-11476.png";
            currentLockName = "Across Spider-Verse";
            currentWallpaperFit = "cover";

            if (brightnessRange) brightnessRange.value = 100;
            if (contrastRange) contrastRange.value = 100;
            if (volumeRange) volumeRange.value = 80;
            updateDisplayFilters();

            initOSWallpapers();
            showToast("Settings reset to factory defaults!", "🔄");
        }
    });
}

// Execute OS Wallpaper Initialization
initOSWallpapers();

// -------------------------------------------------------------
// Real-Time Clock, Full Screen Toggle & Live Weather Module
// -------------------------------------------------------------

// DOM Clock Elements
const lockTimeEl = document.getElementById("lockTime");
const lockDateEl = document.getElementById("lockDate");

const desktopTimeEl = document.getElementById("desktopTime");
const desktopDateEl = document.getElementById("desktopDate");

const homeClockTimeEl = document.getElementById("homeClockTime");
const homeClockDateEl = document.getElementById("homeClockDate");

// Fullscreen Toggle Elements
const initialFullscreenOverlay = document.getElementById("initialFullscreenOverlay");
const startFullscreenBtn = document.getElementById("startFullscreenBtn");
const continueWindowBtn = document.getElementById("continueWindowBtn");
const lockScreenFullscreenBtn = document.getElementById("lockScreenFullscreenBtn");
const desktopFullscreenBtn = document.getElementById("desktopFullscreenBtn");
const standaloneFullscreenBtn = document.getElementById("fullscreenBtn");

// Weather & Location Elements
const weatherIcon = document.getElementById("weatherIcon");
const weatherTemp = document.getElementById("weatherTemp");
const weatherCity = document.getElementById("weatherCity");
const weatherCond = document.getElementById("weatherCond");

const homeWeatherIcon = document.getElementById("homeWeatherIcon");
const homeWeatherTemp = document.getElementById("homeWeatherTemp");
const homeWeatherDesc = document.getElementById("homeWeatherDesc");
const homeWeatherDetails = document.getElementById("homeWeatherDetails");
const refreshWeatherBtn = document.getElementById("refreshWeatherBtn");
const headerWeatherWidget = document.getElementById("headerWeatherWidget");
const homeWeatherCard = document.getElementById("homeWeatherCard");

// Location & TimeZone State with LocalStorage
let currentOSUserTimeZone = localStorage.getItem("arachne_user_timezone") || "auto";
let currentOSUserLocationName = localStorage.getItem("arachne_user_location_name") || "Auto (Local Browser)";
let currentOSUserLat = localStorage.getItem("arachne_user_lat") ? parseFloat(localStorage.getItem("arachne_user_lat")) : null;
let currentOSUserLon = localStorage.getItem("arachne_user_lon") ? parseFloat(localStorage.getItem("arachne_user_lon")) : null;

const detectLocationBtn = document.getElementById("detectLocationBtn");
const timezonePresetSelect = document.getElementById("timezonePresetSelect");
const locationStatusTitle = document.getElementById("locationStatusTitle");
const locationStatusSub = document.getElementById("locationStatusSub");

const cityPresetCoordinates = {
    "auto": { lat: 28.6139, lon: 77.2090, name: "Auto (Local Browser)" },
    "Asia/Kolkata": { lat: 28.6139, lon: 77.2090, name: "New Delhi, India" },
    "America/New_York": { lat: 40.7128, lon: -74.0060, name: "New York, USA" },
    "America/Los_Angeles": { lat: 34.0522, lon: -118.2437, name: "Los Angeles, USA" },
    "Europe/London": { lat: 51.5074, lon: -0.1278, name: "London, UK" },
    "Europe/Paris": { lat: 48.8566, lon: 2.3522, name: "Paris, France" },
    "Asia/Tokyo": { lat: 35.6762, lon: 139.6503, name: "Tokyo, Japan" },
    "Asia/Dubai": { lat: 25.2048, lon: 55.2708, name: "Dubai, UAE" },
    "Australia/Sydney": { lat: -33.8688, lon: 151.2093, name: "Sydney, Australia" }
};

function updateLocationStatusUI() {
    if (locationStatusTitle) {
        locationStatusTitle.textContent = `Current Active Location: ${currentOSUserLocationName}`;
    }
    if (locationStatusSub) {
        const tzText = currentOSUserTimeZone === "auto" ? "Auto-Detected (Local)" : currentOSUserTimeZone;
        locationStatusSub.textContent = `Time Zone: ${tzText} • Lat/Lon: ${currentOSUserLat ? `${currentOSUserLat.toFixed(2)}°, ${currentOSUserLon.toFixed(2)}°` : 'Default'}`;
    }
    if (timezonePresetSelect) {
        timezonePresetSelect.value = currentOSUserTimeZone;
    }
}

// Real-Time Clock Update Function
function updateRealTimeClock() {
    const now = new Date();
    
    let timeOptions = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    };
    if (currentOSUserTimeZone && currentOSUserTimeZone !== "auto") {
        timeOptions.timeZone = currentOSUserTimeZone;
    }

    let fullTimeString = "";
    try {
        fullTimeString = now.toLocaleTimeString('en-US', timeOptions);
    } catch (e) {
        fullTimeString = now.toLocaleTimeString('en-US');
    }

    let dateOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    if (currentOSUserTimeZone && currentOSUserTimeZone !== "auto") {
        dateOptions.timeZone = currentOSUserTimeZone;
    }

    let fullDateString = "";
    try {
        fullDateString = now.toLocaleDateString('en-US', dateOptions);
    } catch (e) {
        fullDateString = now.toLocaleDateString('en-US');
    }

    let shortDateOptions = {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };
    if (currentOSUserTimeZone && currentOSUserTimeZone !== "auto") {
        shortDateOptions.timeZone = currentOSUserTimeZone;
    }

    let shortDateString = "";
    try {
        shortDateString = now.toLocaleDateString('en-US', shortDateOptions);
    } catch (e) {
        shortDateString = now.toLocaleDateString('en-US');
    }
    
    // Update Lock Screen Clock
    if (lockTimeEl) lockTimeEl.textContent = fullTimeString;
    if (lockDateEl) lockDateEl.textContent = `${fullDateString} (${currentOSUserLocationName})`;
    
    // Update Desktop Header Clock
    if (desktopTimeEl) desktopTimeEl.textContent = fullTimeString;
    if (desktopDateEl) desktopDateEl.textContent = shortDateString;
    
    // Update Home Screen Widget Clock
    if (homeClockTimeEl) homeClockTimeEl.textContent = fullTimeString;
    if (homeClockDateEl) homeClockDateEl.textContent = `${fullDateString} • 📍 ${currentOSUserLocationName}`;
}

// Start Real-Time Clock Interval (Updates every 1000ms)
setInterval(updateRealTimeClock, 1000);
updateRealTimeClock();

// Geolocation & Timezone Selection Event Listeners
if (detectLocationBtn) {
    detectLocationBtn.addEventListener("click", () => {
        if (!navigator.geolocation) {
            showToast("Geolocation is not supported by your browser", "⚠️");
            return;
        }

        showToast("Requesting device location access...", "📍");
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;
                currentOSUserLat = lat;
                currentOSUserLon = lon;
                
                try {
                    const geoRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
                    if (geoRes.ok) {
                        const geoData = await geoRes.json();
                        const tz = geoData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "auto";
                        currentOSUserTimeZone = tz;
                        currentOSUserLocationName = `GPS Location (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`;
                    }
                } catch (err) {
                    currentOSUserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "auto";
                    currentOSUserLocationName = `GPS Location`;
                }

                localStorage.setItem("arachne_user_timezone", currentOSUserTimeZone);
                localStorage.setItem("arachne_user_location_name", currentOSUserLocationName);
                localStorage.setItem("arachne_user_lat", lat);
                localStorage.setItem("arachne_user_lon", lon);

                updateLocationStatusUI();
                updateRealTimeClock();
                fetchLiveWeather();
                showToast(`Location set to ${currentOSUserLocationName}!`, "📍");
            },
            (err) => {
                console.warn("Geolocation error:", err);
                showToast("Geolocation permission denied or unavailable", "⚠️");
            }
        );
    });
}

if (timezonePresetSelect) {
    timezonePresetSelect.value = currentOSUserTimeZone;
    timezonePresetSelect.addEventListener("change", (e) => {
        const val = e.target.value;
        currentOSUserTimeZone = val;
        
        if (cityPresetCoordinates[val]) {
            const preset = cityPresetCoordinates[val];
            currentOSUserLocationName = preset.name;
            currentOSUserLat = preset.lat;
            currentOSUserLon = preset.lon;
        } else {
            currentOSUserLocationName = val;
        }

        localStorage.setItem("arachne_user_timezone", currentOSUserTimeZone);
        localStorage.setItem("arachne_user_location_name", currentOSUserLocationName);
        if (currentOSUserLat) localStorage.setItem("arachne_user_lat", currentOSUserLat);
        if (currentOSUserLon) localStorage.setItem("arachne_user_lon", currentOSUserLon);

        updateLocationStatusUI();
        updateRealTimeClock();
        fetchLiveWeather();
        showToast(`Timezone updated to ${currentOSUserLocationName}`, "🌍");
    });
}

updateLocationStatusUI();

// Fullscreen Control Logic & Cross-Browser Engine
function enterOSFullScreen() {
    // Hide initial overlay first
    if (initialFullscreenOverlay) {
        initialFullscreenOverlay.classList.add("hide-overlay");
    }

    const docEl = document.documentElement;

    try {
        if (docEl.requestFullscreen) {
            const p = docEl.requestFullscreen();
            if (p && p.catch) {
                p.catch(err => {
                    console.warn("Native fullscreen blocked:", err);
                    document.body.classList.add("os-pseudo-fullscreen");
                    if (typeof showToast === "function") showToast("Press F11 for Full Screen Mode", "📺");
                });
            }
        } else if (docEl.webkitRequestFullscreen) {
            docEl.webkitRequestFullscreen();
        } else if (docEl.mozRequestFullScreen) {
            docEl.mozRequestFullScreen();
        } else if (docEl.msRequestFullscreen) {
            docEl.msRequestFullscreen();
        } else {
            document.body.classList.add("os-pseudo-fullscreen");
        }
    } catch (err) {
        console.warn("Fullscreen exception:", err);
        document.body.classList.add("os-pseudo-fullscreen");
    }
}

function exitOSFullScreen() {
    document.body.classList.remove("os-pseudo-fullscreen");
    try {
        if (document.exitFullscreen) {
            document.exitFullscreen().catch(err => console.warn(err));
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    } catch (err) {
        console.warn("Exit Fullscreen error:", err);
    }
}

function isOSFullScreen() {
    return document.body.classList.contains("os-pseudo-fullscreen") || !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
}

function toggleOSFullScreen() {
    if (!isOSFullScreen()) {
        enterOSFullScreen();
    } else {
        exitOSFullScreen();
    }
}

function updateFullscreenButtonsUI() {
    const isFS = isOSFullScreen();
    const btnText = isFS ? "📺 Exit Full Screen" : "📺 Switch to Full Screen";
    const headerBtnText = isFS ? "📺 Exit FS" : "📺 Fullscreen";
    
    if (lockScreenFullscreenBtn) lockScreenFullscreenBtn.textContent = btnText;
    if (desktopFullscreenBtn) desktopFullscreenBtn.textContent = headerBtnText;
    if (startFullscreenBtn) startFullscreenBtn.textContent = isFS ? "📺 Exit Full Screen" : "📺 Switch to Full Screen";
    if (standaloneFullscreenBtn) standaloneFullscreenBtn.textContent = isFS ? "⛶ Exit Full Screen" : "⛶ Full Screen";
}

// Event Listeners for Fullscreen Buttons
if (startFullscreenBtn) {
    startFullscreenBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        enterOSFullScreen();
        if (typeof showToast === "function") showToast("Welcome to Arachne-OS Cyber Edition!", "🕷️");
    });
}

if (continueWindowBtn) {
    continueWindowBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (initialFullscreenOverlay) {
            initialFullscreenOverlay.classList.add("hide-overlay");
        }
    });
}

if (initialFullscreenOverlay) {
    initialFullscreenOverlay.addEventListener("click", (e) => {
        if (e.target.id === "continueWindowBtn") return;
        enterOSFullScreen();
    });
}

if (lockScreenFullscreenBtn) {
    lockScreenFullscreenBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleOSFullScreen();
    });
}

if (desktopFullscreenBtn) {
    desktopFullscreenBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleOSFullScreen();
    });
}

if (standaloneFullscreenBtn) {
    standaloneFullscreenBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        toggleOSFullScreen();
    });
}

document.addEventListener("fullscreenchange", updateFullscreenButtonsUI);
document.addEventListener("webkitfullscreenchange", updateFullscreenButtonsUI);
document.addEventListener("mozfullscreenchange", updateFullscreenButtonsUI);
document.addEventListener("MSFullscreenChange", updateFullscreenButtonsUI);

// Live Weather Engine
const weatherPresets = [
    { city: "Cyber City", temp: "28°C", icon: "🌤️", desc: "Partly Cloudy", details: "📍 Cyber City • 💧 58% • 💨 12 km/h" },
    { city: "New York", temp: "24°C", icon: "☀️", desc: "Sunny & Clear", details: "📍 New York • 💧 45% • 💨 9 km/h" },
    { city: "Tokyo", temp: "26°C", icon: "🌧️", desc: "Cyber Neon Rain", details: "📍 Tokyo • 💧 82% • 💨 18 km/h" },
    { city: "London", temp: "19°C", icon: "🌫️", desc: "Mist & Fog", details: "📍 London • 💧 75% • 💨 10 km/h" },
    { city: "Spider Realm", temp: "31°C", icon: "⚡", desc: "Multiverse Storm", details: "📍 Spider-Verse • 💧 90% • 💨 35 km/h" }
];

let currentWeatherIndex = 0;

function updateWeatherUI(data) {
    if (weatherIcon) weatherIcon.textContent = data.icon;
    if (weatherTemp) weatherTemp.textContent = data.temp;
    if (weatherCity) weatherCity.textContent = data.city;
    if (weatherCond) weatherCond.textContent = `${data.desc} • 💧 58%`;
    
    if (homeWeatherIcon) homeWeatherIcon.textContent = data.icon;
    if (homeWeatherTemp) homeWeatherTemp.textContent = data.temp;
    if (homeWeatherDesc) homeWeatherDesc.textContent = data.desc;
    if (homeWeatherDetails) homeWeatherDetails.textContent = data.details;
}

async function fetchCityNameAndWeather(lat, lon) {
    let cityName = currentOSUserLocationName;

    // Reverse geocode lat/lon to real City and Country name
    try {
        const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
        if (geoRes.ok) {
            const geoData = await geoRes.json();
            const city = geoData.city || geoData.locality || geoData.principalSubdivision || geoData.countryName;
            const country = geoData.countryCode || "";
            if (city) {
                cityName = `${city}${country ? `, ${country}` : ''}`;
                currentOSUserLocationName = cityName;
                localStorage.setItem("arachne_user_location_name", cityName);
            }
        }
    } catch (err) {
        console.warn("Reverse geocode fetch warning:", err);
    }

    // Fetch Open-Meteo Weather for exact lat/lon
    try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&hourly=relativehumidity_2m`);
        if (res.ok) {
            const data = await res.json();
            const temp = Math.round(data.current_weather.temperature);
            const code = data.current_weather.weathercode;
            const wind = Math.round(data.current_weather.windspeed);
            const humidity = (data.hourly && data.hourly.relativehumidity_2m && data.hourly.relativehumidity_2m.length) ? data.hourly.relativehumidity_2m[0] : 60;
            
            let icon = "🌤️";
            let desc = "Partly Cloudy";
            if (code === 0) { icon = "☀️"; desc = "Clear Sky"; }
            else if (code >= 1 && code <= 3) { icon = "🌤️"; desc = "Partly Cloudy"; }
            else if (code >= 45 && code <= 48) { icon = "🌫️"; desc = "Foggy"; }
            else if (code >= 51 && code <= 67) { icon = "🌧️"; desc = "Rainy"; }
            else if (code >= 71 && code <= 77) { icon = "❄️"; desc = "Snowy"; }
            else if (code >= 95) { icon = "⛈️"; desc = "Thunderstorm"; }
            
            const liveData = {
                city: cityName,
                temp: `${temp}°C`,
                icon: icon,
                desc: desc,
                details: `📍 ${cityName} • 💧 ${humidity}% • 💨 ${wind} km/h`
            };

            updateWeatherUI(liveData);
            updateLocationStatusUI();
            updateRealTimeClock();
            return;
        }
    } catch (e) {
        console.warn("Live weather fetch error:", e);
    }

    updateWeatherUI(weatherPresets[currentWeatherIndex]);
}

async function fetchLiveWeather() {
    if (navigator.geolocation && !localStorage.getItem("arachne_user_lat")) {
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const lat = pos.coords.latitude;
                const lon = pos.coords.longitude;
                currentOSUserLat = lat;
                currentOSUserLon = lon;
                localStorage.setItem("arachne_user_lat", lat);
                localStorage.setItem("arachne_user_lon", lon);
                await fetchCityNameAndWeather(lat, lon);
            },
            (err) => {
                console.warn("Auto-geolocation popup closed or denied:", err);
                fetchCityNameAndWeather(currentOSUserLat || 28.6139, currentOSUserLon || 77.2090);
            },
            { timeout: 10000 }
        );
    } else {
        fetchCityNameAndWeather(currentOSUserLat || 28.6139, currentOSUserLon || 77.2090);
    }
}

if (refreshWeatherBtn) {
    refreshWeatherBtn.addEventListener("click", () => {
        currentWeatherIndex = (currentWeatherIndex + 1) % weatherPresets.length;
        const currentData = weatherPresets[currentWeatherIndex];
        updateWeatherUI(currentData);
        showToast(`Weather location updated to ${currentData.city}!`, "🌤️");
        playCyberBeep();
    });
}

if (headerWeatherWidget) {
    headerWeatherWidget.addEventListener("click", () => {
        currentWeatherIndex = (currentWeatherIndex + 1) % weatherPresets.length;
        const currentData = weatherPresets[currentWeatherIndex];
        updateWeatherUI(currentData);
        showToast(`Weather set to ${currentData.city} (${currentData.temp} ${currentData.desc})`, "🌡️");
    });
}

// Initial Weather Fetch
fetchLiveWeather();





