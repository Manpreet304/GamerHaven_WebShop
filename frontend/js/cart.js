$(document).ready(function () {
    loadCart();
  });
  
  function loadCart() {
    $.ajax({
      url: "/GamerHaven_WebShop/backend/api/api_cart.php",
      method: "GET",
      success: function (cartItems) {
        renderCartItems(cartItems);
        updateCartCount();
      },
      error: () => {
        $("#cart-items").html(`<tr><td colspan="5">Error loading cart items.</td></tr>`);
      },
    });
  }
  
  function renderCartItems(items) {
    const tbody = $("#cart-items");
    tbody.empty();
  
    if (!items.length) {
      tbody.append(`<tr><td colspan="5">Your cart is currently empty.</td></tr>`);
      $("#total-price").text("€0.00");
      return;
    }
  
    let total = 0;
  
    items.forEach((item) => {
      const price = parseFloat(item.price);
      const subtotal = price * item.quantity;
      total += subtotal;
  
      tbody.append(`
        <tr data-id="${item.id}">
          <td>${item.name}</td>
          <td>€${price.toFixed(2)}</td>
          <td>
            <input type="number" class="form-control quantity-input" min="1" value="${item.quantity}" style="width: 80px; margin: auto;">
          </td>
          <td>€${subtotal.toFixed(2)}</td>
          <td>
            <button class="btn btn-danger btn-sm delete-item"><i class="bi bi-trash"></i></button>
          </td>
        </tr>
      `);
    });
  
    $("#total-price").text(`€${total.toFixed(2)}`);
  }
  
  
  $(document).on("change", ".quantity-input", function () {
    const tr = $(this).closest("tr");
    const cartId = tr.data("id");
    const quantity = parseInt($(this).val());
    if (quantity < 1) return;
  
    $.ajax({
      url: "/GamerHaven_WebShop/backend/api/api_cart.php",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ action: "update", id: cartId, quantity }),
      success: loadCart,
    });
  });
  
  $(document).on("click", ".delete-item", function () {
    const tr = $(this).closest("tr");
    const cartId = tr.data("id");
  
    $.ajax({
      url: "/GamerHaven_WebShop/backend/api/api_cart.php",
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ action: "delete", id: cartId }),
      success: loadCart,
    });
  });
  
  function updateCartCount() {
    $.get("/GamerHaven_WebShop/backend/api/api_cart.php?cartCount", function (data) {
      $("#cart-count").text(data.count || 0);
    });
  }
  