const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const env = require("dotenv").config();
const session = require("express-session");
const path = require("path");
const { Sequelize } = require("sequelize");

//routers
const publicRouter = require("./routes/public");
const authRouter = require("./routes/auth");

//utils
const { testConnection } = require("./utils/db");

//middlewares
app.use(express.json());
app.use(express.static("./public"));
app.use(session(
    { 
        name: 'MyPersonalSession',
        resave: false,
        saveUninitialized: false,
        secret: process.env.SECRET_KEY, 
        cookie: {
            secure: false, 
            maxAge: 60000 * 60
        }
    }
))

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//connecting to db
const sequelize = new Sequelize(process.env.DATABASE_URL);
//testing the connection
testConnection(sequelize);

app.use(publicRouter);
app.use("/auth", authRouter);

http.listen(process.env.PORT, () => {
    console.log(`Server in ascolto sulla porta ${process.env.PORT}`);
})