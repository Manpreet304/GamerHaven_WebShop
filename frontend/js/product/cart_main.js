(function(window, $) {
  'use strict';

  // [1] DOM-Elemente vorbereiten
  const cartTableBody      = $('#cart-items');
  const shippingPriceLabel = $('#shipping-price');
  const totalPriceLabel    = $('#total-price');
  const checkoutButton     = $('#proceedToCheckout');

  // [2] Starte alles beim Laden der Seite
  $(function() {
    loadCart();           // Warenkorb-Daten vom Server holen
    updateCartCount();    // Artikelzähler oben im Menü (z. B. Badge)
    initTooltips();       // Bootstrap-Tooltips aktivieren
    bindCartEvents();     // Klick-Events und Mengenänderungen binden
  });

  // [3] Tooltips aktivieren
  function initTooltips() {
    $('[data-bs-toggle="tooltip"]').each((_, el) => new bootstrap.Tooltip(el));
  }

  // [4] Event-Handler verbinden
  function bindCartEvents() {
    checkoutButton.on('click', onProceedToCheckout);               // Checkout starten
    $(document).on('change', '.quantity-input', onQuantityChange); // Menge ändern
    $(document).on('click', '.delete-item', onDeleteItem);         // Artikel löschen
  }

  // [5] Warenkorb vom Server abrufen
  function loadCart(callback) {
    apiRequest({
      url: '../../backend/api/ApiCart.php',
      onSuccess: data => {
        renderCart(data); // HTML aktualisieren
        if (typeof callback === 'function') callback(data); // für externen Aufruf
      },
      onError: err => handleResponse(err, {
        errorMessage: "Could not load cart."
      })
    });
  }

  // [6] Warenkorb im HTML anzeigen
  function renderCart(data) {
    const items = data.items || [];
    const shipping = data.shipping || 0;
    const total = data.total || 0;

    cartTableBody.empty(); // leere die Tabelle

    if (!items.length) {
      // Wenn der Warenkorb leer ist
      cartTableBody.append('<tr><td colspan="5">Your cart is currently empty.</td></tr>');
      shippingPriceLabel.text('€0.00');
      totalPriceLabel.text('€0.00');
      checkoutButton.prop('disabled', true); // Button deaktivieren
      return;
    }

    checkoutButton.prop('disabled', false); // Button aktivieren

    const template = document.getElementById('cart-item-template');
    items.forEach(item => {
      const row = $(template.content.cloneNode(true)).find('tr');
      row.attr('data-id', item.id);
      row.find('.cart-name').text(item.name);
      row.find('.cart-price').text(`€${item.price.toFixed(2)}`);
      row.find('.cart-subtotal').text(`€${(item.price * item.quantity).toFixed(2)}`);
      row.find('.quantity-input').val(item.quantity);
      cartTableBody.append(row);
    });

    shippingPriceLabel.text(shipping === 0 ? 'Free' : `€${shipping.toFixed(2)}`);
    totalPriceLabel.text(`€${total.toFixed(2)}`);
  }

  // [7] Menge im Warenkorb ändern
  function onQuantityChange() {
    const row = $(this).closest('tr');
    const cartId = row.data('id');
    const qty = Math.max(1, parseInt($(this).val(), 10)); // Minimum: 1

    apiRequest({
      url: '../../backend/api/ApiCart.php',
      method: 'POST',
      data: { action: 'update', id: cartId, quantity: qty },
      onSuccess: () => {
        loadCart();           // Warenkorb neu laden
        updateCartCount();    // Artikelzähler aktualisieren
      },
      onError: err => handleResponse(err, {
        errorMessage: err?.message || "Could not update quantity."
      })
    });
  }

  // [8] Artikel aus dem Warenkorb löschen
  function onDeleteItem() {
    const cartId = $(this).closest('tr').data('id');

    apiRequest({
      url: '../../backend/api/ApiCart.php',
      method: 'POST',
      data: { action: 'delete', id: cartId },
      onSuccess: () => {
        loadCart();           // Warenkorb neu laden
        updateCartCount();    // Artikelzähler aktualisieren
      },
      onError: err => handleResponse(err, {
        errorMessage: err?.message || "Could not remove item."
      })
    });
  }

  // [9] Funktion öffentlich machen für andere Module (z. B. Checkout)
  window.CartMain = { loadCart };

})(window, jQuery);
