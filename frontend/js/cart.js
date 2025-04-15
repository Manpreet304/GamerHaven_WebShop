$(document).ready(function () {
    loadCart();
    updateCartCount();
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
        }
    });
}

function renderCartItems(response) {
    const items = response.items || [];
    const tbody = $("#cart-items");
    tbody.empty();

    if (!items.length) {
        tbody.append(`<tr><td colspan="5">Your cart is currently empty.</td></tr>`);
        $("#total-price").text("€0.00");
        return;
    }

    items.forEach((item) => {
        const subtotal = item.price * item.quantity;

        tbody.append(`
            <tr data-id="${item.id}">
              <td>${item.name}</td>
              <td>€${item.price.toFixed(2)}</td>
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

    $("#total-price").text(`€${response.total.toFixed(2)}`);
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
        success: () => {
            loadCart();
        }
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
        success: () => {
            loadCart();
        }
    });
});

function addToCart(productId, quantity = 1) {
    $.ajax({
        url: "/GamerHaven_WebShop/backend/api/api_cart.php?addToCart=" + productId,
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({ quantity }),
        success: (data) => {
            if (data.success) {
                showMessage("success", "Product added to cart.");
                updateCartCount();

                // Visual Feedback – Karte + Modal
                updateAddToCartButtons(productId, true);
            } else {
                showMessage("danger", "Could not add to cart.");
                updateAddToCartButtons(productId, false);
            }
        },
        error: (xhr) => {
            if (xhr.status === 401) {
                showMessage("danger", "Please login to use the cart.");
            } else {
                showMessage("danger", "An error occurred.");
            }
            updateAddToCartButtons(productId, false);
        }
    });
}

function updateAddToCartButtons(productId, success) {
    const cardBtn = $(`.product-card[data-product-id='${productId}'] .add-to-cart`);
    const modalBtn = $(`#productModal${productId} .add-to-cart`);
    const btns = [cardBtn, modalBtn];

    btns.forEach(btn => {
        if (btn.length) {
            btn.removeClass("button-added button-error");

            if (success) {
                btn.addClass("button-added").html('<i class="bi bi-check-lg me-1"></i> Added');
            } else {
                btn.addClass("button-error").html('<i class="bi bi-x-circle me-1"></i> Error');
            }

            // Rücksetzen nach 2 Sekunden
            setTimeout(() => {
                btn.removeClass("button-added button-error");
                btn.html('<i class="bi bi-cart-plus me-1"></i> Add to Cart');
            }, 2000);
        }
    });
}


function updateCartCount() {
    $.get("/GamerHaven_WebShop/backend/api/api_cart.php?cartCount", function (data) {
        $("#cart-count").text(data.count || 0);
    });
}
