$(() => {
    $("#btn-submit-signup").on("click", async () => {
        const data = {
            username: $("#signup-form > #username").val(),
            password: $("#signup-form > #password").val()
        }

        const response = await fetch("/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            console.log("Error");
        } else {
            console.log(response.type);
            if (response.redirected) {
                location.assign(response.url);
            }
        }
    })
})