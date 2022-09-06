const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
let times = {}; //Contains a list of videos and their current times

app.get("/", (req, res) => {
  res.sendFile(`${__dirname}/index.html`);
});
app.get("/hotreload.js", (req, res) => {
  res.sendFile(`${__dirname}/hotreload.js`);
});

// Tell when user connects/disconnects
io.on("connection", (socket) => {
  console.log("a user connected");
  let relay = ["play", "paused"];
  let idRes;
  let id = new Promise((res) => (idRes = res));
  socket.on("message", async (msg) => {
    io.to(await id).emit("message", msg);
    console.log("Got message", await id, msg.text);
  });
  socket.on("join", (_id) => {
    idRes(_id);
    times[_id] = times[_id] || 0;
    socket.join(_id);
    io.to(socket.id).emit("time", times[_id]);
  });
  socket.on("time", async (_time) => {
    await id;
    times[await id] = _time;
  });
  relay.forEach((item) => {
    socket.on(item, async (data) => {
      console.log("Got message", item);
      // broadcast to everyone execpt for the sender
      time = data;
      socket.broadcast.to(await id).emit(item, data);
    });
  });
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(3000, () => {
  console.log("listening on port 3000");
});
