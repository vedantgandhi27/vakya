document.addEventListener("DOMContentLoaded", () => {
  console.log("🔥 client.js is running!");

  const socket = io();

  const form = document.getElementById("send-container");
  const messageInput = document.getElementById("messageInp");
  const messageContainer = document.querySelector(".container");
  const clearChatBtn = document.getElementById("clearChatBtn");

  const currentUsername = prompt("Let us know, who you are?").toUpperCase();
  socket.emit("new-user-joined", currentUsername);


    // Map to store user colors and toggle for alternating colors

  let userColorMap = {};
  let userColorToggle = 0;


  function append(msg, sender) {
    const div = document.createElement("div");

    if (!userColorMap[sender]) {
      userColorMap[sender] =
        sender === "System"
          ? "default-user"
          : userColorToggle === 0
          ? "green-user"
          : "blue-user";
      userColorToggle = 1 - userColorToggle;
    }
    const colorClass = userColorMap[sender];
    const position = sender === currentUsername ? "left" : "right";

    div.classList.add("message", position, colorClass);

    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    div.innerHTML = `
      <div class="sender">${sender}</div>
      <div class="text">${msg}</div>
      <div class="timestamp">${time}</div>
    `;

    messageContainer.appendChild(div);
    messageContainer.scrollTop = messageContainer.scrollHeight;
  }

  // Initial messages


  append("Welcome to Vakya", "System");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const msg = messageInput.value.trim();
    if (!msg) return;
    append(msg, currentUsername);
    socket.emit("send", msg);
    messageInput.value = "";
  });

  socket.on("receive", (data) => {
    append(data.message, data.name);
  });

  socket.on("user-joined", (name) => {
    append(`${name} joined the chat`, "System");
  });

  socket.on("partner-found", (partnerName) => {
    append(`You are now chatting with: ${partnerName}`, "System");
  });

  socket.on("user-left", (name) => {
    append(`${name} has left the chat`, "System");
  });


    // Typing indicator functionality
const typingIndicator = document.getElementById("typingIndicator");

let typingTimeout;
let isTyping = false;

messageInput.addEventListener("input", () => {
  if (!isTyping) {
    isTyping = true;
    socket.emit("typing");
  }

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    isTyping = false;
    socket.emit("stop typing");
  }, 1500);
});

socket.on("typing", (username) => {
  typingIndicator.textContent = `${username} is typing...`;
});

socket.on("stop typing", () => {
  typingIndicator.textContent = "";
});

    // Clear chat functionality

  clearChatBtn.addEventListener("click", () => {
    const secretKey = prompt("Enter the secret key to clear chat:");

    if (!secretKey) {
      alert("Clear chat cancelled.");
      return;
    }

    // Emit clear-chat event with secret key
    socket.emit("clear-chat", { secretKey });
  });

    // Listen for clear-chat broadcast from server
  socket.on("clear-chat", () => {
    messageContainer.innerHTML = "";
    if (typingIndicator) typingIndicator.textContent = "";
  });

  // Listen for error messages from server
  socket.on("error-message", (msg) => {
    alert(msg);
  });


});
