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

// Access the session as req.session
app.get('/', function(req, res, next) {
  if (req.session.views) {
    req.session.views++
    res.setHeader('Content-Type', 'text/html')
    res.write('<p>views: ' + req.session.views + '</p>')
    res.write('<p>expires in: ' + (req.session.cookie.maxAge / 1000) + 's</p>')
    res.end()
  } else {
    req.session.views = 1
    res.end('welcome to the session demo. refresh!')
  }
})

http.listen(process.env.PORT, () => {
    console.log(`Server in ascolto sulla porta ${process.env.PORT}`);
})