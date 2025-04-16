let filtersInitialized = false;
let allProductsCache = [];

$(document).ready(function () {
    loadProducts();

    $("#applyFilters").on("click", () => loadProducts(collectFilters()));
    $("#resetFilters").on("click", () => {
        resetAllFilters();
        loadProducts();
    });

    $(document).on("input", "#liveSearchInput", handleLiveSearch);

    $(document).on("change", "#filter-category input[type='radio'], #filter-brand input[type='checkbox'], #filter-rating, #filter-stock, #priceMin, #priceMax", () => {
        loadProducts(collectFilters());
    });

    $(document).on("click", ".product-card .add-to-cart, .product-modal .add-to-cart", function () {
        const container = $(this).closest(".product-card, .modal");
        const productId = container.data("product-id") || container.attr("id").replace("productModal", "");
        const quantity = parseInt(container.find(".quantity-input").val()) || 1;
        addToCart(productId, quantity);
    });

    $(document).on("click", ".product-card .view-details", function () {
        const modalId = $(this).attr("data-bs-target");
        $(modalId).modal("show").find(".btn").addClass("clicked");
        setTimeout(() => $(modalId).find(".btn").removeClass("clicked"), 350);
    });
});

function handleLiveSearch() {
    clearTimeout(window.liveSearchTimeout);
    const term = $(this).val().trim();
    window.liveSearchTimeout = setTimeout(() => {
        const filters = collectFilters();
        if (term) filters.search = term;
        loadProducts(filters);
    }, 300);
}

function collectFilters() {
    return {
        category: $("input[name='category']:checked").val() || "",
        brand: $("#filter-brand input[type='checkbox']:checked").map((_, el) => el.value).get().join(","),
        rating: $("#filter-rating").val(),
        stock: $("#filter-stock").val(),
        priceMin: $("#priceMin").val(),
        priceMax: $("#priceMax").val()
    };
}

function resetAllFilters() {
    $("#filter-brand input, #priceMin, #priceMax").val('').prop("checked", false);
    $("#filter-rating, #filter-stock").val('');
    $("input[name='category'][value='']").prop("checked", true);
}

function loadProducts(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    $.get(`../../backend/api/api_products.php${query ? `?${query}` : ""}`, (products) => {
        const $grid = $("#productGrid").empty();
        const $modals = $("#modals-container").empty();

        if (!filtersInitialized) {
            allProductsCache = [...products];
            filtersInitialized = true;
        }

        renderFilters(allProductsCache, filters);
        renderProducts(products, $grid, $modals);
        setupHoverRotation(products);
    }).fail(() => showMessage("danger", "Products could not be loaded."));
}

function renderFilters(products, filters) {
    const selectedCategory = filters.category || "";
    const selectedBrands = (filters.brand || "").split(",");

    const categories = [...new Set(allProductsCache.map(p => p.category))].sort();
    const catHTML = categories.map(cat => `
        <div class="form-check">
            <input class="form-check-input" type="radio" name="category" value="${cat}" ${selectedCategory === cat ? "checked" : ""}>
            <label class="form-check-label">${cat}</label>
        </div>`);
    $("#filter-category").html(`<div class="form-check">
        <input class="form-check-input" type="radio" name="category" value="" ${!selectedCategory ? "checked" : ""}>
        <label class="form-check-label">All Products</label>
    </div>${catHTML.join("")}`);

    const brands = [...new Set(products.filter(p => !selectedCategory || p.category === selectedCategory).map(p => p.brand))].sort();
    const brandHTML = brands.map(brand => `
        <div class="form-check">
            <input class="form-check-input" type="checkbox" value="${brand}" ${selectedBrands.includes(brand) ? "checked" : ""}>
            <label class="form-check-label">${brand}</label>
        </div>`);
    $("#filter-brand").html(brandHTML.join(""));
}

function renderProducts(products, grid, modalsContainer) {
    const cardTpl = document.getElementById("product-template");
    const modalTpl = document.getElementById("product-modal-template");

    products.forEach((product, i) => {
        const cardClone = cardTpl.content.cloneNode(true);
        const modalClone = modalTpl.content.cloneNode(true);

        const $card = $(cardClone).find(".product-card").attr("data-product-id", product.id);
        $card.find(".product-image").attr({ src: product.images?.[0] || 'pictures/placeholder.jpg', "data-index": i });
        $card.find(".card-title").text(product.name);
        $card.find(".card-meta").text(`${product.category} · ${product.brand}`);
        $card.find(".product-price").text(`€${product.price}`);
        $card.find(".rating").html(renderRating(product.rating));

        const modalId = `productModal${product.id}`;
        const $modal = $(modalClone).find(".product-modal").attr("id", modalId).attr("data-product-id", product.id);
        const $carousel = $modal.find(".product-carousel").attr("id", `carousel${product.id}`);
        $carousel.find(".carousel-control-prev, .carousel-control-next").attr("data-bs-target", `#carousel${product.id}`);
        $modal.find(".modal-title").text(product.name);
        $modal.find(".product-description").html(`<strong>Description:</strong><br>${product.description || "No description"}`);
        $modal.find(".product-price-text").html(`<strong>Price:</strong> €${product.price}`);
        $modal.find(".product-stock").html(`<strong>Stock:</strong> ${product.stock > 0 ? "✅ In Stock" : "❌ Out of Stock"}`);
        $modal.find(".product-category").html(`<strong>Category:</strong> ${product.category} / ${product.sub_category}`);
        $modal.find(".product-rating").html(`<strong>Rating:</strong> ${renderRating(product.rating)}`);
        $modal.find(".attributes").html(`<strong>Attributes:</strong><br>${renderAttributes(product.attributes)}`);
        $modal.find(".carousel-inner").html(renderCarouselImages(product.images || []));

        $card.find(".view-details").attr({ "data-bs-toggle": "modal", "data-bs-target": `#${modalId}` });

        grid.append(cardClone);
        modalsContainer.append(modalClone);
    });
}

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


function renderCarouselImages(images) {
    return images.map((src, i) => `
        <div class="carousel-item ${i === 0 ? "active" : ""}">
            <img src="${src}" class="d-block w-100" alt="Product image">
        </div>`).join("");
}

function setupHoverRotation(products) {
    const intervals = {};

    $(".product-card").each(function () {
        const $card = $(this);
        const index = $card.find(".product-image").data("index");
        const product = products[index];
        if (!product || !product.images || product.images.length <= 1) return;

        const images = product.images;
        let currentImg = 0;
        const $img = $card.find(".product-image");

        $card.on("mouseenter", () => {
            intervals[index] = setInterval(() => {
                currentImg = (currentImg + 1) % images.length;
                $img.attr("src", images[currentImg]);
            }, 2000);
        });

        $card.on("mouseleave", () => {
            clearInterval(intervals[index]);
            $img.attr("src", images[0]);
        });
    });
}

function renderRating(rating) {
    rating = parseFloat(rating) || 0;
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    let stars = "";

    for (let i = 0; i < fullStars; i++) stars += `<i class="bi bi-star-fill text-warning"></i>`;
    if (halfStar) stars += `<i class="bi bi-star-half text-warning"></i>`;
    while (stars.split("bi-").length - 1 < 5) stars += `<i class="bi bi-star text-warning"></i>`;

    return `${stars} <small class="text-muted ms-1">(${rating.toFixed(1)})</small>`;
}

function renderAttributes(attrString) {
    try {
        const attrs = JSON.parse(attrString);
        return Object.entries(attrs).map(([k, v]) => `<div><strong>${k}:</strong> ${v}</div>`).join("");
    } catch {
        return "<i>No attributes</i>";
    }
}