const CallParticipants = require("../models/callParticipants");
const User = require("../models/user");
const { Op } = require("sequelize");
const { getUsernameById } = require("./db");

function handleIoConnection(io) {
    io.on("connection", (socket) => {
        console.log("User connected to io:", socket.id);

        //join call event -> communicate to other user in call that user joined
        socket.on("joinCall", async (idPeer, callId, userId) => {
            console.log("User joined. Peer:", idPeer);

            //join socket io room
            socket.join(callId);

            //be sure that the client can be called
            //and then trigger the userjoinedcall event
            socket.on("readyToBeCalled", (username) => {
                console.log(`Peer ${idPeer} ready to be called`);

                socket.to(callId).emit("userJoinedCall", idPeer, username);
            });

            //add participant to call in db

            //----------------To delete---------------------
            const isUserInCall = await CallParticipants.findOne({
                where: {
                    [Op.and]: [{ UserId: userId }, { CallId: callId }],
                },
            });

            if (!isUserInCall)
                await CallParticipants.create({
                    UserId: userId,
                    CallId: callId,
                });
            //------------------------------------------------

            socket.on("disconnect", async () => {
                await CallParticipants.destroy({
                    where: {
                        [Op.and]: [{ UserId: userId }, { CallId: callId }],
                    },
                });
                const username = await getUsernameById(userId);
                socket.to(callId).emit("userDisconnected", idPeer, username);
            });
        });

        //handle chat messages
        socket.on("sendMessage", (callId, username, message) => {
            socket.to(callId).emit("newChatMessage", username, message);
        });
    });
}

module.exports = handleIoConnection;
