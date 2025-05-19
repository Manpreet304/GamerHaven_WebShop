/**
 * js/account/account_render.js
 * Verantwortlich für Darstellen von Account-Daten, Zahlungen und Bestellungen
 */
(function(window, $) {
  'use strict';

  const AccountRender = {
    // Nutzerinfo anzeigen
    renderAccountInfo(user) {
      $('#account-info').html(`
        <p><strong>Name:</strong> ${user.first_name} ${user.last_name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Address:</strong> ${user.address}, ${user.zip_code} ${user.city}, ${user.country}</p>
      `);
    },

    // Zahlungsmethoden anzeigen
    renderPaymentMethods(payments) {
      const container = $('#payment-methods').empty();
      if (!payments.length) {
        container.html('<p>No payment methods found.</p>');
        return;
      }
      payments.forEach(p => {
        let extra = '';
        if (p.method === 'Credit Card')  extra = `<p><strong>Card:</strong> ****${p.last_digits}</p>`;
        else if (p.method === 'PayPal')   extra = `<p><strong>PayPal Email:</strong> ${p.paypal_email}</p>`;
        else                               extra = `<p><strong>IBAN:</strong> ****${p.iban.slice(-4)}</p>`;
        container.append(`
          <div class="mb-3">
            <p><strong>Method:</strong> ${p.method}</p>
            ${extra}
          </div>
        `);
      });
    },

    // Bestellübersicht anzeigen
    renderOrders(orders) {
      const c = $('#order-list').empty();
      if (!orders.length) {
        c.html('<p>You have no orders.</p>');
        return;
      }
      orders.forEach(o => {
        c.append(`
          <div class="border rounded p-3 mb-3 bg-light">
            <h6>Order #${o.id} - <small>${o.created_at}</small></h6>
            <p><strong>Total:</strong> €${o.total_amount}</p>
            <button class="btn btn-info btn-sm me-2" onclick="viewOrderDetails(${o.id})">
              <i class="bi bi-eye"></i> View Details
            </button>
            <button class="btn btn-primary btn-sm" onclick="downloadInvoice(${o.id})">
              <i class="bi bi-printer"></i> Download Invoice
            </button>
          </div>
        `);
      });
    },

    // Bestelldetails im Modal anzeigen
    showOrderDetailsModal(res) {
      $('#modal-order-id').text(res.order.id);
      $('#modal-order-date').text(res.order.created_at);
      $('#modal-subtotal').text(`€${res.order.subtotal}`);
      $('#modal-discount').text(`€${res.order.discount}`);
      $('#modal-shipping').text(`€${res.order.shipping_amount}`);
      $('#modal-total').text(`€${res.order.total_amount}`);
      const body = $('#modal-items-body').empty();
      res.items.forEach(item => {
        body.append(`
          <tr class="text-end">
            <td class="text-start">${item.name_snapshot}</td>
            <td>€${item.price_snapshot}</td>
            <td>${item.quantity}</td>
            <td>€${item.total_price}</td>
          </tr>
        `);
      });
      new bootstrap.Modal('#orderDetailsModal').show();
    }
  };

  // Globale Bereitstellung
  window.AccountRender = AccountRender;

})(window, jQuery);