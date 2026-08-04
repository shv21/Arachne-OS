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
calcAppBtn.addEventListener("click", () => {
    calcWindow.classList.remove("hide");
    appBox.classList.add("hide"); // Auto-close start menu when app launches
    bringToFront(calcWindow);
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
    btn.addEventListener("click", () => {
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

window.handleNtpSearch = function(tabId, query) {
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

