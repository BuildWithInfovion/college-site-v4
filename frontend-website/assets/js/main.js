document.addEventListener("DOMContentLoaded", () => {
  const noticesList = document.getElementById("notices-list");
  const eventsContainer = document.getElementById("events-container");

  // Centralized backend URL for easy config
  const backendURL =
    window.API_BASE_URL || "https://college-site-v4.onrender.com";

  // Utility to escape HTML safely (optional for raw text)
  const escapeHtml = (text) =>
    text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Fetch and render notices using async/await
  async function loadNotices() {
    noticesList.innerHTML =
      '<li class="text-center text-gray-400">Loading notices...</li>';
    try {
      const res = await fetch(`${backendURL}/api/notices`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      if (data.status === "success" && Array.isArray(data.data)) {
        if (data.data.length === 0) {
          noticesList.innerHTML =
            '<li class="text-center text-gray-400">No notices available.</li>';
          return;
        }
        noticesList.innerHTML = "";
        data.data.forEach((notice) => {
          const li = document.createElement("li");
          li.className =
            "fade-in-on-scroll border-b border-gray-700 pb-2 hover:bg-gray-700 transition rounded-md px-2";
          li.innerHTML = `<span class="font-semibold text-green-400">${escapeHtml(
            notice.title
          )}:</span> ${escapeHtml(notice.content || notice.description || "")}`;
          noticesList.appendChild(li);
        });
      } else {
        noticesList.innerHTML =
          '<li class="text-center text-gray-400">No notices available.</li>';
      }
    } catch (error) {
      noticesList.innerHTML =
        '<li class="text-center text-red-500">Failed to load notices.</li>';
      console.error("Notices load error:", error);
    }
  }

  // Fetch and render event images using async/await
  async function loadEvents() {
    eventsContainer.innerHTML =
      '<p class="text-center text-gray-400">Loading events...</p>';
    try {
      const res = await fetch(`${backendURL}/api/events`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      if (data.status === "success" && Array.isArray(data.data)) {
        if (data.data.length === 0) {
          eventsContainer.innerHTML =
            '<p class="text-center text-gray-400">No events available.</p>';
          return;
        }
        eventsContainer.innerHTML = "";
        data.data.forEach((event) => {
          const img = document.createElement("img");
          img.src = event.imageUrl || "default-event.jpg";
          img.alt = event.title ? escapeHtml(event.title) : "Event Image";
          img.className =
            "fade-in-on-scroll rounded-lg shadow-lg hover:scale-105 transition";
          eventsContainer.appendChild(img);
        });
      } else {
        eventsContainer.innerHTML =
          '<p class="text-center text-gray-400">No events available.</p>';
      }
    } catch (error) {
      eventsContainer.innerHTML =
        '<p class="text-center text-red-500">Failed to load events.</p>';
      console.error("Events load error:", error);
    }
  }

  // Load both notices and events on page load
  loadNotices();
  loadEvents();
});
