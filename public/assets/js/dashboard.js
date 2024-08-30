const addErrorFeedback = (errorMsg) => {
    const container = document.getElementById("existing-call-group");
    const error = document.createElement("div");
    error.setAttribute("id", "error");
    error.className = "my-2 text-red-600";
    error.innerHTML = errorMsg;
    container.appendChild(error);

    $("#callId").removeClass("border-gray-700").addClass("border-red-700");
};

const getNewCall = async () => {
    $("#btn-new-call").addClass("animate-spin");
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

$(() => {
    $("#btn-new-call").on("click", getNewCall);
    $("#btn-participate-call").on("click", getExistingCall);
    $("#logout-button").on("click", handleLogout);
});
