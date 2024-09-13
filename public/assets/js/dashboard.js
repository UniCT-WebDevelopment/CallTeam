const socket = io();

let notificationsVisible = false;
let currentRequestId = 0;

const addErrorFeedback = (errorMsg) => {
    //const container = document.getElementById("existing-call-group");
    const container = document.getElementById("btn-participate-call");
    const error = document.createElement("div");
    error.setAttribute("id", "error");
    error.className = "absolute top-10 -left-60 my-2 text-red-600";
    error.innerHTML = errorMsg;
    container.appendChild(error);

    $("#callId").removeClass("border-gray-700").addClass("border-red-700");
};

const getNewCall = async () => {
    const response = await fetch("/api/newCall", {
        method: "POST",
    });

    if (response.redirected) {
        location.assign(response.url);
    }
};

const getExistingCall = async () => {
    console.log("clicking");
    $("#btn-participate-call loading-call-spin").removeClass("hidden");

    const previousErrors = document.querySelectorAll("#error");
    previousErrors.forEach((error) => error.remove());
    $("#callId").removeClass("border-red-700").addClass("border-gray-700");
    const callId = $("#callId").val();

    if (callId) {
        const response = await fetch(`/api/getCall?callId=${callId}`);

        if (response.ok) window.location.assign(`/call/${callId}`);
        else {
            console.log("request not good", response.status);
            $("#btn-participate-call loading-call-spin").addClass("hidden");
            const json = await response.json();
            addErrorFeedback(json.error);
        }
    } else {
        addErrorFeedback("You have to insert a Call ID");
    }
};

const acceptInvitation = async (event) => {
    const listElement = event.target.parentElement;
    const requestId = listElement.getAttribute("id");
    const senderUsername = document.getElementById(
        `sender-username-${requestId}`
    ).value;
    const callId = document.getElementById(`call-id-${requestId}`).value;

    listElement.remove();
    socket.emit(
        "acceptedInvitation",
        senderUsername,
        $("#username").val(),
        callId
    );

    if (callId) {
        const response = await fetch(`/api/getCall?callId=${callId}`);

        if (response.ok) window.location.assign(`/call/${callId}`);
        else {
            console.log("request not good", response.status);
        }
    } else {
        console.log("Call ID not valid");
    }
};

const toggleNotifications = () => {
    if (notificationsVisible) {
        $("#notify-container").addClass("hidden");
        notificationsVisible = false;
    } else {
        $("#notify-container").removeClass("hidden");
        notificationsVisible = true;
    }
};

const addNotificationToList = (request, container) => {
    const li = document.createElement("li");
    const requestId = currentRequestId;
    li.setAttribute("id", requestId);
    li.className = "py-2 px-1 flex justify-between items-center";
    li.innerHTML = `<span class="text-sm text-wrap max-w-36"
                                    >${request.sender} ti ha invitato ad una
                                    chiamata</span
                                >
                                <input type="hidden" id="sender-username-${requestId}" value="${request.sender}"/>
                                <input type="hidden" id="call-id-${requestId}" value="${request.callId}"/>
                                <div
                                    class="accept-invitation-${requestId} bg-green-900 font-medium hover:bg-green-800 rounded-lg p-2"
                                >
                                    Accetta
                                </div>`;

    container.appendChild(li);
    document
        .querySelector(`.accept-invitation-${requestId}`)
        .addEventListener("click", acceptInvitation);
    currentRequestId++;
};

const handleSocket = () => {
    const usernameElement = document.getElementById("username");
    const username = document.getElementById("username").value;
    console.log("username element", usernameElement);
    console.log("username", username);
    socket.emit("joinNotifyRoom", username);
    console.log("emitted event join");
    socket.on("newRequest", (data) => {
        console.log("New request", data.usernameSender, data.callId);
        const containerListNotifications =
            document.getElementById("list-notifications");
        addNotificationToList(
            { sender: data.usernameSender, callId: data.callId },
            containerListNotifications
        );
    });
};

const loadNotifications = async () => {
    console.log("Loading notifications");

    const userId = $("#userId").val();
    const response = await fetch(`/api/getRequests?userId=${userId}`);
    const json = await response.json();

    if (response.ok) {
        console.log("requests", json.requests);
        const containerListNotifications =
            document.getElementById("list-notifications");
        json.requests.forEach((request) => {
            addNotificationToList(request, containerListNotifications);
        });
    }
};

const handleLogout = async () => {
    const response = await fetch("/auth/logout", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
    });

    if (response.redirected) {
        location.assign(response.url);
    } else {
        const json = await response.json();
        document.body.children.forEach((child) => child.remove());
        const error = document.createElement("div");
        error.className = "text-center font-bold text-lg";
        error.innerHTML = `Something went wrong`;
        const errorSpecifics = document.createElement("div");
        errorSpecifics.className = "text-center font-medium text-sm";
        errorSpecifics.innerHTML = `Error: ${json.error}`;

        document.body.appendChild(error);
        document.body.appendChild(errorSpecifics);
    }
};

$(async () => {
    await loadNotifications();
    console.log("handling socket");
    handleSocket();
    $("#btn-new-call").on("click", getNewCall);
    $("#btn-participate-call").on("click", getExistingCall);
    $("#notify-button").on("click", toggleNotifications);
    $("#logout-button").on("click", handleLogout);
});
