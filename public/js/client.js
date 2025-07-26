const socket = io(); // auto-connect to current origin

const form = document.getElementById("send-container");
const messageInput = document.getElementById("messageInp");
const messageContainer = document.querySelector(".container");

// Function to append message bubbles
const append = (message, position, sender = "") => {
  const messageElement = document.createElement("div");
  messageElement.classList.add("message", position);

  // Sender Name
  if (sender) {
    const senderElement = document.createElement("div");
    senderElement.classList.add("sender");
    senderElement.innerText = sender;
    messageElement.appendChild(senderElement);
  }

  // Message Text
  const textElement = document.createElement("div");
  textElement.classList.add("text");
  textElement.innerText = message;
  messageElement.appendChild(textElement);

  // Add message to container
  messageContainer.appendChild(messageElement);
  messageContainer.scrollTop = messageContainer.scrollHeight; // scroll to bottom
};

// Ask for username and notify server
const username = prompt("Let us know, who you are?");
socket.emit("new-user-joined", username);

// When user sends a message
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = messageInput.value.trim();
  if (message !== "") {
    append(message, "right", "You");
    socket.emit("send", message);
    messageInput.value = "";
  }
});

// When a new user joins
socket.on("user-joined", (name) => {
  append(`${name} joined the chat`, "left");
});

// When receiving a message
socket.on("receive", (data) => {
  append(data.message, "left", data.name);
});

console.log("📡 Client-side JS loaded");
