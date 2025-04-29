// /admin/orders.js

let ordersCache = {};

$(document).ready(function () {
  loadOrderCustomers();
  bindOrderEvents();
});

/** ------------------- KUNDEN LADEN (für Auswahl) ------------------- **/

function loadOrderCustomers() {
  $.get("../../backend/api/ApiAdmin.php?listCustomers")
    .done(function (users) {
      const select = $("#orderCustomerSelect").empty().append('<option value="">Select a customer…</option>');

      users.forEach(function (user) {
        select.append(`<option value="${user.id}">${user.firstname} ${user.lastname}</option>`);
      });
    })
    .fail(function (xhr) {
      handleResponse(xhr.responseJSON || {}, { errorMessage: "Failed to load customer list." });
    });
}

/** ------------------- BESTELLUNGEN EINES KUNDEN LADEN ------------------- **/

function loadOrdersByCustomer(customerId) {
  if (!customerId) {
    $("#ordersTable tbody").empty();
    return;
  }

  $.get(`../../backend/api/ApiAdmin.php?listOrdersByCustomer&id=${customerId}`)
    .done(function (orders) {
      ordersCache = {}; // Lokaler Zwischenspeicher
      const tbody = $("#ordersTable tbody").empty();

      orders.forEach(function (order) {
        ordersCache[order.id] = order;

        tbody.append(`
          <tr>
            <td>${order.id}</td>
            <td>${order.created_at.split(" ")[0]}</td>
            <td>€${Number(order.total_amount).toFixed(2)}</td>
            <td>
              <button class="btn btn-sm btn-info view-items" data-id="${order.id}">
                Details
              </button>
            </td>
          </tr>
        `);
      });
    })
    .fail(function (xhr) {
      handleResponse(xhr.responseJSON || {}, { errorMessage: "Failed to load orders." });
    });
}

/** ------------------- EINZELBESTELLUNG ANZEIGEN ------------------- **/

function loadOrderItems(orderId) {
  const order = ordersCache[orderId];
  const body = $("#orderItemsBody").empty();

  if (!order) {
    body.append("<p>No order found.</p>");
    return;
  }

  body.append(`
    <div><strong>Order #${order.id}</strong></div>
    <div>Subtotal: €${order.subtotal}</div>
    <div>Discount: €${order.discount}</div>
    <div>Shipping: €${order.shipping_amount}</div>
    <div><strong>Total: €${order.total_amount}</strong></div>
    <hr/>
  `);

  $.get(`../../backend/api/ApiAdmin.php?listOrderItems&order_id=${orderId}`)
    .done(function (items) {
      items.forEach(function (item) {
        body.append(`
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div>
              <strong>${item.name_snapshot}</strong><br>
              Qty: ${item.quantity} × €${Number(item.price_snapshot).toFixed(2)}
            </div>
            <div class="d-flex align-items-center">
              <input type="number" min="1" max="${item.quantity}" value="1"
                     class="form-control form-control-sm me-2 remove-quantity"
                     data-max="${item.quantity}" data-id="${item.id}" style="width: 70px;">
              <button class="btn btn-sm btn-danger remove-item" data-id="${item.id}">
                Remove
              </button>
            </div>
          </div>
        `);
      });
    })
    .fail(function (xhr) {
      handleResponse(xhr.responseJSON || {}, { errorMessage: "Failed to load order items." });
    });
}

/** ------------------- EINZELNEN ARTIKEL AUS BESTELLUNG ENTFERNEN ------------------- **/

function removeOrderItem(itemId) {
  const qtyInput = $(`.remove-quantity[data-id="${itemId}"]`);
  const qtyToRemove = parseInt(qtyInput.val(), 10) || 1;

  $.post(`../../backend/api/ApiAdmin.php?removeOrderItem&id=${itemId}&qty=${qtyToRemove}`)
    .done(function (resp) {
      handleResponse(resp, {
        successMessage: "Item updated successfully.",
        onSuccess: function () {
          $("#orderItemsModal").modal("hide");
          $("#orderCustomerSelect").trigger("change"); // Tabelle neu laden
        }
      });
    })
    .fail(function (xhr) {
      handleResponse(xhr.responseJSON || {}, { errorMessage: "Failed to update item." });
    });
}

/** ------------------- EVENTS BINDEN ------------------- **/

function bindOrderEvents() {
  // Kunde auswählen → Bestellungen laden
  $("#orderCustomerSelect").on("change", function () {
    loadOrdersByCustomer($(this).val());
  });

  // Bestelldetails öffnen
  $(document).on("click", ".view-items", function () {
    loadOrderItems($(this).data("id"));
    new bootstrap.Modal(document.getElementById("orderItemsModal")).show();
  });

  // Artikel aus Bestellung entfernen
  $(document).on("click", ".remove-item", function () {
    removeOrderItem($(this).data("id"));
  });
}
