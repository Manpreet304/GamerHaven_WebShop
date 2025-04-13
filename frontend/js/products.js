$(document).ready(function () {
    loadProducts();
});

function loadProducts() {
    $.ajax({
        url: "/GamerHaven_WebShop/backend/api/api_products.php",
        method: "GET",
        success: function (products) {
            const grid = $("#productGrid");
            grid.empty();

            products.forEach((product, index) => {
                const card = `
                    <div class="col-md-4">
                        <div class="card h-100 shadow-sm product-card" data-index="${index}">
                            <div class="img-wrapper text-center">
                                <img src="${product.images[0]}" class="product-image" data-index="${index}">
                            </div>
                            <div class="card-body text-center">
                                <h5 class="card-title">${product.name}</h5>
                                <p class="card-text text-muted">${product.category} · ${product.brand}</p>
                                <p class="fw-bold">€${product.price}</p>
                                <div class="rating mb-2">
                                    ${renderStars(product.rating)}
                                </div>
                                <button class="btn btn-add-to-cart w-100 add-to-cart" data-id="${product.id}">
                                    <i class="bi bi-cart-plus me-1"></i> Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                `;

                grid.append(card);
            });

            // Speichere Produktbilder im Cache
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
        const index = $(this).data("index");
        const images = products[index].images;
        let currentImg = 0;

        $(this).hover(
            function () {
                const $img = $(this).find(".product-image");
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
