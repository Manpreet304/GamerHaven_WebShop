// /services/navbar.js

// ----------------------- DATA FETCHING -----------------------

/**
 * Load the navbar HTML and initialize user/cart logic.
 */
function loadNavbar() {
  fetch("../../inclusions/navbar.html")
    .then(function(response) {
      return response.text();
    })
    .then(function(html) {
      var temp = document.createElement("div");
      temp.innerHTML = html;
      var template = temp.querySelector("#navbar-template");
      if (!template) return;

      var placeholder = document.getElementById("navbar-placeholder");
      placeholder.innerHTML = "";
      placeholder.appendChild(template.content.cloneNode(true));

      setupCartClickInterceptor(); // Only logged-in users can access cart.html
      fetchUserData();             // Load current user and update navbar
    })
    .catch(function(error) {
      console.error("Failed to load navbar:", error);
    });
}

/**
 * Fetches the current user data.
 */
function fetchUserData() {
  fetch("../../backend/api/ApiGuest.php?me")
    .then(function(response) {
      return response.json();
    })
    .then(function(user) {
      window.currentUser = user;
      updateUserNavbar(user);

      if (user.loggedIn) {
        var cartCountElement = document.getElementById("cart-count");
        if (cartCountElement) {
          updateCartCount(); // Only if user is logged in
        } else {
          console.warn("Cart count element not found!");
        }
      }
    })
    .catch(function(error) {
      console.error("Failed to fetch user data:", error);
    });
}

// ----------------------- NAVBAR UPDATING -----------------------

/**
 * Updates navbar links depending on user login status.
 */
function updateUserNavbar(user) {
  var container = document.getElementById("user-dropdown-container");
  if (!container) return;

  if (!user.loggedIn) {
    // Not logged in → show login/register
    container.innerHTML = `
      <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown">
        <i class="bi bi-person-circle"></i>
      </a>
      <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
        <li><a class="dropdown-item" href="../website/login.html">Login</a></li>
        <li><a class="dropdown-item" href="../website/register.html">Register</a></li>
      </ul>
    `;
    return;
  }

  // Logged in → show account links
  var isAdmin = user.role === "admin";
  var linksHtml = `
    ${isAdmin ? `
      <li class="nav-item">
        <a class="nav-link" href="../website/account.html">
          <i class="bi bi-person-circle fs-5"></i> My Account
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="../website/admin.html">
          <i class="bi bi-gear-fill fs-5"></i> Admin Management
        </a>
      </li>
    ` : `
      <li class="nav-item">
        <a class="nav-link" href="../website/account.html">
          <i class="bi bi-person-circle fs-5"></i> My Account
        </a>
      </li>
    `}
    <li class="nav-item">
      <span class="nav-link">Welcome, ${user.username}</span>
    </li>
    <li class="nav-item">
      <a class="nav-link logout-link text-danger" href="#">
        <i class="bi bi-power fs-5"></i> Logout
      </a>
    </li>
  `;
  container.outerHTML = linksHtml;

  // Bind logout button
  document.querySelectorAll(".logout-link").forEach(function(link) {
    link.addEventListener("click", function(e) {
      e.preventDefault();
      fetch("../../backend/api/ApiGuest.php?logout", { method: "POST" })
        .then(function(response) {
          return response.json();
        })
        .then(function(data) {
          if (data.success) {
            location.reload();
          }
        });
    });
  });
}

// ----------------------- EVENT INTERCEPTORS -----------------------

/**
 * Prevent non-logged-in users from accessing the cart page.
 */
function setupCartClickInterceptor() {
  $(document).on("click", "#nav-cart-link", function(e) {
    e.preventDefault();
    if (window.currentUser?.loggedIn) {
      window.location.href = "cart.html";
    } else {
      showMessage("danger", "Please log in to use the cart.");
    }
  });
}

// ----------------------- INITIALIZATION -----------------------

loadNavbar();
