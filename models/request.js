const { Sequelize, DataTypes, Model } = require("sequelize");
const User = require("./user");
const Call = require("./call");
const sequelize = new Sequelize(process.env.DATABASE_URL);

const Request = sequelize.define("request", {
    senderId: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: "id",
        },
        primaryKey: true,
    },
    receiverId: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: "id",
        },
        primaryKey: true,
    },
    callId: {
        type: DataTypes.STRING,
        references: {
            model: Call,
            key: "id",
        },
        primaryKey: true,
    },
});

module.exports = Request;
