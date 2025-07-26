const express = require("express");
const path = require("path");
const { createServer } = require("http");
const { Server } = require("socket.io");
const exphbs = require("express-handlebars");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

//  Handlebars setup
app.engine("hbs", exphbs.engine({ extname: ".hbs" }));
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// Static files reference
app.use(express.static(path.join(__dirname, "public")));

// Homepage route
app.get("/", (req, res) => {
  res.render("home"); 
});

// Stores connected users
const users = {};

io.on("connection", (socket) => {
  console.log("📡 New connection:", socket.id);

  // Notifies new user when joined
  socket.on("new-user-joined", (username) => {
    users[socket.id] = username;
    socket.broadcast.emit("user-joined", username);

    // Notify partner
    const otherUsers = Object.entries(users).filter(([id]) => id !== socket.id);
    if (otherUsers.length > 0) {
      const [otherSocketId, otherName] = otherUsers[0];
      socket.emit("partner-found", otherName);
      io.to(otherSocketId).emit("partner-found", username);
    }
  });

  // Runs when user sends a message
  socket.on("send", (message) => {
    socket.broadcast.emit("receive", {
      message: message,
      name: users[socket.id],
    });
  });

  // Runs when user disconnects
  socket.on("disconnect", () => {
    if (users[socket.id]) {
      socket.broadcast.emit("user-left", users[socket.id]);
      console.log("❌ Disconnected:", users[socket.id]);
      delete users[socket.id];
    }
  });
});

// Starts the server
httpServer.listen(3000, () => {
  console.log("✅ Server running at http://localhost:3000");
});
