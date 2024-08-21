const windowState = {
    chatMessages: [],
    peers: [],
    chatVisible: false,
    peopleVisible: false,
    userId: $("#userId").val(),
    idPeer: window.crypto.randomUUID(),
    myPeer: new Peer(this.idPeer),
};

const socket = io();

windowState.myPeer.on("open", (id) => {
    console.log("joining call:", id);
    socket.emit("joinCall", id, $("#callId").val(), windowState.userId);
});
const getAndSendStream = async () => {
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        });
        console.log("tracks:", stream.getTracks());
        updateVideoGrid(stream, "Tu");

        windowState.myPeer.on("call", (call) => {
            console.log("User calling");
            console.log("Metadata:", call.metadata);
            call.answer(stream);
            call.on(
                "stream",
                (remoteStream) => {
                    if (!windowState.peers[call.metadata.idPeer]) {
                        updateVideoGrid(remoteStream, call.metadata.username);
                        windowState.peers[call.metadata.idPeer] = call;
                    }
                },
                (err) => {
                    console.log("Error on answering the call:", err);
                }
            );
            call.on("close", removePeer(call.metadata.username));
        });

        socket.on("userJoinedCall", (idPeer, username) => {
            console.log("user joined");
            let call = windowState.myPeer.call(idPeer, stream, {
                metadata: { username: username, idPeer: idPeer },
            });
            console.log("user called");
            call.on(
                "stream",
                (remoteStream) => {
                    if (!windowState.peers[call.metadata.idPeer]) {
                        updateVideoGrid(remoteStream, call.metadata.username);
                        windowState.peers[call.metadata.idPeer] = call;
                    }
                },
                (err) => {
                    console.log("Error on getting stream:", err);
                }
            );
            call.on("close", removePeer(call.metadata.username));
        });
        socket.on("userDisconnected", (idPeer) => {
            if (windowState.peers[idPeer]) {
                windowState.peers[idPeer].close();
                delete windowState.peers[idPeer];
            }
        });
    } catch (error) {
        console.log("Error on getting local stream:", error);
    }
};

const updateChat = (message) => {
    windowState.chatMessages.push(message);

    if (chatVisible) {
        //add the message to container
    }
};

const updateVideoGrid = (stream, username) => {
    if (windowState.peers.length + 1 > 2) {
        $("#video-grid-container").addClass("2xl:grid-cols-3");
    } else if (windowState.peers.length + 1 > 1) {
        $("#video-grid-container").addClass("md:grid-cols-2");
    }

    addVideo(stream, username);
};

const removePeer = (username) => {
    document.getElementById(`${username}-video`).parentElement.remove();

    if (windowState.peers.length + 1 < 3) {
        $("#video-grid-container").removeClass("2xl:grid-cols-3");
    } else if (windowState.peers.length + 1 < 2) {
        $("#video-grid-container").removeClass("md:grid-cols-2");
    }
};

const addVideo = (stream, username) => {
    const videoGrid = document.getElementById("video-grid-container");
    const videoContainer = document.createElement("div");
    videoContainer.className =
        "relative video-container bg-black rounded-lg overflow-hidden justify-self-center";
    videoContainer.innerHTML = `<video
                    id="${username}-video"
                    class="w-auto h-full object-contain rounded-lg"
                    autoplay
                ></video>
                <p
                    class="absolute bottom-0 left-0 bg-gray-800 z-30 text-xs p-1 rounded"
                >
                    ${username}
                </p>`;
    videoGrid.appendChild(videoContainer);

    document.getElementById(`${username}-video`).srcObject = stream;
    if (username === "Tu")
        document.getElementById(`${username}-video`).muted = true;
};

const showChat = () => {
    $("#video-grid-container").removeClass("col-span-2").addClass("col-span-1");
    $("#utility-sidebar")
        .removeClass("hidden translate-x-80 h-0")
        .addClass("translate-x-0");
    $("#chat-container").removeClass("hidden");
    $("#people-container").addClass("hidden");
    $("#btn-send-chat-message").on("click", showAndSendMessage);
};

const showpeers = () => {
    $("#video-grid-container").removeClass("col-span-2").addClass("col-span-1");
    $("#utility-sidebar")
        .removeClass("hidden translate-x-80 h-0")
        .addClass("translate-x-0");
    $("#people-container").removeClass("hidden");
    $("#chat-container").addClass("hidden");
};

const closeSidebar = () => {
    console.log("closing");
    $("#video-grid-container").removeClass("col-span-1").addClass("col-span-2");
    $("#utility-sidebar").addClass("h-0 translate-x-80");
};

const showAndSendMessage = () => {
    const chat = document.getElementById("chat-container");
    const msg = $("#chat-msg").val();
};

$(() => {
    console.log("Peer id:", windowState.idPeer);
    console.log("call id:", $("#callId").val());
    console.log("MyPEER", windowState.myPeer);
    //socket.emit("joinCall", windowState.idPeer, $("#callId").val());
    getAndSendStream();
    $("#btn-show-people").on("click", showpeers);
    $("#btn-show-chat").on("click", showChat);
    $(".btn-close-sidebar").on("click", closeSidebar);
});
