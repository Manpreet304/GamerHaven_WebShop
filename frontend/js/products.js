// products.js

let filtersInitialized = false;
let allProductsCache = [];

$(document).ready(function () {
  initEventListeners();
  loadProducts();
});

/** ------------------- INIT ------------------- **/
function initEventListeners() {
  // Filteraktionen
  $(document).on("change", "#filter-category input, #filter-brand input, #filter-rating, #filter-stock, #priceMin, #priceMax", () => {
    loadProducts(collectFilters());
  });

  $("#applyFilters").click(() => loadProducts(collectFilters()));
  $("#resetFilters").click(() => {
    resetAllFilters();
    loadProducts();
  });

  // Live Search
  let debounce;
  $(document).on("input", "#liveSearchInput", function () {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      const term = $(this).val().trim();
      const filters = collectFilters();
      if (term) filters.search = term;
      loadProducts(filters);
    }, 300);
  });

  // Add to cart: Produktkarte
  $(document).on("click", ".product-card .add-to-cart", function () {
    const card = $(this).closest(".product-card");
    const productId = card.data("product-id");
    const quantity = parseInt(card.find(".quantity-input").val(), 10) || 1;
    addToCart(productId, quantity);
  });

  // View Details
  $(document).on("click", ".product-card .view-details", function () {
    const modalId = $(this).attr("data-bs-target");
    $(modalId).modal("show");
    $(this).addClass("clicked");
    setTimeout(() => $(this).removeClass("clicked"), 350);
  });

  // Add to cart: Modal
  $(document).on("click", ".product-modal .add-to-cart", function () {
    const modal = $(this).closest(".modal");
    const productId = parseInt(modal.attr("id").replace("productModal", ""), 10);
    const quantity = parseInt(modal.find(".quantity-input").val(), 10) || 1;
    addToCart(productId, quantity);
  });
}

/** ------------------- PRODUKTE LADEN ------------------- **/
function loadProducts(filters = {}) {
  const query = new URLSearchParams(filters).toString();
  $.ajax({
    url: `../../backend/api/ApiProducts.php${query ? "?" + query : ""}`,
    method: "GET",
    success: products => {
      if (!filtersInitialized) {
        allProductsCache = [...products];
        filtersInitialized = true;
      }
      renderFilters(allProductsCache, filters);
      renderProducts(products);
      setupHoverRotation(products);
    },
    error: xhr => handleResponse(xhr.responseJSON || {}, {
      errorMessage: "Products could not be loaded."
    })
  });
}

/** ------------------- IN DEN WARENKORB ------------------- **/
function addToCart(productId, quantity = 1) {
  $.ajax({
    url: `../../backend/api/ApiCart.php?addToCart=${productId}`,
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify({ quantity }),
    success: res => handleResponse(res, {
      successMessage: "Product added to cart.",
      onSuccess: () => {
        updateCartCount();
        animateCartButtons(productId, true);
      },
      onError: () => animateCartButtons(productId, false)
    }),
    error: xhr => handleResponse(xhr.responseJSON || {}, {
      errorMessage: xhr.status === 401 ? "Please login to use the cart." : "An error occurred.",
      onError: () => animateCartButtons(productId, false)
    })
  });
}

function animateCartButtons(productId, success) {
  const buttons = [
    $(`.product-card[data-product-id='${productId}'] .add-to-cart`),
    $(`#productModal${productId} .add-to-cart`)
  ];

  buttons.forEach(btn => {
    btn.removeClass("button-added button-error")
       .addClass(success ? "button-added" : "button-error")
       .html(success ? '<i class="bi bi-check-lg me-1"></i> Added' : '<i class="bi bi-x-circle me-1"></i> Error');

    setTimeout(() => {
      btn.removeClass("button-added button-error")
         .html('<i class="bi bi-cart-plus me-1"></i> Add to Cart');
    }, 2000);
  });
}

/** ------------------- FILTER ------------------- **/
function collectFilters() {
  return {
    category: $("input[name='category']:checked").val() || "",
    brand: $("#filter-brand input:checked").map((_, el) => el.value).get().join(","),
    rating: $("#filter-rating").val(),
    stock: $("#filter-stock").val(),
    priceMin: $("#priceMin").val(),
    priceMax: $("#priceMax").val()
  };
}

function resetAllFilters() {
  $("#filter-brand input, #filter-category input").prop("checked", false);
  $("#priceMin, #priceMax, #filter-rating, #filter-stock").val("");
}

function renderFilters(products, filters = {}) {
  const selCat = filters.category || "";
  const cats = [...new Set(products.map(p => p.category))].sort();

  const catHtml = [
    `<div class="form-check"><input class="form-check-input" type="radio" name="category" value="" ${!selCat ? "checked" : ""}><label class="form-check-label">All Products</label></div>`,
    ...cats.map(c => `<div class="form-check"><input class="form-check-input" type="radio" name="category" value="${c}" ${selCat === c ? "checked" : ""}><label class="form-check-label">${c}</label></div>`)
  ];
  $("#filter-category").html(catHtml.join(""));

  const filtered = selCat ? products.filter(p => p.category === selCat) : products;
  const brands = [...new Set(filtered.map(p => p.brand))].sort();
  const selBrands = (filters.brand || "").split(",");

  const brandHtml = brands.map(b => `<div class="form-check"><input class="form-check-input" type="checkbox" value="${b}" ${selBrands.includes(b) ? "checked" : ""}><label class="form-check-label">${b}</label></div>`);
  $("#filter-brand").html(brandHtml.join(""));
}

/** ------------------- PRODUKTE RENDERN ------------------- **/
function renderProducts(products) {
  const grid = $("#productGrid").empty();
  const mods = $("#modals-container").empty();
  const tplCard = document.getElementById("product-template").content;
  const tplModal = document.getElementById("product-modal-template").content;

  products.forEach((p, i) => {
    // --- Karte ---
    const $card = $(tplCard.cloneNode(true)).find(".product-card");
    $card.attr("data-product-id", p.id);
    $card.find(".product-image").attr("src", p.images?.[0] || "pictures/placeholder.jpg").attr("data-index", i);
    $card.find(".card-title").text(p.name);
    $card.find(".card-meta").text(`${p.category} · ${p.brand}`);
    $card.find(".product-price").text(`€${p.price}`);
    $card.find(".rating").html(renderStars(p.rating || 0));
    $card.find(".view-details").attr("data-bs-toggle", "modal").attr("data-bs-target", `#productModal${p.id}`);
    grid.append($card.closest(".col-md-4"));

    // --- Modal ---
    const $mod = $(tplModal.cloneNode(true)).find(".product-modal").attr("id", `productModal${p.id}`);
    const $img = $mod.find(".modal-product-image");
    $img.attr("src", p.images?.[0] || "pictures/placeholder.jpg");
    if (p.images?.length > 1) {
      let index = 0;
      setInterval(() => {
        index = (index + 1) % p.images.length;
        $img.attr("src", p.images[index]);
      }, 2500);
    }
    $mod.find(".modal-title").text(p.name);
    $mod.find(".product-description").html(`<strong>Description:</strong><br>${p.description || "No description"}`);
    $mod.find(".product-price-text").html(`<strong>Price:</strong> €${p.price}`);
    $mod.find(".product-stock").html(`<strong>Stock:</strong> ${p.stock > 0 ? "✅ In Stock" : "❌ Out of Stock"}`);
    $mod.find(".product-category").html(`<strong>Category:</strong> ${p.category} / ${p.sub_category}`);
    $mod.find(".product-rating").html(`<strong>Rating:</strong> ${renderStars(p.rating || 0)}`);
    $mod.find(".attributes").html(`<strong>Attributes:</strong><br>${renderAttributes(p.attributes)}`);
    mods.append($mod.closest(".modal"));
  });
}

/** ------------------- HOVER ROTATION ------------------- **/
function setupHoverRotation(products) {
  $(".product-card").each(function () {
    const $img = $(this).find(".product-image");
    const idx = $img.data("index");
    const imgs = products[idx]?.images || [];
    if (imgs.length <= 1) return;

    let interval;
    $(this).hover(
      () => interval = setInterval(() => {
        const cur = imgs.indexOf($img.attr("src"));
        const next = (cur + 1) % imgs.length;
        $img.attr("src", imgs[next]);
      }, 2000),
      () => {
        clearInterval(interval);
        $img.attr("src", imgs[0]);
      }
    );
  });
}

/** ------------------- HILFSFUNKTIONEN ------------------- **/
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return Array(full).fill('<i class="bi bi-star-fill text-warning"></i>').join("") +
         (half ? '<i class="bi bi-star-half text-warning"></i>' : '') +
         Array(5 - full - (half ? 1 : 0)).fill('<i class="bi bi-star text-warning"></i>').join("");
}

function renderAttributes(attrString) {
  try {
    const obj = JSON.parse(attrString);
    return Object.entries(obj).map(([k, v]) => `<div><strong>${k}:</strong> ${v}</div>`).join("");
  } catch {
    return "<i>No attributes</i>";
  }
}
