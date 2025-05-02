// ----------------------- DATA FETCHING -----------------------

function loadNavbar() {
  $.ajax({
    url: "../../inclusions/navbar.html",
    method: "GET",
    dataType: "html",
    xhrFields: { withCredentials: true }
  })
    .done(html => {
      // Template klonen
      const $temp = $("<div>").html(html);
      const template = $temp.find("#navbar-template")[0];
      if (!template) return;

      // In den Placeholder einfügen
      $("#navbar-placeholder").empty().append($(template.content).clone());

      // Danach Interceptor und User-Daten laden
      setupCartClickInterceptor();
      fetchUserData();
    })
    .fail((_, status, err) => console.error("Navbar loading failed", status, err));
}

function fetchUserData() {
  $.ajax({
    url: "../../backend/api/ApiGuest.php?me",
    method: "GET",
    dataType: "json",
    xhrFields: { withCredentials: true }
  })
    .done(resp => {
      if (!resp.success) {
        updateUserNavbar({ loggedIn: false });
        return;
      }
      const user = resp.data;
      window.currentUser = user;
      updateUserNavbar(user);
      if (user.loggedIn) updateCartCount();
    })
    .fail((_, status, err) => console.error("User fetch failed", status, err));
}

// ----------------------- NAVBAR UPDATING -----------------------

function updateUserNavbar(user) {
  const $navList = $(".navbar-nav.ms-auto");
  if (!$navList.length) return;

  // Navbar neu aufbauen: nur User-Teil, Cart bleibt im DOM
  // Deshalb nicht $navList.empty(), sondern gezielt den user-container leeren:
  const $userContainer = $("#user-dropdown-container");
  $userContainer.empty();

  if (!user.loggedIn) {
    // Nicht eingeloggt: Login/Register-Dropdown
    $userContainer.append(`
      <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button"
         data-bs-toggle="dropdown" aria-expanded="false">
        <i class="bi bi-person-circle"></i>
      </a>
      <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
        <li><a class="dropdown-item" href="../website/login.html">Login</a></li>
        <li><a class="dropdown-item" href="../website/register.html">Register</a></li>
      </ul>
    `);
    return;
  }

  // Eingeloggt: ersetze den leeren container durch Nav-Items
  $userContainer.replaceWith(`
    <li class="nav-item">
      <a class="nav-link" href="../website/account.html">
        <i class="bi bi-person-circle fs-5"></i> My Account
      </a>
    </li>
    ${user.role === "admin" ? `
      <li class="nav-item">
        <a class="nav-link" href="../website/admin.html">
          <i class="bi bi-gear-fill fs-5"></i> Admin Management
        </a>
      </li>` : ""}
    <li class="nav-item">
      <span class="nav-link">Welcome, ${user.username}</span>
    </li>
    <li class="nav-item">
      <a class="nav-link logout-link text-danger" href="#">
        <i class="bi bi-power fs-5"></i> Logout
      </a>
    </li>
  `);

  // Logout-Handler neu binden
  $(".logout-link").on("click", e => {
    e.preventDefault();
    apiRequest({
      url: "../../backend/api/ApiGuest.php?logout",
      method: "POST",
      successMessage: "Logout successful! Redirecting...",
      onSuccess: () => setTimeout(() => {
        window.location.href = "../website/homepage.html";
      }, 2000)
    });
  });
}

// ----------------------- EVENT INTERCEPTORS -----------------------

function setupCartClickInterceptor() {
  $(document).on("click", "#nav-cart-link", e => {
    e.preventDefault();
    if (window.currentUser?.loggedIn) {
      window.location.href = "cart.html";
    } else {
      showMessage("danger", "Please login to use the cart.");
    }
  });
}

// ----------------------- INITIALIZATION -----------------------

$(document).ready(loadNavbar);
