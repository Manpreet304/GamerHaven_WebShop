// admin.orders.js
(function(window, $) {
  let ordersCache = {};

  function loadOrderCustomers() {
    $.get("../../backend/api/ApiAdmin.php?listCustomers")
      .done(users => {
        const sel = $("#orderCustomerSelect").empty().append('<option value="">Select…</option>');
        users.forEach(u => {
          sel.append(`<option value="${u.id}">${u.firstname} ${u.lastname}</option>`);
        });
      })
      .fail(xhr => handleResponse(xhr.responseJSON || {}, {
        errorMessage: "Customer data could not be loaded."
      }));
  }

  function loadOrdersByCustomer(id) {
    if (!id) {
      $("#ordersTable tbody").empty();
      return;
    }

    $.get(`../../backend/api/ApiAdmin.php?listOrdersByCustomer&id=${id}`)
      .done(orders => {
        ordersCache = {};
        const tbody = $("#ordersTable tbody").empty();
        orders.forEach(o => {
          ordersCache[o.id] = o;
          tbody.append(`
            <tr>
              <td>${o.id}</td>
              <td>${o.created_at.split(" ")[0]}</td>
              <td>€${Number(o.total_amount).toFixed(2)}</td>
              <td>
                <button class="btn btn-sm btn-info view-items" data-id="${o.id}">
                  Details
                </button>
              </td>
            </tr>
          `);
        });
      })
      .fail(xhr => handleResponse(xhr.responseJSON || {}, {
        errorMessage: "Orders could not be loaded."
      }));
  }

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
      .done(items => {
        items.forEach(i => {
          body.append(`
            <div class="d-flex justify-content-between align-items-center mb-2">
              <div>
                <strong>${i.name_snapshot}</strong><br>
                Qty: ${i.quantity} × €${Number(i.price_snapshot).toFixed(2)}
              </div>
              <div class="d-flex align-items-center">
                <input type="number" min="1" max="${i.quantity}" value="1"
                       class="form-control form-control-sm me-2 remove-quantity"
                       data-max="${i.quantity}" data-id="${i.id}" style="width: 70px;">
                <button class="btn btn-sm btn-danger remove-item" data-id="${i.id}">
                  Remove
                </button>
              </div>
            </div>
          `);
        });
      })
      .fail(xhr => handleResponse(xhr.responseJSON || {}, {
        errorMessage: "Order items could not be loaded."
      }));
  }

  function removeOrderItem(itemId) {
    const qtyInput = $(`.remove-quantity[data-id="${itemId}"]`);
    const qtyToRemove = parseInt(qtyInput.val(), 10) || 1;

    $.post(`../../backend/api/ApiAdmin.php?removeOrderItem&id=${itemId}&qty=${qtyToRemove}`)
      .done(resp => handleResponse(resp, {
        successMessage: "Item updated successfully.",
        onSuccess: () => {
          $("#orderItemsModal").modal("hide");
          $("#orderCustomerSelect").trigger("change");
        }
      }))
      .fail(xhr => handleResponse(xhr.responseJSON || {}, {
        errorMessage: "Error updating item."
      }));
  }

  function bindOrderEvents() {
    $("#orderCustomerSelect").on("change", function() {
      loadOrdersByCustomer($(this).val());
    });

    $(document).on("click", ".view-items", function() {
      loadOrderItems($(this).data("id"));
      new bootstrap.Modal(document.getElementById("orderItemsModal")).show();
    });

    $(document).on("click", ".remove-item", function() {
      removeOrderItem($(this).data("id"));
    });
  }

  $(function() {
    loadOrderCustomers();
    bindOrderEvents();
  });
})(window, jQuery);
