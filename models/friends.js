const { Sequelize, DataTypes, Model } = require("sequelize");
const User = require("./user");

class Friends extends Model {}

Friends.init(
    {},
    { sequelize: new Sequelize(process.env.DATABASE_URL), modelName: "Friends" }
);

User.belongsToMany(User, { as: "friend", through: Friends });

module.exports = Friends;
