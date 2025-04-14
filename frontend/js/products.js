$(document).ready(function () {
    loadProducts();
});

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

            products.forEach((product, index) => {
                // === Card ===
                const cardClone = productTemplate.content.cloneNode(true);
                const card = $(cardClone).find(".product-card");
                const image = $(cardClone).find(".product-image");
                const title = $(cardClone).find(".card-title");
                const meta = $(cardClone).find(".card-meta");
                const price = $(cardClone).find(".product-price");
                const rating = $(cardClone).find(".rating");
                const addBtn = $(cardClone).find(".add-to-cart");

                const modalId = `productModal${product.id}`;
                card.attr("data-bs-target", `#${modalId}`);
                image.attr("src", product.images[0]).attr("data-index", index);
                title.text(product.name);
                meta.text(`${product.category} · ${product.brand}`);
                price.text(`€${product.price}`);
                rating.html(renderStars(product.rating));
                addBtn.attr("data-id", product.id);

                grid.append(cardClone);

                // === Modal ===
                const modalClone = modalTemplate.content.cloneNode(true);
                const modal = $(modalClone).find(".product-modal");
                modal.attr("id", modalId);

                modal.find(".modal-title").text(product.name);
                modal.find(".product-description").html(`<strong>Description:</strong><br>${product.description || "No description"}`);
                modal.find(".product-price-text").html(`<strong>Price:</strong> €${product.price}`);
                modal.find(".product-stock").html(`<strong>Stock:</strong> ${product.stock > 0 ? '✅ In Stock' : '❌ Out of Stock'}`);
                modal.find(".product-category").html(`<strong>Category:</strong> ${product.category} / ${product.sub_category}`);
                modal.find(".product-rating").html(`<strong>Rating:</strong> ${renderStars(product.rating)}`);
                modal.find(".attributes").html(`<strong>Attributes:</strong><br>${renderAttributes(product.attributes)}`);
                modal.find(".add-to-cart").attr("data-id", product.id);

                // Images (Carousel)
                const carouselInner = modal.find(".carousel-inner");
                product.images.forEach((src, i) => {
                    const activeClass = i === 0 ? "active" : "";
                    const item = `<div class="carousel-item ${activeClass}">
                                    <img src="${src}" class="d-block w-100" style="object-fit: contain; max-height: 320px;">
                                  </div>`;
                    carouselInner.append(item);
                });

                modalsContainer.append(modalClone);
            });

            setupHoverRotation(products);
        },
        error: () => {
            showMessage("danger", "Products could not be loaded.");
        }
    });
}


function setupHoverRotation(products) {
    const intervals = {};

    $(".product-card").each(function () {
        const index = $(this).find(".product-image").data("index");
        const images = products[index].images;
        let currentImg = 0;

        $(this).hover(
            function () {
                const $img = $(this).find(".product-image");
                if (images.length <= 1) return;
                intervals[index] = setInterval(() => {
                    currentImg = (currentImg + 1) % images.length;
                    $img.attr("src", images[currentImg]);
                }, 2000);
            },
            function () {
                clearInterval(intervals[index]);
                const $img = $(this).find(".product-image");
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
