const { Server } = require("socket.io");

const socketHandler = (server) => {
  const io = new Server(server);
  io.on("connection", (socket) => {
    // 접속 시 서버에서 실행되는 코드
    const req = socket.request;
    const socket_id = socket.id;
    const client_ip =
      req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    console.log("connection!");
    console.log("socket ID : ", socket_id);
    console.log("client IP : ", client_ip);
    socket.on("disconnect", () => {
      // 사전 정의 된 callback (disconnect, error)
      console.log(socket.id, " client disconnected");
    });
    socket.on("event1", (msg) => {
      // 생성한 이벤트 이름 event1 호출 시 실행되는 callback
      console.log(msg);
      socket.emit("msg", "전체 메시지");
    });
  });
};
module.exports = socketHandler;
