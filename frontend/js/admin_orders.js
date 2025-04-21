let ordersCache = {};

$(document).ready(function() {
  loadOrderCustomers();
  bindOrderEvents();
});

function loadOrderCustomers() {
  $.get('../../backend/api/ApiAdmin.php?listCustomers', users => {
    const sel = $('#orderCustomerSelect').empty().append('<option value="">Select…</option>');
    users.forEach(u => {
      sel.append(`<option value="${u.id}">${u.firstname} ${u.lastname}</option>`);
    });
  });
}

function bindOrderEvents() {
  $('#orderCustomerSelect').on('change', function() {
    loadOrdersByCustomer($(this).val());
  });
  $(document).on('click','.view-items',function(){
    loadOrderItems($(this).data('id'));
    new bootstrap.Modal(document.getElementById('orderItemsModal')).show();
  });
  $(document).on('click','.remove-item',function(){
    $.post(`../../backend/api/ApiAdmin.php?removeOrderItem&id=${$(this).data('id')}`,()=>{
      $('#orderItemsModal').modal('hide');
      $('#orderCustomerSelect').trigger('change');
    });
  });
}

function loadOrdersByCustomer(id) {
  if (!id) return $('#ordersTable tbody').empty();
  $.get(`../../backend/api/ApiAdmin.php?listOrdersByCustomer&id=${id}`, orders => {
    ordersCache = {};
    const tbody = $('#ordersTable tbody').empty();
    orders.forEach(o => {
      ordersCache[o.id] = o;
      tbody.append(`
        <tr>
          <td>${o.id}</td>
          <td>${o.created_at.split(' ')[0]}</td>
          <td>€${Number(o.total_amount).toFixed(2)}</td>
          <td><button class="btn btn-sm btn-info view-items" data-id="${o.id}">Details</button></td>
        </tr>
      `);
    });
  });
}

function loadOrderItems(orderId) {
  const order = ordersCache[orderId];
  const body  = $('#orderItemsBody').empty();
  if (!order) return body.append('<p>No order data</p>');
  body.append(`
    <div><strong>Order #${order.id}</strong></div>
    <div>Subtotal: €${order.subtotal}</div>
    <div>Discount: €${order.discount}</div>
    <div>Shipping: €${order.shipping_amount}</div>
    <div><strong>Total: €${order.total_amount}</strong></div>
    <hr/>
  `);
  $.get(`../../backend/api/ApiAdmin.php?listOrderItems&order_id=${orderId}`,items=>{
    items.forEach(i=>{
      body.append(`
        <div class="d-flex justify-content-between align-items-center mb-2">
          <div>
            <strong>${i.name_snapshot}</strong><br>
            Qty: ${i.quantity} × €${i.price_snapshot}
          </div>
          <button class="btn btn-sm btn-danger remove-item" data-id="${i.id}">Remove</button>
        </div>
      `);
    });
  });
}
