const express = require("express");
const Socket = require("socket.io");
const PORT = 5000;

const app = express();
const server = require("http").createServer(app);

const io = Socket(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const rooms = {}; // Store active rooms

io.on("connection", socket => {
  socket.on("joinRoom", ({ room, username }) => {
    // Join the specified room
    socket.join(room);

    // Store the user's username in the socket object
    socket.username = username;

    // If the room doesn't exist, create it
    if (!rooms[room]) {
      rooms[room] = [];
    }

    // Add the user to the room's user list
    rooms[room].push(username);

    // Notify all clients in the room about the new user
    io.to(room).emit("userJoined", { username, room, users: rooms[room] });

    // Send a private message to the newly joined user
    socket.emit("private", {
      id: socket.id,
      name: socket.username,
      msg: "Welcome to the chat room!",
    });
  });

  socket.on("message", ({ room, message }) => {
    // Broadcast the message to all clients in the room
    io.to(room).emit("message", {
      message,
      user: socket.username,
    });
  });

  socket.on("disconnect", () => {
    // If the user was in a room, remove them from the room's user list
    if (socket.username) {
      for (const room in rooms) {
        if (rooms[room].includes(socket.username)) {
          rooms[room] = rooms[room].filter(user => user !== socket.username);
          io.to(room).emit("userLeft", { username: socket.username, room, users: rooms[room] });
          break;
        }
      }
    }
  });
});
 

server.listen(PORT, () => {
  console.log("listening on PORT: ", PORT);
});