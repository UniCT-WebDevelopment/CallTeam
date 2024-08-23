const windowState = {
    chatMessages: [],
    peers: [],
    users: [],
    chatVisible: false,
    peopleVisible: false,
    callSettings: {
        isMicActive: true,
        isVideoActive: true,
    },
    userId: $("#userId").val(),
    callId: $("#callId").val(),
    username: $("#username").val(),
    idPeer: window.crypto.randomUUID(),
};

const socket = io();

const createPeer = () => {
    windowState.myPeer = new Peer(windowState.idPeer);

    //waiting for connection opening
    windowState.myPeer.on("open", (id) => {
        console.log("joining call:", id);
        socket.emit("joinCall", id, $("#callId").val(), windowState.userId);
    });

    console.log("MyPEER id:", windowState.myPeer._id);
};

const getAndSendStream = async () => {
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
        });
        console.log("tracks:", stream.getTracks());
        console.log("Audio Tracks:", stream.getAudioTracks());
        console.log("Video Tracks:", stream.getVideoTracks());

        //updating window with client stream
        windowState.users.push(windowState.username);
        updateVideoGrid(stream, "Tu");

        //waiting for other call
        windowState.myPeer.on("call", (call) => {
            console.log("User calling");
            console.log("Metadata:", call.metadata);
            call.answer(stream);
            call.on(
                "stream",
                (remoteStream) => {
                    if (!windowState.peers[call.metadata.idPeerCaller]) {
                        windowState.peers[call.metadata.idPeerCaller] = call;
                        if (
                            !windowState.users.find((user) => {
                                return user == call.metadata.usernameCaller;
                            })
                        )
                            windowState.users.push(
                                call.metadata.usernameCaller
                            );
                        updateVideoGrid(
                            remoteStream,
                            call.metadata.usernameCaller
                        );
                    }
                },
                (err) => {
                    console.log("Error on answering the call:", err);
                }
            );
        });
        //ensure that the client can answer to the call
        //needed because the server can trigger the userJoinedCall event and then call the user
        //before client initializes peer.on("call") event
        socket.emit("readyToBeCalled", windowState.username);
        console.log("ready to be called");

        //call a user when join the call
        socket.on("userJoinedCall", (idPeer, username) => {
            console.log("user joined. Peer id:", idPeer);
            //calling the other peer
            let call = windowState.myPeer.call(idPeer, stream, {
                metadata: {
                    usernameCaller: windowState.username,
                    usernameReceiver: username,
                    idPeerCaller: windowState.idPeer,
                    idPeerReceiver: idPeer,
                },
            });
            console.log("user called");
            console.log("Peer Connection", call.peerConnection);
            call.on(
                "stream",
                (remoteStream) => {
                    console.log("Remote stream arrived. Stream:", remoteStream);
                    if (!windowState.peers[call.metadata.idPeerReceiver]) {
                        windowState.peers[call.metadata.idPeerReceiver] = call;
                        if (
                            !windowState.users.find((user) => {
                                return user == call.metadata.usernameReceiver;
                            })
                        )
                            windowState.users.push(
                                call.metadata.usernameReceiver
                            );
                        updateVideoGrid(
                            remoteStream,
                            call.metadata.usernameReceiver
                        );
                    }
                },
                (err) => {
                    console.log("Error on getting stream:", err);
                }
            );
        });

        //handle user disconnection from the call
        socket.on("userDisconnected", (idPeer, username) => {
            if (windowState.peers[idPeer]) {
                console.log("User disconnecting. Peer:", idPeer);
                windowState.peers[idPeer].close();
                delete windowState.peers[idPeer];
                const index = windowState.users.findIndex((user) => {
                    return user == username;
                });

                if (index != -1) windowState.users.splice(index, 1);
                removePeer(username);
            }
        });

        //toggle video
        $("#btn-videocam").on("click", () => {
            toggleVideo(stream.getVideoTracks()[0]);
        });
        //toggle audio
        $("#btn-mic").on("click", () => {
            toggleMic(stream.getAudioTracks()[0]);
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

const toggleMic = (audioTrack) => {
    const micButton = document.getElementById("btn-mic");
    if (windowState.callSettings.isMicActive) {
        windowState.callSettings.isMicActive = false;
        audioTrack.enabled = false;

        //change ui
        micButton.className =
            "group rounded-full transition-all bg-green-800 hover:bg-green-700 hover:rounded-full p-2";
        micButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
  <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
  <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
</svg>
`;
        console.log("Updated Audio Track:", stream.getAudioTracks()[0]);
    } else {
        windowState.callSettings.isMicActive = true;
        audioTrack.enabled = true;

        //change ui
        micButton.className =
            "group rounded-full transition-all hover:bg-gray-800 hover:rounded-full p-2";
        micButton.innerHTML = `<svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="size-6 group-hover:fill-black"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
                        />
                    </svg>`;
    }
};

const toggleVideo = (videoTrack) => {
    const videoButton = document.getElementById("btn-videocam");
    if (windowState.callSettings.isVideoActive) {
        windowState.callSettings.isVideoActive = false;
        videoTrack.enabled = false;

        videoButton.className =
            "group rounded-full transition-all bg-green-800 hover:bg-green-700 hover:rounded-full p-2";
        videoButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
  <path d="M.97 3.97a.75.75 0 0 1 1.06 0l15 15a.75.75 0 1 1-1.06 1.06l-15-15a.75.75 0 0 1 0-1.06ZM17.25 16.06l2.69 2.69c.944.945 2.56.276 2.56-1.06V6.31c0-1.336-1.616-2.005-2.56-1.06l-2.69 2.69v8.12ZM15.75 7.5v8.068L4.682 4.5h8.068a3 3 0 0 1 3 3ZM1.5 16.5V7.682l11.773 11.773c-.17.03-.345.045-.523.045H4.5a3 3 0 0 1-3-3Z" />
</svg>
`;
    } else {
        windowState.callSettings.isVideoActive = true;
        videoTrack.enabled = true;

        videoButton.className =
            "group rounded-full transition-all hover:bg-gray-800 hover:rounded-full p-2";
        videoButton.innerHTML = `<svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="size-6 group-hover:fill-black"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                        />
                    </svg>`;
    }
};

const updateVideoGrid = async (stream, username) => {
    console.log("Peers:", windowState.peers);

    //get participants
    console.log("users", windowState.users);

    if (windowState.users.length > 2) {
        $("#video-grid-container").addClass("2xl:grid-cols-3");
    } else if (windowState.users.length > 1) {
        $("#video-grid-container").addClass("md:grid-cols-2");
    }

    addVideo(stream, username);
};

const removePeer = (username) => {
    console.log("Removing peer. Username:", username);
    console.log("users", windowState.users);
    document.getElementById(`${username}-video`).parentElement.remove();

    if (windowState.users.length < 2) {
        $("#video-grid-container").removeClass("md:grid-cols-2");
    } else if (windowState.users.length < 3) {
        $("#video-grid-container").removeClass("2xl:grid-cols-3");
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

    //socket.emit("joinCall", windowState.idPeer, $("#callId").val());
    createPeer();
    getAndSendStream();
    $("#btn-show-people").on("click", showpeers);
    $("#btn-show-chat").on("click", showChat);
    $(".btn-close-sidebar").on("click", closeSidebar);
});
