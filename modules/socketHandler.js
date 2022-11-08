const { Server } = require("socket.io");

const socketHandler = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  let user = {};

  io.on("connection", (socket) => {
    // 접속 시 서버에서 실행되는 코드
    const req = socket.request;
    const socket_id = socket.id;
    const client_ip =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    console.log("connection!");
    console.log("socket ID : ", socket_id);
    console.log("client IP : ", client_ip);

    user[socket.id] = { nickname: "users nickname", point: 0 };

    socket.on("disconnect", () => {
      // 사전 정의 된 callback (disconnect, error)
      //console.log(socket.id, " client disconnected");
      delete user[socket.id];
    });
    socket.on("event1", (msg) => {
      // 생성한 이벤트 이름 event1 호출 시 실행되는 callback
      console.log(msg);
      socket.emit("getID", socket.id);
    });

    // 모두에게
    socket.on("input", (data) => {
      io.emit("msg", { id: socket.id, message: data });
      //console.log(socket.id, " 가 보낸 메시지 : ", data);
      console.log(user);
    });

    // 본인 제외한 모든 소켓
    socket.on("inputWM", (data) => {
      socket.broadcast.emit("msg", { id: socket.id, message: data });
      //console.log(data, " 를 받았는데, 본인 빼고 broadcast 해야함");
    });

    // 특정 소켓
    socket.on("private", (id, data) => {
      io.to(id).emit("msg", { id: socket.id, message: data });
      //console.log(socket.id, " 가 ", id, " 에게 보내는 메시지 : ", data);
    });
  });
};
module.exports = socketHandler;
