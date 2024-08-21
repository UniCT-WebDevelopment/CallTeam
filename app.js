const fs = require("fs");
const express = require("express");
const app = express();
const http = require("http").Server(app);
const https = require("https");
const io = require("socket.io")(http);
const env = require("dotenv").config();
const session = require("express-session");
const path = require("path");
const { Sequelize } = require("sequelize");

//https options
const options = {
    key: fs.readFileSync("server.key"),
    cert: fs.readFileSync("server.cert"),
};

//sequelize
const sequelize = new Sequelize(process.env.DATABASE_URL);

//routers
const publicRouter = require("./routes/public");
const authRouter = require("./routes/auth");
const apiRouter = require("./routes/api");

//utils
const initDbSchema = require("./utils/db");
const handleIoConnection = require("./utils/io");

//middlewares
app.use(express.json());
app.use(express.static("./public"));
app.use(
    session({
        name: "MyPersonalSession",
        resave: false,
        saveUninitialized: false,
        secret: process.env.SECRET_KEY,
        cookie: {
            secure: false,
            maxAge: 60000 * 60,
        },
    })
);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

initDbSchema(sequelize);

app.use(publicRouter);
app.use("/auth", authRouter);
app.use("/api", apiRouter);

handleIoConnection(io);

/* https.createServer(options, app).listen(process.env.PORT, () => {
    console.log("server in ascolto sulla porta 3500");
}); */

http.listen(process.env.PORT, () => {
    console.log(`Server in ascolto sulla porta ${process.env.PORT}`);
});
