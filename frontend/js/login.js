$(document).ready(function () {
    // Formular absenden
    $("#loginForm").on("submit", function (e) {
        e.preventDefault();

        // Felder zurücksetzen
        $("#loginForm input").each(function () {
            $(this).removeClass("is-valid is-invalid")[0].setCustomValidity("");
        });

        // Daten sammeln
        const data = {
            identifier: $("#identifier").val(),
            password: $("#password").val(),
            remember: $("#rememberMe").is(":checked")
        };

        // AJAX an das Backend senden
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
                const msg = xhr.responseJSON?.error || "Login failed.";
                handleLoginErrors(msg);
                $("#loginForm").addClass("was-validated");
            }
        });
    });

    // Tooltips aktivieren
    const tooltipList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipList.forEach(el => new bootstrap.Tooltip(el));
});

// Zentrale Fehlerverarbeitung
function handleLoginErrors(msg) {
    if (msg.includes("identifier")) setFieldError("#identifier", msg);
    if (msg.includes("Password")) setFieldError("#password", msg);
}
