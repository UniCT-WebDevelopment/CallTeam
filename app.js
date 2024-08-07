const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const env = require("dotenv").config();
const session = require("express-session");

app.use(express.json());
app.use(express.static("./public"));

// Use the session middleware
app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }}))

app.get("/signup", (req, res) => {
    const options = {
        root: __dirname
    }
    res.sendFile("public/auth/signup.html", options);
})

http.listen(process.env.PORT, () => {
    console.log(`Server in ascolto sulla porta ${process.env.PORT}`);
})