const lockScreen = document.querySelector(".descktop-lockScreen");
const mainScreen = document.querySelector(".descktop-main-screen");
const btn = document.querySelector(".login-btn");
const startBtn = document.querySelector(".start");
const appBOx = document.querySelector(".appBox");

btn.addEventListener("click", () => {
    mainScreen.classList.remove("hide");
    lockScreen.classList.add("hide");
    console.log("clicked");
});

startBtn.addEventListener("click", () => {
    appBOx.classList.toggle("hide");
});

