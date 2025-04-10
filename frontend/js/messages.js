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
