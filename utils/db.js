const { Sequelize } = require("sequelize");
const User = require("../models/user");
const Call = require("../models/call");
const CallParticipants = require("../models/callParticipants");
const Request = require("../models/request");
const sequelize = new Sequelize(process.env.DATABASE_URL);

const getUsernameById = async (id) => {
    const user = await User.findOne({
        where: {
            id: id,
        },
    });

    if (!user) return "";
    else return user.username;
};

const initDbSchema = async (sequelize) => {
    //testing the connection
    try {
        await sequelize.authenticate();
        console.log("Connected to DB");

        //sync models
        await User.sync();
        await Call.sync();
        await CallParticipants.sync();
        await Request.sync();

        console.log("Models synced to DB");
    } catch (error) {
        console.error("Unable to connect to DB", error);
        exit(1);
    }
};

module.exports = { initDbSchema, getUsernameById };
