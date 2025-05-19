(function(window, $) {
  'use strict';

  const customerSelect         = document.getElementById('orderCustomerSelect');
  const ordersTableBody        = document.querySelector('#ordersTable tbody');
  const orderItemsContainer    = document.getElementById('orderItemsBody');
  const orderItemsModalElement = document.getElementById('orderItemsModal');
  const orderItemsModal        = new bootstrap.Modal(orderItemsModalElement);
  let ordersCache              = {};

  function fetchCustomersForOrders() {
    return new Promise((resolve, reject) => {
      apiRequest({
        url: '../../backend/api/ApiAdmin.php?listCustomers',
        method: 'GET',
        onSuccess: resolve,
        onError: reject
      });
    });
  }

  function fetchOrdersByCustomer(customerId = '') {
    const url = customerId
      ? `../../backend/api/ApiAdmin.php?listOrdersByCustomer&id=${customerId}`
      : `../../backend/api/ApiAdmin.php?listOrdersByCustomer`;

    return new Promise((resolve, reject) => {
      apiRequest({
        url,
        method: 'GET',
        onSuccess: resolve,
        onError: reject
      });
    });
  }

  function fetchOrderItems(orderId) {
    return new Promise((resolve, reject) => {
      apiRequest({
        url: `../../backend/api/ApiAdmin.php?listOrderItems&order_id=${orderId}`,
        method: 'GET',
        onSuccess: resolve,
        onError: reject
      });
    });
  }

  function removeOrderItem(orderItemId, qty) {
    return new Promise((resolve, reject) => {
      apiRequest({
        url: `../../backend/api/ApiAdmin.php?removeOrderItem&id=${orderItemId}&qty=${qty}`,
        method: 'POST',
        successMessage: 'Order item updated successfully.',
        onSuccess: resolve,
        onError: reject
      });
    });
  }

  function renderCustomerDropdown(customers) {
    customerSelect.innerHTML =
      '<option value="">All Customers</option>' +
      customers.map(c => `<option value="${c.id}">${c.firstname} ${c.lastname}</option>`).join('');
  }

  function renderOrdersTable(orders) {
    ordersCache = {};
    ordersTableBody.innerHTML = '';
    orders.forEach(o => {
      ordersCache[o.id] = o;
      const row = document.createElement('tr');
      row.dataset.id = o.id;
      row.innerHTML = `
        <td>${o.id}</td>
        <td>${o.created_at.split(' ')[0]}</td>
        <td>€${Number(o.total_amount).toFixed(2)}</td>
        <td>
          <button class="btn btn-sm btn-info view-items" data-id="${o.id}">Details</button>
        </td>
      `;
      ordersTableBody.appendChild(row);
    });
  }

  function renderOrderItems(orderId, items) {
    const order = ordersCache[orderId];
    orderItemsContainer.innerHTML = '';
    if (!order) {
      orderItemsContainer.innerHTML = '<p>No order found.</p>';
      return;
    }

    orderItemsContainer.insertAdjacentHTML('beforeend', `
      <div><strong>Order #${order.id}</strong></div>
      <div>Subtotal: €${order.subtotal}</div>
      <div>Discount: €${order.discount}</div>
      <div>Shipping: €${order.shipping_amount}</div>
      <div><strong>Total: €${order.total_amount}</strong></div>
      <hr/>
    `);

    items.forEach(item => {
      const maxQty = Number(item.quantity);
      orderItemsContainer.insertAdjacentHTML('beforeend', `
        <div class="d-flex justify-content-between align-items-center mb-2">
          <div>
            <strong>${item.name_snapshot}</strong><br>
            Qty: ${item.quantity} × €${Number(item.price_snapshot).toFixed(2)}
          </div>
          <div class="d-flex align-items-center">
            <input type="number" min="1" max="${maxQty}" value="1"
              class="form-control form-control-sm me-2 remove-quantity"
              data-max="${maxQty}" data-id="${item.id}" style="width: 70px;">
            <button class="btn btn-sm btn-danger remove-item" data-id="${item.id}">Remove</button>
          </div>
        </div>
      `);
    });

    orderItemsModal.show();
  }

  function handleCustomerChange() {
    const id = customerSelect.value;
    fetchOrdersByCustomer(id)
      .then(renderOrdersTable)
      .catch(() => {});
  }

  function handleViewItemsClick(e) {
    const id = +e.currentTarget.dataset.id;
    fetchOrderItems(id)
      .then(items => renderOrderItems(id, items))
      .catch(() => {});
  }

  function handleRemoveItemClick(e) {
    const id = +e.currentTarget.dataset.id;
    const input = document.querySelector(`.remove-quantity[data-id="${id}"]`);
    let qty = parseInt(input.value, 10) || 1;
    const max = parseInt(input.dataset.max, 10);
    if (qty < 1) qty = 1;
    if (qty > max) qty = max;

    removeOrderItem(id, qty)
      .then(() => {
        orderItemsModal.hide();
        fetchOrdersByCustomer(customerSelect.value)
          .then(renderOrdersTable)
          .catch(() => {});
      })
      .catch(() => {});
  }

  function bindOrderEvents() {
    customerSelect.addEventListener('change', handleCustomerChange);
    $(ordersTableBody).on('click', '.view-items', handleViewItemsClick);
    $(orderItemsContainer).on('click', '.remove-item', handleRemoveItemClick);
  }

  document.addEventListener('DOMContentLoaded', () => {
    fetchCustomersForOrders()
      .then(renderCustomerDropdown)
      .catch(() => {});

    fetchOrdersByCustomer()
      .then(renderOrdersTable)
      .catch(() => {});

    bindOrderEvents();
  });

})(window, jQuery);
