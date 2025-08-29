document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const msg = document.getElementById("msg");

  if (!loginForm) return;

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = e.target.username.value.trim();
    const password = e.target.password.value.trim();

    if (!username || !password) {
      msg.textContent = "Please enter both username and password.";
      return;
    }

    msg.textContent = "Logging in...";

    try {
      const response = await fetch(
        `${window.API_BASE_URL || "http://localhost:5000"}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        msg.textContent =
          data.message || data.error || "Login failed. Please try again.";
        return;
      }

      // Save token to localStorage for future requests - corrected key here
      localStorage.setItem("jwt_token", data.token);

      msg.textContent = "Login successful! Redirecting...";

      // Redirect to admin index or desired page
      window.location.href = "./index.html";
    } catch (error) {
      msg.textContent = "Network error. Please try again later.";
      console.error("Login error:", error);
    }
  });
});
