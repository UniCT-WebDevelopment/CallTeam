const Request = require("../models/request");
const { getUsernameById } = require("../utils/db");

const getRequests = async (req, res) => {
    //debug
    let allRequests = await Request.findAll();
    console.log("All requests", allRequests);

    const userId = req.query.userId;

    if (!userId) {
        return res.status(400).json({ error: "User Id not exists" });
    }

    if (req.session.userId != userId) {
        return res.redirect("/unauthorized");
    }

    const requests = await Request.findAll({
        where: { receiverId: userId },
        raw: false,
    });
    let requestsToSend = [];
    for (let request of requests) {
        const sender = await getUsernameById(request.senderId);
        requestsToSend.push({ sender: sender, callId: request.callId });
    }

    console.log("request sent", requestsToSend);

    res.status(200).json({ requests: requestsToSend });
};

module.exports = { getRequests };
