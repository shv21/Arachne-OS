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
        if (e.target.classList.contains("win-btn")) return; // Don't drag if clicking buttons
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
    if (calcWindow.classList.contains("hide")) return;

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
});
