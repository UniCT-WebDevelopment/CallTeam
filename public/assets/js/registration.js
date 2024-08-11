$(() => {
  $("#btn-submit-signup").on("click", async () => {
    const data = {
      name: $("#signup-form #name").val(),
      surname: $("#signup-form #surname").val(),
      username: $("#signup-form #username").val(),
      password: $("#signup-form #password").val(),
    };

    const response = await fetch("/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const json = await response.json();
      if (json.errors) {
        json.errors.forEach((error) => {
          $(`#signup-form #${error.path}`)
            .removeClass("border-green-900")
            .addClass("border-red-800");

          $(`#signup-form #${error.path}-group`).append(
            $("<div></div>").addClass("mt-2 text-red-600").text(error.msg)
          );
        });
        console.log("Errors", json.errors);
      } else {
        let arr = ["username", "password"];
        arr.forEach((field) => {
          $(`#signup-form #${field}`)
            .removeClass("border-green-900")
            .addClass("border-red-800");

          $(`#signup-form #${field}-group`).append(
            $("<div></div>").addClass("my-2 text-red-600").text(json.msg)
          );
        });
      }
    } else {
      $("#register-container").hide();
      $("#register-feedback").show();
    }
  });
});
