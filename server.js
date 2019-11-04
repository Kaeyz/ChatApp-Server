const express = require("express");
const socketio = require("socket.io");
const http = require("http");


const { addUser, removeUser, getUser, getUserInRoom } = require("./users");

const app = express();
const server = http.createServer(app);


const io = socketio(server);

const router = require("./router");
app.use(router);

io.on('connection', (socket) => {
  console.log("We have a connection");

  socket.on("join", ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, user });

    if (error) return callback(error);

    socket.emit("message", { user: "admin", text: `${user.name}, Welcome to the room ${user.room}` });
    socket.broadcast.to(user.room).emit("message", { user: "admin", text: `${user.name} has joined` });

    socket.join(user.room);

    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit("message", { user: user.name, text: message });

    callback();
  });

  socket.on("disconnect", () => {
    console.log("User just left");
  })
})


const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`server running on port ${port} `));