// admin_orders.js

let ordersCache = {};

$(document).ready(function() {
  loadOrderCustomers();
  bindOrderEvents();
});

function loadOrderCustomers() {
  $.get('../../backend/api/ApiAdmin.php?listCustomers')
    .done(users => {
      const sel = $('#orderCustomerSelect').empty().append('<option value="">Select…</option>');
      users.forEach(u => {
        sel.append(`<option value="${u.id}">${u.firstname} ${u.lastname}</option>`);
      });
    })
    .fail((xhr, status, err) => {
      const msg = xhr.responseJSON?.error || 'Customer data could not be loaded.';
      showMessage('danger', msg);
      console.error('loadOrderCustomers failed', status, err);
    });
}

function bindOrderEvents() {
  $('#orderCustomerSelect').on('change', function() {
    loadOrdersByCustomer($(this).val());
  });

  $(document).on('click', '.view-items', function() {
    loadOrderItems($(this).data('id'));
    new bootstrap.Modal(document.getElementById('orderItemsModal')).show();
  });

  $(document).on('click', '.remove-item', function() {
    const itemId = $(this).data('id');
    $.post(`../../backend/api/ApiAdmin.php?removeOrderItem&id=${itemId}`)
      .done(resp => {
        if (resp.success) {
          showMessage('success', 'Item removed successfully.');
          $('#orderItemsModal').modal('hide');
          $('#orderCustomerSelect').trigger('change');
        } else {
          const msg = resp.error || 'Item could not be removed.';
          showMessage('danger', msg);
        }
      })
      .fail((xhr, status, err) => {
        const msg = xhr.responseJSON?.error || 'Error removing item.';
        showMessage('danger', msg);
        console.error('removeOrderItem failed', status, err);
      });
  });
}

function loadOrdersByCustomer(id) {
  if (!id) {
    $('#ordersTable tbody').empty();
    return;
  }

  $.get(`../../backend/api/ApiAdmin.php?listOrdersByCustomer&id=${id}`)
    .done(orders => {
      ordersCache = {};
      const tbody = $('#ordersTable tbody').empty();
      orders.forEach(o => {
        ordersCache[o.id] = o;
        tbody.append(`
          <tr>
            <td>${o.id}</td>
            <td>${o.created_at.split(' ')[0]}</td>
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
    .fail((xhr, status, err) => {
      const msg = xhr.responseJSON?.error || 'Orders could not be loaded.';
      showMessage('danger', msg);
      console.error('loadOrdersByCustomer failed', status, err);
    });
}

function loadOrderItems(orderId) {
  const order = ordersCache[orderId];
  const body  = $('#orderItemsBody').empty();

  if (!order) {
    body.append('<p>No order found.</p>');
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
              Qty: ${i.quantity} × €${i.price_snapshot}
            </div>
            <button class="btn btn-sm btn-danger remove-item" data-id="${i.id}">
              Remove
            </button>
          </div>
        `);
      });
    })
    .fail((xhr, status, err) => {
      const msg = xhr.responseJSON?.error || 'Order items could not be loaded.';
      showMessage('danger', msg);
      console.error('loadOrderItems failed', status, err);
    });
}
