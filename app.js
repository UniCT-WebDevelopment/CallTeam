const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http)

http.listen(3000, () => {
    console.log("Server in ascolto sulla porta 3000")
})