// Zeigt Bootstrap-Alert
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

  setTimeout(() => container.fadeOut(() => container.empty()), 5000);
}

// Universeller Ajax-Wrapper
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
        onSuccess(response.data); // Nur die Daten übergeben
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

// Fehler verarbeiten (Backend-Fehler)
function handleResponse(response, {
  errorMessage = "An error occurred!",
  onError = () => {}
} = {}) {
  const msg = response?.message || response?.data?.error || response?.error || errorMessage;
  showMessage("danger", msg);
  onError(response);
}

// Aktuelle Cart-Anzahl laden
function updateCartCount() {
  $.getJSON("../../backend/api/ApiCart.php?cartCount")
    .done(res => {
      const count = res.success && res.data?.count != null ? parseInt(res.data.count, 10) || 0 : 0;
      $("#cart-count").text(count);
    })
    .fail(() => $("#cart-count").text(0));
}

// Global exportieren
window.showMessage = showMessage;
window.apiRequest = apiRequest;
window.handleResponse = handleResponse;
window.updateCartCount = updateCartCount;
