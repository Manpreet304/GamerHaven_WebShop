$(document).ready(function () {
    loadProducts();
    updateCartCount();
});

// Laden der Produkte
function loadProducts() {
    $.ajax({
        url: "/GamerHaven_WebShop/backend/api/api_products.php",
        method: "GET",
        success: function (products) {
            const grid = $("#productGrid");
            const modalsContainer = $("#modals-container");
            grid.empty();
            modalsContainer.empty();

            const productTemplate = document.getElementById("product-template");
            const modalTemplate = document.getElementById("product-modal-template");

            products.forEach((product, i) => {
                // === Product Card ===
                const cardClone = productTemplate.content.cloneNode(true);
                const card = $(cardClone).find(".product-card");
                const image = $(cardClone).find(".product-image");
                const title = $(cardClone).find(".card-title");
                const meta = $(cardClone).find(".card-meta");
                const price = $(cardClone).find(".product-price");
                const rating = $(cardClone).find(".rating");
                const addToCartBtn = $(cardClone).find(".add-to-cart");
                const viewDetailsBtn = $(cardClone).find(".view-details");

                // Bild & Daten
                image.attr("src", (product.images && product.images[0]) || 'pictures/placeholder.jpg');
                image.attr("data-index", i); // für Hover-Rotation
                title.text(product.name);
                meta.text(`${product.category} · ${product.brand}`);
                price.text(`€${product.price}`);
                rating.html(renderStars(product.rating));

                addToCartBtn.on("click", function () {
                    addToCart(product.id, 1);
                });

                // === Modal ===
                const modalId = `productModal${product.id}`;
                const carouselId = `carousel${product.id}`;
                const modalClone = modalTemplate.content.cloneNode(true);
                const modal = $(modalClone).find(".product-modal");

                modal.attr("id", modalId);
                const carousel = modal.find(".product-carousel");
                carousel.attr("id", carouselId);
                carousel.find(".carousel-control-prev").attr("data-bs-target", `#${carouselId}`);
                carousel.find(".carousel-control-next").attr("data-bs-target", `#${carouselId}`);

                modal.find(".modal-title").text(product.name);
                modal.find(".product-description").html(`<strong>Description:</strong><br>${product.description || "No description"}`);
                modal.find(".product-price-text").html(`<strong>Price:</strong> €${product.price}`);
                modal.find(".product-stock").html(`<strong>Stock:</strong> ${product.stock > 0 ? '✅ In Stock' : '❌ Out of Stock'}`);
                modal.find(".product-category").html(`<strong>Category:</strong> ${product.category} / ${product.sub_category}`);
                modal.find(".product-rating").html(`<strong>Rating:</strong> ${renderStars(product.rating)}`);
                modal.find(".attributes").html(`<strong>Attributes:</strong><br>${renderAttributes(product.attributes)}`);

                modal.find(".add-to-cart").on("click", function () {
                    const quantity = parseInt(modal.find(".quantity-input").val()) || 1;
                    addToCart(product.id, quantity);
                });

                // === Karussellbilder ===
                const carouselInner = modal.find(".carousel-inner");
                carouselInner.empty();

                if (product.images && product.images.length) {
                    product.images.forEach((imgSrc, index) => {
                        const isActive = index === 0 ? "active" : "";
                        const item = `
                            <div class="carousel-item ${isActive}">
                                <img src="${imgSrc}" class="d-block w-100" alt="Product image">
                            </div>`;
                        carouselInner.append(item);
                    });
                } else {
                    carouselInner.append(`
                        <div class="carousel-item active">
                            <img src="pictures/placeholder.jpg" class="d-block w-100" alt="No image">
                        </div>`);
                }

                viewDetailsBtn.attr("data-bs-toggle", "modal");
                viewDetailsBtn.attr("data-bs-target", `#${modalId}`);

                grid.append(cardClone);
                modalsContainer.append(modalClone);
            });

            setupHoverRotation(products);
            updateCartCount();
        },
        error: () => {
            showMessage("danger", "Products could not be loaded.");
        }
    });
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

        $card.hover(
            function () {
                intervals[index] = setInterval(() => {
                    currentImg = (currentImg + 1) % images.length;
                    $img.attr("src", images[currentImg]);
                }, 2000);
            },
            function () {
                clearInterval(intervals[index]);
                $img.attr("src", images[0]);
            }
        );
    });
}


function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    let starsHtml = "";

    for (let i = 0; i < fullStars; i++) {
        starsHtml += `<i class="bi bi-star-fill text-warning"></i>`;
    }
    if (halfStar) {
        starsHtml += `<i class="bi bi-star-half text-warning"></i>`;
    }
    while (starsHtml.split("bi-").length - 1 < 5) {
        starsHtml += `<i class="bi bi-star text-warning"></i>`;
    }

    return starsHtml;
}

function renderAttributes(attrString) {
    try {
        const attrObj = JSON.parse(attrString);
        return Object.entries(attrObj).map(([k, v]) => `<div><strong>${k}:</strong> ${v}</div>`).join("");
    } catch (e) {
        return "<i>No attributes</i>";
    }
}

function addToCart(productId, quantity = 1) {
    $.ajax({
        url: "/GamerHaven_WebShop/backend/api/api_products.php?addToCart=" + productId,
        method: "POST",
        data: JSON.stringify({ quantity: quantity }),
        contentType: "application/json",
        success: function (data) {
            if (data.success) {
                showMessage("success", "Product added to cart.");
                updateCartCount();
            } else {
                showMessage("danger", "Could not add to cart.");
            }
        },
        error: function (xhr) {
            if (xhr.status === 401) {
                showMessage("danger", "Please login or register to use the cart.");
            } else {
                showMessage("danger", "An error occurred while adding to cart.");
            }
        }
    });
}

function updateCartCount() {
    $.get("/GamerHaven_WebShop/backend/api/api_products.php?cartCount", function (data) {
        $("#cart-count").text(data.count);
    });
}
