
(function(window, $) {
  'use strict';

  const checkoutForm        = $('#checkout-form');
  const paymentMethodSelect = $('#paymentMethod');
  const voucherInput        = $('#voucher');

  // Events beim Laden binden
  function bindCheckoutEvents() {
    checkoutForm.on('submit', onSubmitCheckout);
  }

  // Modal öffnen und Daten laden
  function onProceedToCheckout() {
    if ($('#proceedToCheckout').prop('disabled')) return;
    $('#checkoutModal').modal('show');
    window.CartMain.loadCart(renderCheckoutSummary);
    loadPaymentMethods();
  }

  // Checkout absenden
  function onSubmitCheckout(e) {
    e.preventDefault();
    const formEl = e.currentTarget;
    formEl.classList.remove('was-validated');

    if (!formEl.checkValidity()) {
      formEl.classList.add('was-validated');
      return;
    }

    const paymentId = parseInt(paymentMethodSelect.val(), 10);
    if (!paymentId) {
      showMessage("danger", "Please choose a payment method.");
      return;
    }

    const voucher = voucherInput.val().trim() || null;

    apiRequest({
      url: '../../backend/api/ApiOrder.php',
      method: 'POST',
      data: { payment_id: paymentId, voucher },
      successMessage: 'Your order was successfully placed! Invoice opens in new tab.',
      onSuccess: res => {
        const orderId = res.data?.orderId;
        window.open(`../../backend/invoices/Invoice.php?orderId=${orderId}`, '_blank');
        setTimeout(() => window.location.href = 'homepage.html', 3000);
      },
      errorMessage: 'Order could not be completed.'
    });
  }

  // Zusammenfassung im Checkout anzeigen
  function renderCheckoutSummary(data) {
    const items = data.items || [];
    const subtotal = data.subtotal || 0;
    const shipping = data.shipping || 0;
    const total = data.total || 0;

    const list = $('#checkout-cart-items').empty();
    const tpl = document.getElementById('checkout-item-template');

    items.forEach(item => {
      const lineSubtotal = item.price * item.quantity;
      const clone = tpl.content.cloneNode(true);
      $(clone).find('.item-name').text(item.name);
      $(clone).find('.item-details').text(
        `Quantity: ${item.quantity} × €${item.price.toFixed(2)}`
      );
      $(clone).find('.item-subtotal').text(`€${lineSubtotal.toFixed(2)}`);
      list.append(clone);
    });

    updatePriceDisplay(subtotal, shipping, total);
  }

  // Preisfelder im Modal setzen
  function updatePriceDisplay(sub, ship, total) {
    $('#checkout-subtotal').text(`€${sub.toFixed(2)}`);
    $('#checkout-shipping').text(ship === 0 ? 'Free' : `€${ship.toFixed(2)}`);
    $('#checkout-total').text(`€${total.toFixed(2)}`);
  }

  // Zahlungsmethoden vom Server laden
  function loadPaymentMethods() {
    apiRequest({
      url: '../../backend/api/ApiGuest.php?me',
      onSuccess: res => {
        const payments = Array.isArray(res.data?.payments) ? res.data.payments : [];
        const select = paymentMethodSelect.empty()
          .append('<option value="">Choose payment method</option>');

        if (!payments.length) {
          select.append('<option disabled>No payment methods found</option>');
          return;
        }

        payments.forEach(p => {
          let label = p.method;
          if (p.method === 'Credit Card')   label += ` (****${p.last_digits})`;
          if (p.method === 'PayPal')        label += ` (${p.paypal_email})`;
          if (p.method === 'Bank Transfer') label += ` (IBAN ****${p.iban.slice(-4)})`;
          select.append(`<option value="${p.id}">${label}</option>`);
        });
      }
    });
  }

  // Initialisierung bei DOM ready
  document.addEventListener('DOMContentLoaded', bindCheckoutEvents);
  window.onProceedToCheckout = onProceedToCheckout;

})(window, jQuery);