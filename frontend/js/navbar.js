// ----------------------- DATA FETCHING -----------------------

/**
 * Load the navbar HTML fragment, insert it into the page,
 * then initialize cart interceptor and fetch user data.
 */
function loadNavbar() {
    fetch("../../inclusions/navbar.html")
      .then(res => res.text())
      .then(html => {
        const temp = document.createElement("div");
        temp.innerHTML = html;
        const template = temp.querySelector("#navbar-template");
        if (!template) return;
  
        const placeholder = document.getElementById("navbar-placeholder");
        placeholder.innerHTML = "";
        placeholder.appendChild(template.content.cloneNode(true));
  
        setupCartClickInterceptor(); // Only logged‑in users can access cart.html
        fetchUserData();             // Load current user → updateNavbar
      })
      .catch(err => console.error("Navbar loading failed", err));
  }
  
  /**
   * Retrieve the current user from the API, store globally,
   * update the navbar, and update cart count if logged in.
   */
  function fetchUserData() {
    fetch("../../backend/api/ApiGuest.php?me")
      .then(res => res.json())
      .then(user => {
        window.currentUser = user;
        updateUserNavbar(user);
  
        if (user.loggedIn) {
          const cartCountElement = document.getElementById("cart-count");
          if (cartCountElement) {
            updateCartCount(); // Ensure cart‑count is in the DOM
          } else {
            console.warn("Cart count element not found!");
          }
        }
      })
      .catch(err => console.error("User fetch failed", err));
  }
  
  
  // ----------------------- NAVBAR UPDATING -----------------------
  
  /**
   * Render login/register links or user dropdown based on user status.
   * @param {Object} user
   */
  function updateUserNavbar(user) {
    const container = document.getElementById("user-dropdown-container");
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
  
    // Logged in → show account, admin if applicable, greeting, logout
    const isAdmin = user.role === "admin";
    const linksHtml = `
      ${isAdmin ? `
        <li class="nav-item">
          <a class="nav-link" href="../website/account.html">
            <i class="bi bi-person-circle fs-5"></i> My Account
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="../admin/dashboard.html">
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
  
    // Bind logout action
    document.querySelectorAll(".logout-link").forEach(link => {
      link.addEventListener("click", e => {
        e.preventDefault();
        fetch("../../backend/api/ApiGuest.php?logout", { method: "POST" })
          .then(res => res.json())
          .then(data => {
            if (data.success) location.reload();
          });
      });
    });
  }
  
  
  // ----------------------- EVENT INTERCEPTORS -----------------------
  
  /**
   * Prevent non‑logged‑in users from accessing the cart page.
   */
  function setupCartClickInterceptor() {
    $(document).on("click", "#nav-cart-link", function (e) {
      e.preventDefault();
      if (window.currentUser?.loggedIn) {
        window.location.href = "cart.html";
      } else {
        showMessage("danger", "Please login to use the cart.");
      }
    });
  }
  
  
  // ----------------------- INITIALIZATION -----------------------
  
  loadNavbar();
  