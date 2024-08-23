const fs = require("fs");
const express = require("express");
const app = express();
const http = require("http");
const https = require("https");
const { Server } = require("socket.io");
const env = require("dotenv").config();
const session = require("express-session");
const path = require("path");
const { Sequelize } = require("sequelize");

//https options
const options = {
    key: fs.readFileSync("server.key"),
    cert: fs.readFileSync("server.cert"),
};

//servers
const httpServer = http.createServer(app);
const httpsServer = https.createServer(options, app);

//sequelize
const sequelize = new Sequelize(process.env.DATABASE_URL);

//io
const io = new Server(httpServer);
const ioHttps = new Server(httpsServer);

//routers
const publicRouter = require("./routes/public");
const authRouter = require("./routes/auth");
const apiRouter = require("./routes/api");

//utils
const { initDbSchema } = require("./utils/db");
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
handleIoConnection(ioHttps);

httpsServer.listen(4000, () => {
    console.log("server in ascolto sulla porta 4000");
});

httpServer.listen(process.env.PORT, () => {
    console.log(`Server in ascolto sulla porta ${process.env.PORT}`);
});
