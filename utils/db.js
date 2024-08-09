const testConnection = async (sequelize) => {
    //testing the connection
    try {
        await sequelize.authenticate();
        console.log("Connected to DB");
    } catch (error) {
        console.error("Unable to connect to DB", error);
        exit(1);
    }
}

module.exports = { testConnection };