const getNewCall = async () => {
    const response = await fetch("/api/newCall", {
        method: "POST",
    });

    if (response.redirected) {
        location.assign(response.url);
    }
};

const getExistingCall = () => {
    const callId = $("#callId").val();

    if (callId) {
        window.location.assign(`/call/${callId}`);
    } else {
        const container = document.getElementById("existing-call-group");
        const error = document.createElement("div");
        error.className = "my-2 text-red-600";
        error.innerHTML = "Riunione inesistente";
        container.appendChild(error);

        $("#callId").removeClass("border-gray-700").addClass("border-red-700");
    }
};

$(() => {
    $("#btn-new-call").on("click", getNewCall);
    $("#btn-participate-call").on("click", getExistingCall);
});
