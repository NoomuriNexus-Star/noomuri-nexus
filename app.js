// Register service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}

// Grab elements
const loginButton = document.getElementById("loginButton");
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("passwordInput");
const loginScreen = document.getElementById("loginScreen");
const errorMessage = document.getElementById("errorMessage");

// Create spinner
const spinner = document.createElement("div");
spinner.classList.add("spinner");
spinner.style.display = "none";
document.body.appendChild(spinner);

// Handle login
loginButton.addEventListener("click", () => {
  const enteredPassword = passwordInput.value;
  if (enteredPassword === "$N00MURI_DA_G0AT") {
    errorMessage.textContent = "";
    loginScreen.classList.add("fade-out");

    // Show spinner after fade
    setTimeout(() => {
      spinner.style.display = "block";
      spinner.classList.add("spin", "fade-in");
    }, 800);

    // Fade out spinner before redirect
    setTimeout(() => {
      spinner.classList.remove("fade-in");
      spinner.classList.add("fade-out-spinner");
    }, 1600);

    // Redirect after spinner fade-out
    setTimeout(() => {
      window.location.href =
        "https://accounts.google.com/Logout?continue=https://www.google.com";
    }, 2200);
  } else {
    passwordInput.classList.add("shake");
    errorMessage.textContent = "Incorrect password. Try again.";
    setTimeout(() => {
      passwordInput.classList.remove("shake");
    }, 400);
  }
});

// Toggle show/hide password
togglePassword.addEventListener("click", () => {
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    togglePassword.textContent = "🙈";
  } else {
    passwordInput.type = "password";
    togglePassword.textContent = "👁️";
  }
});

// Enter key submits
passwordInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    loginButton.click();
  }
});
