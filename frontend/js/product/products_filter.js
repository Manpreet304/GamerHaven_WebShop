// products.filters.js
(function(window, $) {
    const ProductsFilters = {
      collectFilters() {
        return {
          category: $("input[name='category']:checked").val() || "",
          brand: $("#filter-brand input:checked").map((_, el) => el.value).get().join(","),
          rating: $("#filter-rating").val(),
          stock: $("#filter-stock").val(),
          priceMin: $("#priceMin").val(),
          priceMax: $("#priceMax").val()
        };
      },
  
      resetAllFilters() {
        $("#filter-brand input, #filter-category input").prop("checked", false);
        $("#priceMin, #priceMax, #filter-rating, #filter-stock").val("");
      },
  
      renderFilters(products, filters = {}) {
        const selCat = filters.category || "";
        const cats = [...new Set(products.map(p => p.category))].sort();
  
        const catHtml = [
          `<div class="form-check">
             <input class="form-check-input" type="radio" name="category" value="" ${!selCat ? "checked" : ""}>
             <label class="form-check-label">All Products</label>
           </div>`,
          ...cats.map(c => `
            <div class="form-check">
              <input class="form-check-input" type="radio" name="category" value="${c}" ${selCat === c ? "checked" : ""}>
              <label class="form-check-label">${c}</label>
            </div>
          `)
        ];
        $("#filter-category").html(catHtml.join(""));
  
        const filtered = selCat ? products.filter(p => p.category === selCat) : products;
        const brands = [...new Set(filtered.map(p => p.brand))].sort();
        const selBrands = (filters.brand || "").split(",");
  
        const brandHtml = brands.map(b => `
          <div class="form-check">
            <input class="form-check-input" type="checkbox" value="${b}" ${selBrands.includes(b) ? "checked" : ""}>
            <label class="form-check-label">${b}</label>
          </div>
        `);
        $("#filter-brand").html(brandHtml.join(""));
      }
    };
  
    window.ProductsFilters = ProductsFilters;
  })(window, jQuery);
  