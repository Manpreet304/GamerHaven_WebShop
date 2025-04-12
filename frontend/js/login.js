$(document).ready(function () {
    $("#loginForm").on("submit", function (e) {
        e.preventDefault();

        $("#loginForm input").each(function () {
            $(this).removeClass("is-valid is-invalid")[0].setCustomValidity("");
        });

        const data = {
            identifier: $("#identifier").val(),
            password: $("#password").val(),
            remember: $("#rememberMe").is(":checked")
        };

        const form = document.getElementById("loginForm");
        if (!form.checkValidity()) {
            form.classList.add("was-validated");
            return;
        }

        $.ajax({
            url: "/GamerHaven_WebShop/backend/api/api_guest.php?login",
            method: "POST",
            dataType: "json",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function () {
                showMessage("success", "Login successful! Redirecting...");
                setTimeout(() => {
                    window.location.href = "../website/homepage.html";
                }, 2000);
            },
            error: function (xhr) {
                const msg = xhr.responseJSON?.errors || { general: "Login failed." };

                if (msg.general) showMessage("danger", msg.general);
                applyFieldErrors(msg);

                $("#loginForm").addClass("was-validated");
            }
        });
    });

    const tooltipList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipList.forEach(el => new bootstrap.Tooltip(el));
});
