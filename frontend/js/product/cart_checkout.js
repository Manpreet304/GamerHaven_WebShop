(function(window, $) {
  'use strict';

  // [1] DOM-Elemente für das Formular
  const checkoutForm        = $('#checkout-form');
  const paymentMethodSelect = $('#paymentMethod');
  const voucherInput        = $('#voucher');

  // [2] Event beim Laden des Dokuments
  document.addEventListener('DOMContentLoaded', bindCheckoutEvents);

  // [3] Formular-Submit binden
  function bindCheckoutEvents() {
    checkoutForm.on('submit', onSubmitCheckout);
  }

  // [4] Modal öffnen, Warenkorb + Zahlungsmethoden laden
  function onProceedToCheckout() {
    if ($('#proceedToCheckout').prop('disabled')) return;

    $('#checkoutModal').modal('show'); // Modal öffnen

    window.CartMain.loadCart(renderCheckoutSummary); // Warenkorb im Modal anzeigen
    loadPaymentMethods();                            // Zahlungsmethoden laden
  }

  // [5] Warenkorb-Zusammenfassung anzeigen
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
      $(clone).find('.item-details').text(`Quantity: ${item.quantity} × €${item.price.toFixed(2)}`);
      $(clone).find('.item-subtotal').text(`€${lineSubtotal.toFixed(2)}`);
      list.append(clone);
    });

    updatePriceDisplay(subtotal, shipping, total);
  }

  // [6] Preisfelder im Modal setzen
  function updatePriceDisplay(sub, ship, total) {
    $('#checkout-subtotal').text(`€${sub.toFixed(2)}`);
    $('#checkout-shipping').text(ship === 0 ? 'Free' : `€${ship.toFixed(2)}`);
    $('#checkout-total').text(`€${total.toFixed(2)}`);
  }

  // [7] Zahlungsmethoden vom Server holen
  function loadPaymentMethods() {
    apiRequest({
      url: '../../backend/api/ApiGuest.php?me',
      onSuccess: data => {
        const payments = Array.isArray(data?.payments) ? data.payments : [];
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
      },
      onError: err => {
        handleResponse(err, {
          errorMessage: 'Could not load payment methods.'
        });
      }
    });
  }

  // [8] Bestellung absenden
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
        const orderId = res.orderId;
        window.open(`../../backend/invoices/Invoice.php?orderId=${orderId}`, '_blank');
        setTimeout(() => window.location.href = 'homepage.html', 3000);
      },
      onError: err => {
        handleResponse(err, {
          errorMessage: err?.message || 'Order could not be completed.'
        });
      }
    });
  }

  // [9] Funktion global verfügbar machen
  window.onProceedToCheckout = onProceedToCheckout;

})(window, jQuery);
