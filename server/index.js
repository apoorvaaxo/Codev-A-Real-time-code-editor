import express from "express";
import http from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", 
  },
});


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Store for rooms
const rooms = new Map();

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  let currentRoom = null;
  let currentUser = null;
  let currentPeerId = null;

  socket.on("join", ({ roomId, userName, peerId }) => {
    // Leave previous room if any
    if (currentRoom) {
      socket.leave(currentRoom);
      const usersInRoom = rooms.get(currentRoom) || [];
      rooms.set(currentRoom, usersInRoom.filter(user => user.peerId !== currentPeerId));
      io.to(currentRoom).emit("userJoined", rooms.get(currentRoom));
    }

    // Update user info
    currentRoom = roomId;
    currentUser = userName;
    currentPeerId = peerId;

    socket.join(roomId);

    if (!rooms.has(roomId)) rooms.set(roomId, []);

    const usersInRoom = rooms.get(roomId);
    if (!usersInRoom.some(user => user.peerId === peerId)) {
      usersInRoom.push({ userName, peerId });
    }

    io.to(roomId).emit("userJoined", rooms.get(roomId));
  });

  socket.on("codeChange", ({ roomId, code }) => {
    io.to(roomId).emit("codeUpdate", code);
  });

  socket.on("leaveRoom", () => {
    if (currentRoom && currentPeerId) {
      const usersInRoom = rooms.get(currentRoom) || [];
      rooms.set(currentRoom, usersInRoom.filter(user => user.peerId !== currentPeerId));
      io.to(currentRoom).emit("userJoined", rooms.get(currentRoom));
      socket.leave(currentRoom);

      currentRoom = null;
      currentUser = null;
      currentPeerId = null;
    }
  });

  socket.on("typing", ({ roomId, userName }) => {
    socket.to(roomId).emit("userTyping", userName);
  });

  socket.on("languageChange", ({ roomId, language }) => {
    io.to(roomId).emit("languageUpdate", language);
  });

  
  socket.on("disconnect", () => {
    if (currentRoom && currentPeerId) {
      const usersInRoom = rooms.get(currentRoom) || [];
      rooms.set(currentRoom, usersInRoom.filter(user => user.peerId !== currentPeerId));
      io.to(currentRoom).emit("userJoined", rooms.get(currentRoom));
    }
    console.log("User disconnected", socket.id);
  });
});

const port = process.env.PORT || 5000;

app.use(express.static(path.join(__dirname, "client/dist")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
