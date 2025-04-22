// ----------------------- AJAX OPERATIONS -----------------------

/**
 * Fetch and render products, applying optional filters.
 */
function loadProducts(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    $.ajax({
        url: "../../backend/api/ApiProducts.php" + (query ? `?${query}` : ""),
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
        error: () => showMessage("danger", "Products could not be loaded.")
    });
}

/**
 * Add a product to the cart via API.
 */
function addToCart(productId, quantity = 1) {
    $.ajax({
        url: `../../backend/api/ApiCart.php?addToCart=${productId}`,
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({ quantity }),
        success: data => {
            if (data.success) {
                showMessage("success", "Product added to cart.");
                updateCartCount();
                updateAddToCartButtons(productId, true);
            } else {
                showMessage("danger", "Could not add to cart.");
                updateAddToCartButtons(productId, false);
            }
        },
        error: xhr => {
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
    const selectors = [
        `.product-card[data-product-id='${productId}'] .add-to-cart`,
        `#productModal${productId} .add-to-cart`
    ];
    selectors.forEach(sel => {
        const btn = $(sel);
        if (!btn.length) return;
        btn.removeClass("button-added button-error")
           .addClass(success ? "button-added" : "button-error")
           .html(success
             ? '<i class="bi bi-check-lg me-1"></i> Added'
             : '<i class="bi bi-x-circle me-1"></i> Error');
        setTimeout(() => {
            btn.removeClass("button-added button-error")
               .html('<i class="bi bi-cart-plus me-1"></i> Add to Cart');
        }, 2000);
    });
}


// ----------------------- DOCUMENT READY & EVENT BINDING -----------------------

let filtersInitialized = false;
let allProductsCache = [];

$(document).ready(function () {
    // Initial load
    loadProducts();

    // Filtering events
    $(document).on(
      "change",
      "#filter-category input[type='radio'], #filter-brand input[type='checkbox'], #filter-rating, #filter-stock, #priceMin, #priceMax",
      () => loadProducts(collectFilters())
    );
    $("#applyFilters").click(() => loadProducts(collectFilters()));
    $("#resetFilters").click(() => {
        resetAllFilters();
        loadProducts();
    });

    // Live search debounce
    let liveSearchTimeout = null;
    $(document).on("input", "#liveSearchInput", function () {
        clearTimeout(liveSearchTimeout);
        const term = $(this).val().trim();
        liveSearchTimeout = setTimeout(() => {
            const filters = collectFilters();
            if (term) filters.search = term;
            loadProducts(filters);
        }, 300);
    });

    // Add to cart from card
    $(document).on("click", ".product-card .add-to-cart", function () {
        const card = $(this).closest(".product-card");
        const productId = card.data("product-id");
        const quantity = parseInt(card.find(".quantity-input").val(), 10) || 1;
        addToCart(productId, quantity);
    });

    // View details (modal) from card
    $(document).on("click", ".product-card .view-details", function () {
        const modalId = $(this).attr("data-bs-target");
        $(modalId).modal("show");
        const btn = $(this);
        btn.addClass("clicked");
        setTimeout(() => btn.removeClass("clicked"), 350);
    });

    // Add to cart from modal
    $(document).on("click", ".product-modal .add-to-cart", function () {
        const modal = $(this).closest(".modal");
        const productId = parseInt(modal.attr("id").replace("productModal", ""), 10);
        const quantity = parseInt(modal.find(".quantity-input").val(), 10) || 1;
        addToCart(productId, quantity);
    });
});


// ----------------------- FILTER UTILITIES -----------------------

/** Gather all selected filter values into an object. */
function collectFilters() {
    const f = {};
    const sc = $("input[name='category']:checked").val();
    if (sc) f.category = sc;

    const sb = $("#filter-brand input:checked").map((_,el)=>el.value).get();
    if (sb.length) f.brand = sb.join(",");

    const r = $("#filter-rating").val(); if (r) f.rating = r;
    const s = $("#filter-stock").val();  if (s) f.stock  = s;
    const mn= $("#priceMin").val();      if (mn) f.priceMin= mn;
    const mx= $("#priceMax").val();      if (mx) f.priceMax= mx;

    return f;
}

/** Reset all filters to their default states. */
function resetAllFilters() {
    $("#filter-brand input, #filter-category input").prop("checked", false);
    $("#priceMin, #priceMax, #filter-rating, #filter-stock").val("");
}


// ----------------------- RENDERING FUNCTIONS -----------------------

function renderFilters(products, filters = {}) {
    const selCat = filters.category || "";
    const cats = [...new Set(products.map(p=>p.category))].sort();
    let catHtml = `<div class="form-check">
        <input class="form-check-input" type="radio" name="category" value="" ${!selCat?"checked":""}>
        <label class="form-check-label">All Products</label>
    </div>`;
    cats.forEach(c=> {
      catHtml += `<div class="form-check">
          <input class="form-check-input" type="radio" name="category" value="${c}" ${selCat===c?"checked":""}>
          <label class="form-check-label">${c}</label>
      </div>`;
    });
    $("#filter-category").html(catHtml);

    const filtered = selCat ? products.filter(p=>p.category===selCat) : products;
    const brands = [...new Set(filtered.map(p=>p.brand))].sort();
    const selBrands = (filters.brand||"").split(",");
    let brandHtml = "";
    brands.forEach(b => {
      brandHtml += `<div class="form-check">
          <input class="form-check-input" type="checkbox" value="${b}" ${selBrands.includes(b)?"checked":""}>
          <label class="form-check-label">${b}</label>
      </div>`;
    });
    $("#filter-brand").html(brandHtml);
}

/**
  Render product cards and their corresponding modals.
 */
function renderProducts(products) {
    const grid = $("#productGrid").empty();
    const mods = $("#modals-container").empty();
    const tplCard = document.getElementById("product-template").content;
    const tplModal= document.getElementById("product-modal-template").content;

    products.forEach((p,i) => {
        // Card
        const cardNode = tplCard.cloneNode(true);
        const $card = $(cardNode).find(".product-card");
        $card.data("product-id", p.id);
        $card.find(".product-image")
            .attr("src", p.images?.[0]||"pictures/placeholder.jpg")
            .attr("data-index", i);
        $card.find(".card-title").text(p.name);
        $card.find(".card-meta").text(`${p.category} · ${p.brand}`);
        $card.find(".product-price").text(`€${p.price}`);
        const rv = parseFloat(p.rating) || 0;
        $card.find(".rating").html(renderStars(rv));
        $card.find(".view-details")
            .attr("data-bs-toggle","modal")
            .attr("data-bs-target",`#productModal${p.id}`);
        grid.append(cardNode);

        // Modal
        const modalNode = tplModal.cloneNode(true);
        const $mod = $(modalNode).find(".product-modal").attr("id",`productModal${p.id}`);
        const $car = $mod.find(".product-carousel").attr("id",`carousel${p.id}`);
        const $inner = $car.find(".carousel-inner").empty();
        (p.images||[]).forEach((src,idx)=>{
            $inner.append(`
              <div class="carousel-item${idx===0?" active":""}">
                <img src="${src}" class="d-block w-100">
              </div>`);
        });
        $mod.find(".modal-title").text(p.name);
        $mod.find(".product-description")
            .html(`<strong>Description:</strong><br>${p.description||"No description"}`);
        $mod.find(".product-price-text").html(`<strong>Price:</strong> €${p.price}`);
        $mod.find(".product-stock")
            .html(`<strong>Stock:</strong> ${p.stock>0?"✅ In Stock":"❌ Out of Stock"}`);
        $mod.find(".product-category")
            .html(`<strong>Category:</strong> ${p.category} / ${p.sub_category}`);
        $mod.find(".product-rating")
            .html(`<strong>Rating:</strong> ${renderStars(rv)}`);
        $mod.find(".attributes")
            .html(`<strong>Attributes:</strong><br>${renderAttributes(p.attributes)}`);
        mods.append(modalNode);
    });
}


function setupHoverRotation(products) {
    const intervals = {};
    $(".product-card").each(function () {
        const $img = $(this).find(".product-image");
        const idx = $img.data("index");
        const imgs = products[idx]?.images || [];
        if (imgs.length <= 1) return;
        $(this).hover(
            () => {
                intervals[idx] = setInterval(() => {
                    const cur = imgs.indexOf($img.attr("src"));
                    const next = (cur + 1) % imgs.length;
                    $img.attr("src", imgs[next]);
                }, 2000);
            },
            () => {
                clearInterval(intervals[idx]);
                $img.attr("src", imgs[0]);
            }
        );
    });
}


// ----------------------- HELPER UTILITIES -----------------------

/** Render star-rating HTML. */
function renderStars(rating) {
    let html = "";
    const full = Math.floor(rating);
    const half = rating - full >= 0.5;
    for (let i = 0; i < full; i++) html += `<i class="bi bi-star-fill text-warning"></i>`;
    if (half) html += `<i class="bi bi-star-half text-warning"></i>`;
    while ((html.match(/bi-star/g)||[]).length < 5) {
        html += `<i class="bi bi-star text-warning"></i>`;
    }
    return html;
}

/** Parse and render JSON-encoded attribute string. */
function renderAttributes(attrString) {
    try {
        const obj = JSON.parse(attrString);
        return Object.entries(obj)
            .map(([k,v]) => `<div><strong>${k}:</strong> ${v}</div>`)
            .join("");
    } catch {
        return "<i>No attributes</i>";
    }
}
