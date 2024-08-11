const { Sequelize } = require("sequelize");
const User = require("../models/user");

const sequelize = new Sequelize(process.env.DATABASE_URL);

(async (sequelize) => {
  //testing the connection
  try {
    await sequelize.authenticate();
    console.log("Connected to DB");

    //sync models
    await User.sync({ alter: true });

    console.log("Models synced to DB");
  } catch (error) {
    console.error("Unable to connect to DB", error);
    exit(1);
  }
})(sequelize);
