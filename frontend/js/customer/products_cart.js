// /customer/products_cart.js

function initProductCart() {
    // Add to cart Click-Handler
    $(document).on("click", ".add-to-cart", function () {
      const parent = $(this).closest(".product-card, .product-modal"); // Egal ob Card oder Modal
      const productId = parent.data("product-id");
      const quantity = parseInt(parent.find(".quantity-input").val(), 10) || 1;
      addToCart(productId, quantity);
    });
  }
  
  // Produkt in den Warenkorb legen
  function addToCart(productId, quantity) {
    $.ajax({
      url: "../../backend/api/ApiCart.php?addToCart=" + productId,
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify({ quantity: quantity }),
      success: function (res) {
        handleResponse(res, {
          successMessage: "Product added to cart.",
          onSuccess: function () {
            updateCartCount();
            animateCartButtons(productId, true);
          },
          onError: function () {
            animateCartButtons(productId, false);
          }
        });
      },
      error: function (xhr) {
        handleResponse(xhr.responseJSON || {}, {
          errorMessage: xhr.status === 401 ? "Please login to use the cart." : "An error occurred.",
          onError: function () {
            animateCartButtons(productId, false);
          }
        });
      }
    });
  }
  
  // Buttons animieren (Add to Cart)
  function animateCartButtons(productId, success) {
    const buttons = [
      $(`.product-card[data-product-id='${productId}'] .add-to-cart`),
      $(`#productModal${productId} .add-to-cart`)
    ];
  
    buttons.forEach(function (btn) {
      btn.removeClass("button-added button-error")
        .addClass(success ? "button-added" : "button-error")
        .html(success ? '<i class="bi bi-check-lg me-1"></i> Added' : '<i class="bi bi-x-circle me-1"></i> Error');
  
      setTimeout(function () {
        btn.removeClass("button-added button-error")
          .html('<i class="bi bi-cart-plus me-1"></i> Add to Cart');
      }, 2000);
    });
  }
  