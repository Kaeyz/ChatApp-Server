const express = require("express");
const socketio = require("socket.io");
const http = require("http");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const router = require("./router");
app.use(router);


const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`server running on port ${port} `));