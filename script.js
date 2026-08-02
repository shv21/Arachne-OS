const lockScreen = document.querySelector(".descktop-lockScreen");
const mainScreen = document.querySelector(".descktop-main-screen");
const btn = document.querySelector(".login-btn");

btn.addEventListener("click", () => {
    mainScreen.classList.remove("hide");
    lockScreen.classList.add("hide");
    console.log("clicked");
});


