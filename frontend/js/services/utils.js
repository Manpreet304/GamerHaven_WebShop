// ----------------------- MESSAGES -----------------------

// Zeigt eine globale Bootstrap-Meldung (Success oder Danger)
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

// ----------------------- API WRAPPER -----------------------

// Wrapper für Ajax-Request mit Erfolgs- & Fehlerbehandlung
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
    data: data ? JSON.stringify(data) : null,
    contentType: "application/json",
    dataType: "json"
  })
    .done(response => {
      if (response.success) {
        if (successMessage) showMessage("success", successMessage);
        onSuccess(response);
      } else {
        handleResponse(response, { errorMessage, onError });
      }
    })
    .fail(xhr => {
      const msg = xhr.responseJSON?.message || "An error occurred!";
      showMessage("danger", msg);
      onError(xhr.responseJSON || {});
    });
}

// ----------------------- RESPONSE HANDLER -----------------------

// Zeigt Fehlernachricht aus der Antwort und ruft optionalen Fehler-Callback auf
function handleResponse(response, { errorMessage = "An error occurred!", onError = () => {} } = {}) {
  const msg = response.data?.error || response.error || response.message || errorMessage;
  showMessage("danger", msg);
  onError(response);
}

// ----------------------- CART COUNT -----------------------

// Holt und zeigt die aktuelle Anzahl der Warenkorb-Artikel
function updateCartCount() {
  $.getJSON("../../backend/api/ApiCart.php?cartCount")
    .done(res => {
      const count = res.success && res.data?.count != null ? parseInt(res.data.count, 10) || 0 : 0;
      $("#cart-count").text(count);
    })
    .fail(() => $("#cart-count").text(0));
}

// ----------------------- GLOBAL EXPORT -----------------------

// Funktionen global verfügbar machen
window.showMessage = showMessage;
window.apiRequest = apiRequest;
window.handleResponse = handleResponse;
window.updateCartCount = updateCartCount;