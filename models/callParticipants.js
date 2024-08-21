const Call = require("./call");
const User = require("./user");
const { Sequelize, DataTypes, Model } = require("sequelize");

class CallParticipants extends Model {}

CallParticipants.init(
    {
        UserId: {
            type: DataTypes.INTEGER,
            references: {
                model: User,
                key: "id",
            },
        },
        CallId: {
            type: DataTypes.STRING,
            references: {
                model: Call,
                key: "id",
            },
        },
    },
    {
        sequelize: new Sequelize(process.env.DATABASE_URL),
        modelName: "CallParticipants",
    }
);

User.belongsToMany(Call, { through: CallParticipants });
Call.belongsToMany(User, { through: CallParticipants });

module.exports = CallParticipants;
