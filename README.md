[![Hack Club](https://img.shields.io/badge/Stardance-WebOS%201-blue)](https://hackclub.com/)
[![Status](https://img.shields.io/badge/Status-Completed%20%26%20Active-success)](https://github.com/shv21/Arachne-OS)
[![Deployed](https://img.shields.io/badge/Deployed-Vercel-000000?logo=vercel&logoColor=white)](https://arachne-os.vercel.app/)
[![Made with](https://img.shields.io/badge/Made%20with-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-orange)](https://github.com/shv21/Arachne-OS)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

# 🕷️ Arachne OS - Cyber Spider Edition

> *A high-performance, glassmorphic desktop operating system running entirely inside your web browser.*

Arachne OS is a full-featured, browser-based WebOS built from scratch using pure Vanilla HTML5, CSS3, and JavaScript. Designed for the **Hack Club Stardance Challenge**, it seamlessly combines glassmorphism aesthetic, interactive multi-window management, built-in productivity applications, real-time weather & clock synchronization, and session controls into a smooth single-page application.

---

## 🌟 Key Features & UI Overview

### 🔒 1. Minimalist Lock Screen
- **Real-Time Clock Engine**: 72px high-contrast digital clock updating live every 1 second in 12-hour format (AM/PM) along with localized date formatting.
- **Ultra-Clean Action Controls**:
  - **`🔓 Unlock OS`**: Smooth slide-up transition animation revealing the main desktop screen.
  - **`📺 Switch to Fullscreen`**: Native browser fullscreen toggle with pseudo-fullscreen fallback.
- **Keyboard Shortcuts**: Press `Enter` on your keyboard to unlock instantly.

---

### 🖥️ 2. Desktop Environment & Dock
- **Glassmorphic Floating Dock**: Fixed bottom launcher dock with hover scale animations for quick access to all core system applications:
  - 🌐 **Chrome Browser**
  - 💙 **VS Code Studio**
  - 📁 **File Explorer**
  - 🧮 **Arachne Calculator**
  - ⚙️ **System Settings**
  - 🕸️ **Start Menu**
- **Window Management System**:
  - **Z-Index Layering**: Click anywhere on a window to bring it to front above all other windows (`bringToFront`).
  - **Smooth Draggable Windows**: Drag any window by its header (`makeDraggable`) while keeping it constrained inside viewport boundaries.
  - **Window State Controls**: Minimize, Maximize/Restore, and Close for every window.
- **Desktop Status Bar**: Top bar displaying system status, Wi-Fi, battery state, audio toggle, and live weather widget.

---

### 🌐 3. Chrome Web Browser App
- **Multi-Tab Engine**: Open, switch, and close multiple browser tabs seamlessly with `createNewTab()`.
- **Omnibox & Navigation**: Functional address bar supporting URL navigation, page reloads, back/forward history navigation.
- **Quick Bookmarks**: One-click bookmark chips for popular destinations (Google, YouTube, GitHub, Vercel, Hack Club).

---

### 💙 4. VS Code Studio App
- **Multi-File Code Editor**: Interactive code workspace pre-loaded with project files (`script.js`, `index.html`, `style.css`, `main.py`, `README.md`).
- **Editor Features**: Dynamic line numbers, active tab switching, file tree explorer, and language mode indicators.
- **Integrated Cyber Terminal**: Real-time JavaScript code execution engine utilizing an isolated scope that captures `console.log`, `console.warn`, `console.error`, and runtime errors into the terminal output.

---

### 📁 5. File Explorer App
- **Virtual File System (`virtualFS`)**: Browse directories including Desktop, Documents, Downloads, Pictures, Music, Videos, Projects, and Cyber Storage (C:).
- **Navigation Controls**: Address path bar breadcrumbs, back, forward, up, and refresh actions.
- **File Management**: Interactive grid view vs. list view toggle, real-time search filtering, selection counts, and new folder creation (`prompt`).

---

### 🧮 6. Scientific Calculator App
- **High-Precision Math Engine**: High-contrast glassmorphic calculator with history display and clear display precision.
- **Operations Supported**: Addition (`+`), Subtraction (`-`), Multiplication (`*`), Division (`/`), Percentage (`%`), Sign Toggle (`±`), and Clear (`C`).
- **Keyboard Support**: Full keyboard binding (Numbers `0-9`, `.`, `+`, `-`, `*`, `/`, `Enter`/`=`, `Backspace`, `Escape`).

---

### ⚙️ 7. System Settings & Customization
- **Wallpaper Gallery Switcher**: Choose from a catalog of Spider-Man and Cyberpunk wallpapers for both Desktop and Lock Screen with `localStorage` persistence.
- **Custom Wallpaper Upload**: Apply custom background images via local file picker or direct URL.
- **Display Adjustments**: Live CSS sliders for Brightness and Contrast, plus Glassmorphism blur toggle.
- **Location & Timezone**: Auto-detect location via HTML5 Geolocation API or select timezone presets (New Delhi, New York, London, Paris, Tokyo, Dubai, Sydney).

---

### 🌙 8. Power & Power Options
- **Sleep Mode**: Lowers display brightness to 5% with a click/key press wake trigger.
- **Restart System**: Simulates kernel reboot with a loading blur effect.
- **Shutdown**: Powered off screen with a single-click reboot button.
- **Switch User**: Guest administrator session mode toggle.

---

## 🛠️ Tech Stack

| Component | Technology |
| :--- | :--- |
| **Core Frontend** | Vanilla HTML5, CSS3, JavaScript (ES6+) |
| **Styling & Effects** | Glassmorphism, CSS Backdrop Filters, Flexbox/Grid, Animations |
| **State Persistence** | HTML5 `localStorage` API |
| **Weather API** | Open-Meteo Weather Forecast API |
| **Geolocation** | HTML5 Geolocation API |
| **Deployment** | Vercel |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Enter` | Unlock Lock Screen / Calculate result in Calculator |
| `Escape` | Close Power Modal / Clear Calculator |
| `Backspace` | Delete last digit in Calculator |
| `0 - 9`, `.`, `+`, `-`, `*`, `/` | Enter numbers & operators in Calculator |

---

## 💻 Local Installation & Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/shv21/Arachne-OS.git
   cd Arachne-OS
   ```

2. **Run Locally**:
   No build steps or `npm install` required! Simply open `index.html` in your web browser:
   - Double-click `index.html`
   - Or use VS Code **Live Server** extension.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.

---

<p align="center">
  <b>Made with 🕷️ by <a href="https://github.com/shv21">shv21</a> for Hack Club</b>
</p>