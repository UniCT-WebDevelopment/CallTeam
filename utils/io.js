const User = require("../models/user");

function handleIoConnection(io) {
    io.on("connection", (socket) => {
        console.log("User connected to io:", socket.id);
        socket.on("joinCall", async (idPeer, callId, userId) => {
            console.log("User joined. Peer:", idPeer);
            socket.join(callId);
            socket.on("disconnect", () => {
                socket.to(callId).emit("userDisconnected", idPeer);
            });
            //query the db for getting username
            try {
                const user = await User.findOne({
                    where: {
                        id: Number(userId),
                    },
                });

                socket.to(callId).emit("userJoinedCall", idPeer, user.username);
            } catch (error) {
                console.log("Error on retrieving user from db:", error);
                socket.to(callId).emit("userJoinedCall", idPeer, "Undefined");
            }
        });
    });
}

module.exports = handleIoConnection;
