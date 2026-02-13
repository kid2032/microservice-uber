const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const expressProxy = require("express-http-proxy");
const {Server}=require("socket.io")

const app = express();

app.use(cors({
  origin: "http://localhost:5173", // frontend
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());

const http = require("http");
const { handleSocketConnection } = require("./websockert/socket.controller");
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods:['GET','POST','PUT','DELETE'],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("A User connected:", socket.id);
  handleSocketConnection(socket,io)
  socket.on('disconnect',()=>{
    console.log("User disconnected:", socket.id);

  })
});

// 🔀 USER SERVICE PROXY
app.use(
  "/user",
  expressProxy(
     "http://localhost:3001"
   
  )
);

app.use(
  "/captain",
  expressProxy( 
     "http://localhost:3002"
   
  )
);

app.listen(8000, () => {
  console.log("API Gateway running on port 8000");
});
