const { Sequelize, DataTypes, Model } = require("sequelize");

class User extends Model {}

//define user schema
User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        surname: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        online: {
            type: DataTypes.BOOLEAN,
        },
    },
    {
        sequelize: new Sequelize(process.env.DATABASE_URL),
        modelName: "User",
    }
);

module.exports = User;
