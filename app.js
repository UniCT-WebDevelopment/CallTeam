const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const env = require("dotenv").config();
const session = require("express-session");
const path = require("path");

//routers
const publicRouter = require("./routes/public");

app.use(express.json());
app.use(express.static("./public"));

// Use the session middleware
app.use(session(
    { 
        name: 'MyPersonalSession',
        resave: false,
        saveUninitialized: false,
        secret: process.env.SECRET_KEY, 
        cookie: {
            secure: false, 
            maxAge: 60000 
        }
    }
))

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(publicRouter);

http.listen(process.env.PORT, () => {
    console.log(`Server in ascolto sulla porta ${process.env.PORT}`);
})