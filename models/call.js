const { Sequelize, DataTypes, Model } = require("sequelize");
const User = require("./user");

class Call extends Model {}

Call.init(
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        participants: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    },
    {
        sequelize: new Sequelize(process.env.DATABASE_URL),
        modelName: "Call",
    }
);

//admin foreign key
Call.belongsTo(User, {
    foreignKey: {
        name: "admin",
        allowNull: false,
    },
});
User.hasMany(Call);

module.exports = Call;
