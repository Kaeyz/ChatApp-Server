const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const cors = require("cors");

const { addUser, removeUser, getUser, getUsersInRoom } = require("./users");

const app = express();
const server = http.createServer(app);


const io = socketio(server);

const router = require("./router");

app.use(router);
app.use(cors());

io.on('connection', (socket) => {
  console.log("We have a connection");

  socket.on("join", ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });
    if (error) return callback(error);

    socket.join(user.room);

    socket.emit("message", { user: "admin", text: `${user.name}, Welcome to the room ${user.room}` });

    socket.broadcast.to(user.room).emit("message", { user: "admin", text: `${user.name} has joined` });

    io.to(user.name).emit("roomData", {room: user.room, users: getUsersInRoom(user.room)})

    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit("message", { user: user.name, text: message });
    io.to(user.name).emit("roomData", {room: user.room, users: getUsersInRoom(user.room)})


    callback();
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit("message"), {user: "admin", text: `${user.name} has left.`}
    }
  })
})


const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`server running on port ${port} `));