const express = require("express");
const path = require("path");
const { createServer } = require("http");
const { Server } = require("socket.io");
const exphbs = require("express-handlebars");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const users = {}; // Store socket.id => username

// Setup Handlebars view engine
app.engine("hbs", exphbs.engine({ extname: ".hbs" }));
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// Serve public static files
app.use(express.static(path.join(__dirname, "public")));

// Render home.hbs
app.get("/", (req, res) => {
  console.log("Serving homepage 🚀");
  res.render("home");
});

// Socket.IO events
io.on("connection", (socket) => {
  console.log("✅ A user connected:", socket.id);

  socket.on("new-user-joined", (username) => {
    users[socket.id] = username;
    socket.broadcast.emit("user-joined", username);
  });

  socket.on("send", (message) => {
   const name = users[socket.id] || "Anonymous"; // fallback name
    //  console.log(`📩 Message from ${name}: ${message}`);
  socket.broadcast.emit("receive", {
    message: message,
    name: name
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", users[socket.id]);
    delete users[socket.id];
  });
});

// Start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
