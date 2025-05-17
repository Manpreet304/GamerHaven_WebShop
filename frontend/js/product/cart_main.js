
(function(window, $) {
  'use strict';

  const cartTableBody      = $('#cart-items');
  const shippingPriceLabel = $('#shipping-price');
  const totalPriceLabel    = $('#total-price');
  const checkoutButton     = $('#proceedToCheckout');
  const checkoutModal      = $('#checkoutModal');

  // Start beim Seitenladen
  $(function() {
    loadCart();
    updateCartCount();
    initTooltips();
    bindCartEvents();
  });

  // Tooltips aktivieren
  function initTooltips() {
    $('[data-bs-toggle="tooltip"]').each((_, el) => new bootstrap.Tooltip(el));
  }

  // Event-Listener für Warenkorbaktionen
  function bindCartEvents() {
    checkoutButton.on('click', onProceedToCheckout);
    $(document).on('change', '.quantity-input', onQuantityChange);
    $(document).on('click', '.delete-item', onDeleteItem);
  }

  // Warenkorb laden & rendern
  function loadCart(callback) {
    apiRequest({
      url: '../../backend/api/ApiCart.php',
      onSuccess: res => {
        const data = res.data || {};
        renderCart(data);
        if (typeof callback === 'function') callback(data);
      }
    });
  }

  // Warenkorb-Darstellung erzeugen
  function renderCart(data) {
    const items = data.items || [];
    const shipping = data.shipping || 0;
    const total = data.total || 0;

    cartTableBody.empty();

    if (!items.length) {
      cartTableBody.append('<tr><td colspan="5">Your cart is currently empty.</td></tr>');
      shippingPriceLabel.text('€0.00');
      totalPriceLabel.text('€0.00');
      checkoutButton.prop('disabled', true);
      return;
    }

    checkoutButton.prop('disabled', false);

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

  // Menge im Warenkorb ändern
  function onQuantityChange() {
    const row = $(this).closest('tr');
    const cartId = row.data('id');
    const qty = Math.max(1, parseInt($(this).val(), 10));

    apiRequest({
      url: '../../backend/api/ApiCart.php',
      method: 'POST',
      data: { action: 'update', id: cartId, quantity: qty },
      onSuccess: () => {
        loadCart();
        updateCartCount();
      }
    });
  }

  // Produkt aus Warenkorb entfernen
  function onDeleteItem() {
    const cartId = $(this).closest('tr').data('id');
    apiRequest({
      url: '../../backend/api/ApiCart.php',
      method: 'POST',
      data: { action: 'delete', id: cartId },
      onSuccess: () => {
        loadCart();
        updateCartCount();
      }
    });
  }


  // Modul global verfügbar machen
  window.CartMain = { loadCart };

})(window, jQuery);