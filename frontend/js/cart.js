$(document).ready(function () {
    loadCart();
    updateCartCount();
});

function loadCart() {
    $.ajax({
        url: "../../backend/api/api_cart.php",
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
    const template = document.getElementById("cart-item-template");

    tbody.empty();

    if (!items.length) {
        tbody.append(`<tr><td colspan="5">Your cart is currently empty.</td></tr>`);
        $("#total-price").text("€0.00");
        return;
    }

    items.forEach(item => {
        const clone = template.content.cloneNode(true);
        const row = $(clone).find("tr");

        row.attr("data-id", item.id);
        row.find(".cart-name").text(item.name);
        row.find(".cart-price").text(`€${item.price.toFixed(2)}`);
        row.find(".cart-subtotal").text(`€${(item.price * item.quantity).toFixed(2)}`);
        row.find(".quantity-input").val(item.quantity);

        tbody.append(row);
    });

    $("#shipping-price").text(response.shipping === 0 ? "Free" : `€${response.shipping.toFixed(2)}`);
    $("#total-price").text(`€${response.total.toFixed(2)}`);
}

// === Mengenänderung
$(document).on("change", ".quantity-input", function () {
    const tr = $(this).closest("tr");
    const cartId = tr.data("id");
    const quantity = parseInt($(this).val());

    if (quantity < 1) return;

    $.ajax({
        url: "../../backend/api/api_cart.php",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({ action: "update", id: cartId, quantity }),
        success: loadCart
    });
});

// === Entfernen
$(document).on("click", ".delete-item", function () {
    const tr = $(this).closest("tr");
    const cartId = tr.data("id");

    $.ajax({
        url: "../../backend/api/api_cart.php",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({ action: "delete", id: cartId }),
        success: loadCart
    });
});

function addToCart(productId, quantity = 1) {
    $.ajax({
        url: "../../backend/api/api_cart.php?addToCart=" + productId,
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({ quantity }),
        success: (data) => {
            if (data.success) {
                showMessage("success", "Product added to cart.");
                updateCartCount();
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
    const btns = [
        $(`.product-card[data-product-id='${productId}'] .add-to-cart`),
        $(`#productModal${productId} .add-to-cart`)
    ];

    btns.forEach(btn => {
        if (!btn.length) return;

        btn.removeClass("button-added button-error");

        if (success) {
            btn.addClass("button-added").html('<i class="bi bi-check-lg me-1"></i> Added');
        } else {
            btn.addClass("button-error").html('<i class="bi bi-x-circle me-1"></i> Error');
        }

        setTimeout(() => {
            btn.removeClass("button-added button-error");
            btn.html('<i class="bi bi-cart-plus me-1"></i> Add to Cart');
        }, 2000);
    });
}

function updateCartCount() {
    $.get("/GamerHaven_WebShop/backend/api/api_cart.php?cartCount", function (data) {
        $("#cart-count").text(data.count || 0);
    });
}