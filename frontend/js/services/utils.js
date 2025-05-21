// Zeigt eine Bootstrap-Alert-Nachricht an
function showMessage(type, text) {
  const alertClass = type === "success" ? "alert-success" : "alert-danger";
  const html = `
    <div class="alert ${alertClass} alert-dismissible fade show" role="alert">
      ${text}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `;

  const container = $('#globalMessageOverlay');
  container.stop(true, true).hide().html(html).fadeIn();

  // Blendet die Nachricht nach 5 Sekunden automatisch wieder aus
  setTimeout(() => container.fadeOut(() => container.empty()), 5000);
}

// Führt eine Ajax-Anfrage aus und behandelt Erfolg und Fehler zentral
function apiRequest({
  url,
  method = "GET",
  data = null,
  headers = {},
  successMessage = null,
  errorMessage = null,
  onSuccess = () => {},
  onError = () => {}
}) {
  $.ajax({
    url,
    method,
    data: method === 'GET' ? data : JSON.stringify(data),
    contentType: "application/json",
    dataType: "json",
    headers
  })
    .done(response => {
      if (response.success) {
        if (successMessage) showMessage("success", successMessage);
        onSuccess(response.data);
      } else {
        handleResponse(response, { errorMessage, onError });
      }
    })
    .fail(xhr => {
      const response = xhr.responseJSON || {};
      const msg = response.message || "An error occurred!";
      showMessage("danger", msg);
      onError(response);
    });
}

// Behandelt Fehlermeldungen zentral
function handleResponse(response, {
  errorMessage = "An error occurred!",
  onError = () => {}
} = {}) {
  const msg = response?.message || response?.data?.error || response?.error || errorMessage;
  showMessage("danger", msg);
  onError(response);
}

// Ruft die aktuelle Anzahl an Artikeln im Warenkorb ab
function updateCartCount() {
  $.getJSON("../../backend/api/ApiCart.php?cartCount")
    .done(res => {
      const count = res.success && res.data?.count != null ? parseInt(res.data.count, 10) || 0 : 0;
      $("#cart-count").text(count);
    })
    .fail(() => $("#cart-count").text(0));
}

// Globale Verfügbarkeit der Funktionen im window-Objekt
window.showMessage = showMessage;
window.apiRequest = apiRequest;
window.handleResponse = handleResponse;
window.updateCartCount = updateCartCount;
