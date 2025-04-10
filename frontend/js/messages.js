// Zeigt eine Bootstrap-Alert-Nachricht im Zielcontainer
function showMessage(type, text, target = "#messageBox") {
    const alertClass = type === "success" ? "alert-success" : "alert-danger";
    const message = `
        <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
            ${text}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`;

    $(target).html(message);

    setTimeout(() => {
        $(target + " .alert").alert("close");
    }, 5000);
}

// Setzt ein Feld in den Fehlerzustand mit Fehlermeldung
function setFieldError(selector, message) {
    const $field = $(selector);
    $field.addClass("is-invalid").removeClass("is-valid");
    $field[0].setCustomValidity("Invalid");

    // Wenn eine .invalid-feedback direkt danach vorhanden ist, fülle sie
    const $feedback = $(`${selector} + .invalid-feedback`);
    if ($feedback.length > 0) {
        $feedback.text(message);
    }
}

// Markiert ein Feld als gültig (z. B. nach erfolgreicher Eingabe)
function setFieldValid(selector) {
    const $field = $(selector);
    $field.removeClass("is-invalid").addClass("is-valid");
    $field[0].setCustomValidity("");
}
