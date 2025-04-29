function initAccountOrders() {
  loadOrders();
}

// Orders laden
function loadOrders() {
  $.get("../../backend/api/ApiOrder.php?orders")
    .done(function (orders) {
      const container = $("#order-list").empty();
      if (!orders.length) {
        return container.html("<p>You have no orders yet.</p>");
      }

      orders.forEach(function (order) {
        container.append(`
          <div class="border rounded p-3 mb-3 bg-light">
            <h6>Order #${order.id} - <small>${order.created_at}</small></h6>
            <p><strong>Total:</strong> €${order.total_amount}</p>
            <button class="btn btn-info btn-sm me-2" onclick="viewOrderDetails(${order.id})">
              <i class="bi bi-eye"></i> View Details
            </button>
            <button class="btn btn-primary btn-sm" onclick="downloadInvoice(${order.id})">
              <i class="bi bi-printer"></i> Download Invoice
            </button>
          </div>
        `);
      });
    })
    .fail(function (xhr) {
      handleResponse(xhr.responseJSON || {}, { errorMessage: "Failed to load orders." });
    });
}

// Details anzeigen
function viewOrderDetails(orderId) {
  $.get(`../../backend/api/ApiOrder.php?orderDetails&orderId=${orderId}`)
    .done(function (res) {
      $("#modal-order-id").text(res.order.id);
      $("#modal-order-date").text(res.order.created_at);
      $("#modal-subtotal").text(res.order.subtotal);
      $("#modal-discount").text(res.order.discount);
      $("#modal-shipping").text(res.order.shipping_amount);
      $("#modal-total").text(res.order.total_amount);

      const tbody = $("#modal-items-body").empty();
      res.items.forEach(function (item) {
        tbody.append(`
          <tr>
            <td>${item.name_snapshot}</td>
            <td>€${item.price_snapshot}</td>
            <td>${item.quantity}</td>
            <td>€${item.total_price}</td>
          </tr>
        `);
      });

      new bootstrap.Modal(document.getElementById("orderDetailsModal")).show();
    })
    .fail(function (xhr) {
      handleResponse(xhr.responseJSON || {}, { errorMessage: "Failed to load order details." });
    });
}

// Rechnung downloaden
function downloadInvoice(orderId) {
  window.open(`../../backend/invoices/Invoice.php?orderId=${orderId}`, "_blank");
}
