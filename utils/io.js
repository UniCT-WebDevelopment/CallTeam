const CallParticipants = require("../models/callParticipants");
const User = require("../models/user");
const { Op, where } = require("sequelize");
const { getUsernameById } = require("./db");
const Call = require("../models/call");
const Request = require("../models/request");

function handleIoConnection(io) {
    io.on("connection", (socket) => {
        console.log("User connected to io:", socket.id);

        socket.on("joinNotifyRoom", (username) => {
            socket.join(`notify-${username}`);
            console.log(`${username} joined his notify room`);
        });

        //join call event -> communicate to other user in call that user joined
        socket.on("joinCall", async (idPeer, callId, userId) => {
            console.log("User joined. Peer:", idPeer);
            //get call from db
            const call = await Call.findOne({ where: { id: callId } });

            //join socket io room
            socket.join(callId);

            //be sure that the client can be called
            //and then trigger the userjoinedcall event
            socket.on("readyToBeCalled", (username) => {
                console.log(`Peer ${idPeer} ready to be called`);

                socket.to(callId).emit("userJoinedCall", idPeer, username);
            });

            //add participant to call in db
            //update participants
            call.participants++;
            await call.save();

            //----------------To delete---------------------
            let userInCall = await CallParticipants.findOne({
                where: {
                    [Op.and]: [{ UserId: userId }, { CallId: callId }],
                },
            });

            if (!userInCall)
                userInCall = await CallParticipants.create({
                    UserId: userId,
                    CallId: callId,
                    isInCall: true,
                });
            //------------------------------------------------

            socket.on("disconnect", async () => {
                userInCall.isInCall = false;
                await userInCall.save();

                const username = await getUsernameById(userId);
                socket.to(callId).emit("userDisconnected", idPeer, username);
            });
        });

        //handle chat messages
        socket.on("sendMessage", (callId, username, message) => {
            socket.to(callId).emit("newChatMessage", username, message);
        });

        socket.on(
            "sendInvitation",
            async (usernameSender, usernameReceiver, callId, callback) => {
                try {
                    const sender = await User.findOne({
                        where: { username: usernameSender },
                    });
                    const receiver = await User.findOne({
                        where: { username: usernameReceiver },
                    });

                    if (sender && receiver) {
                        let request = await Request.findOne({
                            where: {
                                senderId: sender.id,
                                receiverId: receiver.id,
                                callId: callId,
                            },
                        });
                        if (!request)
                            await Request.create({
                                senderId: sender.id,
                                receiverId: receiver.id,
                                callId: callId,
                            });
                        callback("ok");
                        socket
                            .to(`notify-${usernameReceiver}`)
                            .emit("newRequest", {
                                usernameSender: usernameSender,
                                callId: callId,
                            });
                    } else {
                        callback("Bad Request");
                        socket.emit("errorInvitation", "Invalid Username");
                    }
                } catch (error) {
                    console.log("Error on sending invitation", error);
                }
            }
        );

        socket.on(
            "acceptedInvitation",
            async (usernameSender, usernameReceiver, callId) => {
                try {
                    const sender = await User.findOne({
                        where: { username: usernameSender },
                    });
                    const receiver = await User.findOne({
                        where: { username: usernameReceiver },
                    });

                    if (sender && receiver && callId)
                        await Request.destroy({
                            where: {
                                senderId: sender.id,
                                receiverId: receiver.id,
                                callId: callId,
                            },
                        });
                } catch (error) {
                    console.log("Error on accepting invitation", error);
                }
            }
        );
    });
}

module.exports = handleIoConnection;
