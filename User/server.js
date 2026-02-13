const express = require("express")
const app = express()
const http = require("http")
const cookieParser = require("cookie-parser")
const cors= require("cors")
const rabbitMq = require('./service/rabbit')
rabbitMq.connect();
const server =http.createServer(app)
const host=3001
require("./mongo")

const corsOptions = {
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Origin", "Accept"]
  };
  
  app.use(cors(corsOptions));
  app.use(express.json());  // must be BEFORE your routes
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
  app.use("/", require("./routes/user.route"));



  server.listen(host,()=>{
    console.log(`Connecting User Server to port ${host}`)
})