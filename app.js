const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http)
const env = require("dotenv").config()

app.use(express.json());
app.use(express.static("./public"));

http.listen(process.env.PORT, () => {
    console.log(`Server in ascolto sulla porta ${process.env.PORT}`);
})