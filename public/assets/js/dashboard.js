$(() => {
    $("#btn-new-call").on("click", async () => {
        const response = await fetch("/api/newCall", {
            method: "POST",
        });

        if (response.redirected) {
            location.assign(response.url);
        }
    });
});
