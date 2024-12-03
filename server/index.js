import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", // allowing all origins
  },
});

// Creating a store for rooms
const rooms = new Map();

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  let currentRoom = null;
  let currentUser = null;

  socket.on("join", ({ roomId, userName }) => {
    // If user is already in a room, make them leave it
    if (currentRoom) {
      socket.leave(currentRoom);
      rooms.get(currentRoom).delete(currentUser);
      io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom)));
    }

    // Update current room and user
    currentRoom = roomId;
    currentUser = userName;

    socket.join(roomId);

    // If the roomId is not present, create a new set for the room
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }

    rooms.get(roomId).add(userName);

    // Notify that someone has joined the room
    io.to(roomId).emit("userJoined", Array.from(rooms.get(currentRoom)));
  });

  // Changes in the code so that everyone sees the same code
  socket.on("codeChange", ({ roomId, code }) => {
    io.to(roomId).emit("codeUpdate", code);
  });

  // Leave user
  socket.on("leaveRoom", () => {
    if (currentRoom && currentUser) {
      rooms.get(currentRoom).delete(currentUser);
      io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom)));
      socket.leave(currentRoom);

      currentRoom = null;
      currentUser = null;
    } 
  });

  socket.on("typing", ({ roomId, userName }) => {
    socket.to(roomId).emit("userTyping", userName);
  });

  socket.on("languageChange", ({ roomId, language }) => {
    io.to(roomId).emit("languageUpdate", language);
  });

  socket.on("disconnect", () => {
    if (currentRoom && currentUser) {
      rooms.get(currentRoom).delete(currentUser);
      io.to(currentRoom).emit("userJoined", Array.from(rooms.get(currentRoom)));
    }
    console.log("User disconnected", socket.id);
  });
});

const port = process.env.PORT || 5000;

const __dirname = path.resolve();

app.use(express.static(path.join(__dirname, "client/dist")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client" , "dist", "index.html"));
});


server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
