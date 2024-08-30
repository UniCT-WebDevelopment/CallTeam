const windowState = {
    chatMessages: [],
    calls: {},
    users: [],
    streams: {},
    chatVisible: false,
    peopleVisible: false,
    callSettings: {
        isMicActive: true,
        isVideoActive: true,
        areSettingsVisible: false,
    },
    userId: $("#userId").val(),
    callId: $("#callId").val(),
    username: $("#username").val(),
    idPeer: window.crypto.randomUUID(),
};

const utilities = {
    getCurrentHour: () => {
        const date = new Date();
        return `${date.getHours()}:${date.getMinutes()}`;
    },
    updateChatUi: (username, message) => {
        username = username == windowState.username ? "Tu" : username;
        const msgsContainer = document.getElementById(
            "chat-messages-container"
        );
        const msgElement = document.createElement("div");
        msgElement.className = "p-2 my-1 flex flex-col";
        msgElement.innerHTML = `<div class="font-bold text-green-800 mb-1">
                            ${username} <span class="text-xs font-medium">${utilities.getCurrentHour()}</span>
                        </div>
                        <div class="text-wrap text-sm">
                            ${message}
                        </div>`;
        msgsContainer.appendChild(msgElement);
    },
    updateUserUi: (username) => {
        const usersContainer = document.getElementById("people-list-container");
        const user = document.createElement("div");
        user.className = "p-1 my-1 flex";
        user.setAttribute("id", username);
        user.innerHTML = `<div
                                class="w-8 h-8 rounded-full bg-green-800 font-medium text-xl text-center pt-0.5 mx-2"
                            >
                                ${username.charAt(0).toUpperCase()}
                            </div>
                            <div class="p-1 mr-4">${username}</div>
                            <div class="absolute right-0.5 p-1">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke-width="1.5"
                                    stroke="currentColor"
                                    class="size-6"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
                                    />
                                </svg>
                            </div>`;
        usersContainer.appendChild(user);
    },
    showDefaultChatButton: () => {
        const btnShowChat = document.getElementById("btn-show-chat");
        btnShowChat.className =
            "transition-all hover:rounded-full hover:bg-gray-800 p-2";
        btnShowChat.innerHTML = `<svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-6"
    >
        <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
        />
    </svg>`;
    },
    showDefaultPeopleButton: () => {
        const btnShowPeople = document.getElementById("btn-show-people");
        btnShowPeople.className =
            "transition-all hover:rounded-full hover:bg-gray-800 p-2";
        btnShowPeople.innerHTML = `<svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="size-6"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                        />
                    </svg>`;
    },
    checkOptionDoesNotExists: (select, value) => {
        for (const option of select.children) {
            if (option.value == value) {
                return false;
            }
        }
        return true;
    },
    changeStream: async (username, change, oldStream, newConstraints) => {
        try {
            const newStream = await navigator.mediaDevices.getUserMedia(
                newConstraints
            );

            /* oldStream.getTracks().forEach((track) => {
                track.stop();
            }); */

            //change src of my video
            document.getElementById(`${username}-video`).srcObject = newStream;
            windowState.streams[username] = newStream;
            console.log("changed stream", newStream);

            const trackToChange =
                change == "video"
                    ? newStream.getVideoTracks()[0]
                    : newStream.getAudioTracks()[0];
            console.log("changing senders track", windowState.calls);
            //console.log("Entries", Object.entries(windowState.calls));
            for (const call in windowState.calls) {
                /*  console.log("peerConnection", call.peerConnection);
                console.log("senders", call.peerConnection.getSenders()); */
                windowState.calls[call].peerConnection
                    .getSenders()
                    .forEach((sender) => {
                        console.log("sender:", sender);
                        console.log("track", sender.track);
                        if (sender.track.kind == trackToChange.kind) {
                            sender.replaceTrack(trackToChange);
                        }
                    });
            }
        } catch (error) {
            console.log("Error on changing settings:", error);
        }
    },
    changeVideoSinkId: async (video, sinkId, selector) => {
        if (typeof video.sinkId != "undefined") {
            try {
                await video.setSinkId(sinkId);
            } catch (error) {
                console.log("Error on setting sinkId:", error);
                selector.selectedIndex = 0;
            }
        } else {
            console.warn("Browser does not support output device selection.");
        }
    },
    updateDeviceSettings: function (devices) {
        const videoSelect = document.getElementById("videocamera-input");
        const micSelect = document.getElementById("mic-input");
        const audioSelect = document.getElementById("audio-output");
        const myVideo = document.getElementById(
            `${windowState.username}-video`
        );
        const myStream = myVideo.srcObject;

        devices.forEach((device) => {
            let option = document.createElement("option");
            switch (device.kind) {
                case "videoinput":
                    if (
                        this.checkOptionDoesNotExists(
                            videoSelect,
                            device.deviceId
                        )
                    ) {
                        option.innerHTML = device.label;
                        option.value = device.deviceId;
                        videoSelect.appendChild(option);
                    }
                    break;
                case "audioinput":
                    if (
                        this.checkOptionDoesNotExists(
                            micSelect,
                            device.deviceId
                        )
                    ) {
                        option.innerHTML = device.label;
                        option.value = device.deviceId;
                        micSelect.appendChild(option);
                    }
                    break;
                case "audiooutput":
                    if (
                        this.checkOptionDoesNotExists(
                            audioSelect,
                            device.deviceId
                        )
                    ) {
                        option.innerHTML = device.label;
                        option.value = device.deviceId;
                        audioSelect.appendChild(option);
                    }
                    break;
            }
        });

        //add event handlers for changing settings
        videoSelect.addEventListener("change", (event) => {
            const audioConstraints = myStream
                .getAudioTracks()[0]
                .getConstraints();
            const constraints = {
                video: { deviceId: { exact: event.target.value } },
                audio: audioConstraints
                    ? audioConstraints
                    : { deviceId: undefined },
            };
            this.changeStream(
                windowState.username,
                "video",
                myStream,
                constraints
            );
        });
        micSelect.addEventListener("change", (event) => {
            const videoConstraints = myStream
                .getVideoTracks()[0]
                .getConstraints();
            console.log(
                "Constraints of old video",
                myStream.getVideoTracks()[0].getConstraints()
            );
            const constraints = {
                video: videoConstraints
                    ? videoConstraints
                    : { deviceId: undefined },
                audio: { deviceId: { exact: event.target.value } },
            };
            this.changeStream(
                windowState.username,
                "audio",
                myStream,
                constraints
            );
        });
        audioSelect.addEventListener("change", (event) => {
            windowState.users.forEach((user) => {
                if (user != windowState.username) {
                    const video = document.getElementById(`${user}-video`);
                    this.changeVideoSinkId(
                        video,
                        event.target.value,
                        audioSelect
                    );
                }
            });
        });
    },
};

const socket = io();

const createPeer = () => {
    windowState.myPeer = new Peer(windowState.idPeer);
    console.log("MyPEER id:", windowState.myPeer._id);

    return new Promise((resolve, reject) => {
        //waiting for connection opening
        windowState.myPeer.on("open", (id) => {
            console.log("joining call:", id);
            socket.emit("joinCall", id, $("#callId").val(), windowState.userId);
            resolve();
        });
    });
};

const listenToSocketEvents = () => {
    socket.on("newChatMessage", (username, message) => {
        utilities.updateChatUi(username, message);
    });
};

const getAndSendStream = async () => {
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: undefined },
            audio: { deviceId: undefined },
        });
        console.log("Got stream");
        console.log("tracks:", stream.getTracks());
        console.log("Audio Tracks:", stream.getAudioTracks());
        console.log("Video Tracks:", stream.getVideoTracks());

        //updating window with client stream
        updateUsers(windowState.username);
        //windowState.users.push(windowState.username);
        windowState.streams[windowState.username] = stream;
        updateVideoGrid(stream, windowState.username);

        //waiting for other call
        windowState.myPeer.on("call", (call) => {
            console.log("User calling");
            console.log("Metadata:", call.metadata);
            call.answer(windowState.streams[windowState.username]);
            console.log("Peer Connection:", call.peerConnection);
            call.on(
                "stream",
                (remoteStream) => {
                    if (!windowState.calls[call.metadata.idPeerCaller]) {
                        windowState.calls[call.metadata.idPeerCaller] = call;
                        console.log("Calls after answer", windowState.calls);
                        if (
                            !windowState.users.find((user) => {
                                return user == call.metadata.usernameCaller;
                            })
                        )
                            /* windowState.users.push(
                                call.metadata.usernameCaller
                            ); */
                            updateUsers(call.metadata.usernameCaller);
                        windowState.streams[call.metadata.usernameCaller] =
                            remoteStream;
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
            let call = windowState.myPeer.call(
                idPeer,
                windowState.streams[windowState.username],
                {
                    metadata: {
                        usernameCaller: windowState.username,
                        usernameReceiver: username,
                        idPeerCaller: windowState.idPeer,
                        idPeerReceiver: idPeer,
                    },
                }
            );
            console.log("user called");
            console.log(
                "Peer Connection Senders",
                call.peerConnection.getSenders()
            );
            call.on(
                "stream",
                (remoteStream) => {
                    console.log("Remote stream arrived. Stream:", remoteStream);
                    if (!windowState.calls[call.metadata.idPeerReceiver]) {
                        windowState.calls[call.metadata.idPeerReceiver] = call;
                        console.log("Calls updated", windowState.calls);
                        if (
                            !windowState.users.find((user) => {
                                return user == call.metadata.usernameReceiver;
                            })
                        )
                            /* windowState.users.push(
                                call.metadata.usernameReceiver
                            ); */
                            updateUsers(call.metadata.usernameReceiver);
                        windowState.streams[call.metadata.usernameReceiver] =
                            remoteStream;
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
            if (windowState.calls[idPeer]) {
                console.log("User disconnecting. Peer:", idPeer);
                windowState.calls[idPeer].close();
                delete windowState.calls[idPeer];
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
        //window.location.assign(`/error/notAllowedSettings`);
    }
};

const getDevices = async () => {
    try {
        devices = await navigator.mediaDevices.enumerateDevices();
        console.log("devices", devices);

        utilities.updateDeviceSettings(devices);
    } catch (error) {
        console.log("Error on getting devices", error);
    }
};

const sendChatMessage = () => {
    console.log("Want to send message");
    const message = $("#chat-msg").val();
    console.log(message);

    if (message) {
        //clear input val
        $("#chat-msg").val("");

        //emit message
        socket.emit(
            "sendMessage",
            windowState.callId,
            windowState.username,
            message
        );

        //update ui
        utilities.updateChatUi(windowState.username, message);
    }
};

const updateUsers = (username) => {
    //update state
    const userFound = windowState.users.find((user) => {
        return user == username;
    });

    if (!userFound) {
        windowState.users.push(username);

        //update ui
        utilities.updateUserUi(username);
    }
};

const leaveCall = () => {
    //disconnect socket
    socket.disconnect();

    $("#video-grid-container").addClass("hidden");
    $("#utility-sidebar").addClass("hidden");
    $("#footer").addClass("hidden");
    $("#leave-call-container").removeClass("hidden");
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
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="m710-362-58-58q14-23 21-48t7-52h80q0 44-13 83.5T710-362ZM480-594Zm112 112-72-72v-206q0-17-11.5-28.5T480-800q-17 0-28.5 11.5T440-760v126l-80-80v-46q0-50 35-85t85-35q50 0 85 35t35 85v240q0 11-2.5 20t-5.5 18ZM440-120v-123q-104-14-172-93t-68-184h80q0 83 57.5 141.5T480-320q34 0 64.5-10.5T600-360l57 57q-29 23-63.5 39T520-243v123h-80Zm352 64L56-792l56-56 736 736-56 56Z"/></svg>`;
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
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><path d="M880-260 720-420v67l-80-80v-287H353l-80-80h367q33 0 56.5 23.5T720-720v180l160-160v440ZM822-26 26-822l56-56L878-82l-56 56ZM498-575ZM382-464ZM160-800l80 80h-80v480h480v-80l80 80q0 33-23.5 56.5T640-160H160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800Z"/></svg>`;
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

const updateVideoGrid = (stream, username) => {
    console.log("calls:", windowState.calls);

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
    //delete from list of people
    document.querySelector(`#people-list-container #${username}`).remove();
    //delete video
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
                    ${username == windowState.username ? "Tu" : username}
                </p>`;
    videoGrid.appendChild(videoContainer);

    document.getElementById(`${username}-video`).srcObject = stream;
    if (username === windowState.username)
        document.getElementById(`${username}-video`).muted = true;
};

const showChat = () => {
    utilities.showDefaultPeopleButton();

    const btnShowChat = document.getElementById("btn-show-chat");
    btnShowChat.className =
        "transition-all bg-green-800 rounded-full hover:bg-green-700 p-2";
    btnShowChat.innerHTML = `<svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="size-6 fill-black"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                        />
                    </svg>`;

    $("#video-grid-container").removeClass("col-span-2").addClass("col-span-1");
    $("#utility-sidebar")
        .removeClass("hidden translate-x-80 h-0")
        .addClass("translate-x-0");
    $("#chat-container").removeClass("hidden");
    $("#people-container").addClass("hidden");
    $("#btn-send-chat-message").on("click", sendChatMessage);
};

const showpeers = () => {
    utilities.showDefaultChatButton();

    const btnShowPeople = document.getElementById("btn-show-people");
    btnShowPeople.className =
        "transition-all bg-green-800 rounded-full hover:bg-green-700 p-2";
    btnShowPeople.innerHTML = `<svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        class="size-6 fill-black"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                        />
                    </svg>`;

    $("#video-grid-container").removeClass("col-span-2").addClass("col-span-1");
    $("#utility-sidebar")
        .removeClass("hidden translate-x-80 h-0")
        .addClass("translate-x-0");
    $("#people-container").removeClass("hidden");
    $("#chat-container").addClass("hidden");
};

const toggleSettings = () => {
    if (!windowState.callSettings.areSettingsVisible) {
        getDevices();

        $("#dropdown-settings")
            .removeClass("hidden opacity-0")
            .addClass("opacity-100 ease-out duration-300");
        $("#dropdown-settings #modal-panel")
            .removeClass("opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95")
            .addClass("opacity-100 translate-y-0 sm:scale-100");

        windowState.callSettings.areSettingsVisible = true;
    } else {
        $("#dropdown-settings")
            .removeClass("opacity-100 ease-out duration-300")
            .addClass("hidden opacity-0");
        $("#dropdown-settings #modal-panel")
            .removeClass("opacity-100 translate-y-0 sm:scale-100")
            .addClass("opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95");
        windowState.callSettings.areSettingsVisible = false;
    }
};

const closeSidebar = () => {
    console.log("closing");
    utilities.showDefaultChatButton();
    utilities.showDefaultPeopleButton();

    $("#video-grid-container").removeClass("col-span-1").addClass("col-span-2");
    $("#utility-sidebar").addClass("hidden h-0 translate-x-80");
};

$(async () => {
    console.log("Peer id:", windowState.idPeer);
    console.log("call id:", $("#callId").val());

    await createPeer();
    listenToSocketEvents();
    getAndSendStream();
    $("#btn-show-people").on("click", showpeers);
    $("#btn-show-chat").on("click", showChat);
    $(".btn-close-sidebar").on("click", closeSidebar);
    $("#btn-leave-call").on("click", leaveCall);
    $("#btn-settings").on("click", toggleSettings);
    $("#btn-close-modal-settings").on("click", toggleSettings);
});
