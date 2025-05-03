/**
 * js/cart.js
 * Verantwortlich für Laden, Anzeigen und Verwalten des Warenkorbs sowie Checkout
 */
(function(window, $) {
  'use strict';

  // --- Selektoren ---
  const cartTableBody       = $('#cart-items');
  const shippingPriceLabel  = $('#shipping-price');
  const totalPriceLabel     = $('#total-price');
  const checkoutButton      = $('#proceedToCheckout');
  const checkoutModal       = $('#checkoutModal');
  const checkoutForm        = $('#checkout-form');
  const paymentMethodSelect = $('#paymentMethod');
  const voucherInput        = $('#voucher');

  // --- Initialisierung (Document Ready) ---
  $(function() {
    loadCart();
    updateCartCount();
    initTooltips();
    bindEvents();
  });

  // --- Tooltips aktivieren ---
  function initTooltips() {
    $('[data-bs-toggle="tooltip"]').each((_, el) =>
      new bootstrap.Tooltip(el)
    );
  }

  // --- Ereignisse binden ---
  function bindEvents() {
    // Zum Checkout-Modal wechseln
    checkoutButton.on('click', onProceedToCheckout);

    // Checkout-Formular absenden
    checkoutForm.on('submit', onSubmitCheckout);

    // Menge im Warenkorb ändern
    $(document).on('change', '.quantity-input', onQuantityChange);

    // Artikel aus Warenkorb löschen
    $(document).on('click', '.delete-item', onDeleteItem);
  }

  // --- Event-Handler ---
  function onProceedToCheckout(e) {
    if (checkoutButton.prop('disabled')) return;
    checkoutModal.modal('show');
    loadCheckoutSummary();
    loadPaymentMethods();
  }

  function onSubmitCheckout(e) {
    e.preventDefault();
    const formEl = this;
    formEl.classList.remove('was-validated');

    if (!formEl.checkValidity()) {
      formEl.classList.add('was-validated');
      return;
    }

    const paymentId = parseInt(paymentMethodSelect.val(), 10);
    const voucher   = voucherInput.val().trim() || null;

    apiRequest({
      url: '../../backend/api/ApiOrder.php',
      method: 'POST',
      data: { payment_id: paymentId, voucher },
      successMessage: 'Your order was successfully placed! Invoice opens in new tab.',
      onSuccess: res => {
        const orderId = res.data?.body?.orderId || res.data?.orderId;
        window.open(`../../backend/invoices/Invoice.php?orderId=${orderId}`, '_blank');
        setTimeout(() => window.location.href = 'homepage.html', 3000);
      },
      errorMessage: 'Order could not be completed.'
    });
  }

  function onQuantityChange() {
    const row      = $(this).closest('tr');
    const cartId   = row.data('id');
    let quantity   = parseInt($(this).val(), 10);
    if (quantity < 1) return;

    apiRequest({
      url: '../../backend/api/ApiCart.php',
      method: 'POST',
      data: { action: 'update', id: cartId, quantity },
      onSuccess: () => {
        loadCart();
        updateCartCount();
      }
    });
  }

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

  // --- View-Funktionen ---
  function loadCart() {
    apiRequest({
      url: '../../backend/api/ApiCart.php',
      onSuccess: resp => {
        const body     = resp.data?.body || {};
        const items    = body.items || [];
        const shipping = body.shipping || 0;
        const total    = body.total || 0;

        cartTableBody.empty();
        if (!items.length) {
          cartTableBody.append(
            '<tr><td colspan="5">Your cart is currently empty. Add at least one product to proceed.</td></tr>'
          );
          shippingPriceLabel.text('€0.00');
          totalPriceLabel.text('€0.00');
          checkoutButton.prop('disabled', true);
          return;
        }

        checkoutButton.prop('disabled', false);
        items.forEach(item => {
          const clone = document.getElementById('cart-item-template').content.cloneNode(true);
          const row   = $(clone).find('tr');
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
    });
  }

  function loadCheckoutSummary() {
    apiRequest({
      url: '../../backend/api/ApiCart.php',
      onSuccess: resp => {
        const body     = resp.data?.body || {};
        const items    = body.items || [];
        const subtotal = body.subtotal || 0;
        const shipping = body.shipping || 0;
        const total    = body.total || 0;

        const list = $('#checkout-cart-items').empty();
        const tpl  = document.getElementById('checkout-item-template');
        items.forEach(item => {
          const lineSubtotal = item.price * item.quantity;
          const clone        = tpl.content.cloneNode(true);
          $(clone).find('.item-name').text(item.name);
          $(clone).find('.item-details').text(
            `Quantity: ${item.quantity} × €${item.price.toFixed(2)}`
          );
          $(clone).find('.item-subtotal').text(`€${lineSubtotal.toFixed(2)}`);
          list.append(clone);
        });
        updatePriceDisplay(subtotal, shipping, total);
      }
    });
  }

  function loadPaymentMethods() {
    apiRequest({
      url: '../../backend/api/ApiGuest.php?me',
      onSuccess: resp => {
        const user     = resp.data?.body || resp.data || {};
        const select   = paymentMethodSelect.empty()
                            .append('<option value="">Choose payment method</option>');
        const payments = Array.isArray(user.payments) ? user.payments : [];
        if (payments.length) {
          payments.forEach(p => {
            let label = p.method;
            if (p.method === 'Credit Card')  label += ` (****${p.last_digits})`;
            if (p.method === 'PayPal')       label += ` (${p.paypal_email})`;
            if (p.method === 'Bank Transfer') label += ` (IBAN ****${p.iban.slice(-4)})`;
            select.append(`<option value="${p.id}">${label}</option>`);
          });
        } else {
          select.append('<option disabled>No payment methods found</option>');
        }
      }
    });
  }

  function updatePriceDisplay(sub, ship, total) {
    $('#checkout-subtotal').text(`€${sub.toFixed(2)}`);
    $('#checkout-shipping').text(ship === 0 ? 'Free' : `€${ship.toFixed(2)}`);
    $('#checkout-total').text(`€${total.toFixed(2)}`);
  }

})(window, jQuery);
