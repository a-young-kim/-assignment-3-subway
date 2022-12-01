const { Server } = require("socket.io");
const stations = require("./station");


const socketHandler = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  let user = {};
  let game_user = [];
  let start = 0;
  let new_station = {};
  let isStop;

  io.on("connection", (socket) => {
    // 접속 시 서버에서 실행되는 코드
    const req = socket.request;
    const socket_id = socket.id;
    const client_ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    console.log("connection!");
    console.log("socket ID : ", socket_id);
    console.log("client IP : ", client_ip);

    user[socket.id] = { nickname: '', score: 0 };

    socket.on("disconnect", () => {
      // 사전 정의 된 callback (disconnect, error)
      console.log(socket.id, " client disconnected");
      delete user[socket.id];

      if(game_user.includes(socket.id)){

        game_user = game_user.filter(function(data) {
          return data != socket.id;
        });

        io.to("game").emit('disconnected', {id: socket.id});
        socket.leave('game');
      }
      socket.leave('login');
    });

    // 처음 서버에 연결 될 때 클라이언트에게 id 전송
    socket.on("isConnect", (msg) => {
      socket.emit("getID", socket.id);
    });

    // UserList 받기
    socket.on("newUser", (data) => {
      // login 방 생성
      const roomName = 'login';
      socket.join(roomName);

      user[socket.id].nickname = data;

      // 자신의 data 받기
      socket.emit("getData", user[socket.id]);

      // login에게 userList를 전송
       io.to(roomName).emit("userList", Object.fromEntries(Object.entries(user).filter(([key, value]) => value.nickname != '')));
    });

    // Game 시작
    socket.on("GameRoom", function(data){
      // 새로운 stations 생성
      new_station = JSON.parse(JSON.stringify(stations));

      // page 이동으로 다시 저장
      user[socket.id].nickname = data[0];
      user[socket.id].score = data[1];

      game_user.push(socket.id);

      // game room 생성
      const roomName = 'game';
      socket.join(roomName);

      let game_id = io.of("/").adapter.rooms.get('game');

      io.to(roomName).emit('GameUser', Object.fromEntries(Object.entries(user).filter(([key, value]) => 
        game_id.has(key))));

      console.log(game_user.length);
      if(game_user.length == 3){
        start = 0;
        io.to(roomName).emit('start', game_user[0]);
      }
    });

    // beforeStart
    socket.on('beforeStart', (id, data) => {

      if(start == 0){
          let before = 4;
          const cdb1 = setInterval(() => {
            if(before != 0){
              // 그룹 모두에게
              io.to("game").emit('beforedown', {number: `${before}`});
              before --;
            }
            else{
              clearInterval(cdb1);
              // 시작 user에게
              io.to(game_user[0]).emit('beforedown', {number: `${before}`});
            }
          }, 1000);
        }
      
      else{
        io.to(game_user[start % 3]).emit('beforedown', {number: `${0}`});
      }
    });

    // countdown
    socket.on('countdownbtn', (data) => {
      isStop = false;
      counter = 10;
      
      // id 전송
      io.to("game").emit('order', {now: game_user[start % 3], next: game_user[(start % 3 + 1) % 3]});
      start ++ ;

      console.log('start');

      const cdb2 = setInterval(() => {
        console.log(counter);
        if(!isStop){
          if(counter == 0){
            console.log('턴 종료!');
            clearInterval(cdb2);
            io.to("game").emit('GameOver', {id: socket.id});
          }
          else{
            counter --;
            io.to("game").emit('countdown', {number: `${counter}`});
          }
        }
        else{
          clearInterval(cdb2);
        }
      }, 1000);

    });

    // 답 전송
    socket.on('answer', function(msg){
      io.to("game").emit('broadcast', {nickname: user[socket.id].nickname, answer: msg});

      isStop = true;

      if(Object.keys(new_station).includes(msg)){
        if(new_station[msg] == 0){
          new_station[msg] = 1;
          // 새로운 order
          io.to("game").emit('order', {now: game_user[start % 3], next: game_user[(start % 3 + 1) % 3]});
          // 다음 사람 차례
          io.to("game").emit('start', game_user[start % 3]);
        }
        else{
          // 중복 답안
          console.log('중복');
          io.to("game").emit('GameOver', {id: socket.id});
        }
      }
      else{
        // 1호선이 아님
        console.log('답이 아님');
        io.to("game").emit('GameOver', {id: socket.id});
      }
    });
  });
};
module.exports = socketHandler;
