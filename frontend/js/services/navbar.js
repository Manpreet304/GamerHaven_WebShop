// Navbar und Benutzerdaten automatisch laden
function loadNavbar() {
  $.get("../../inclusions/navbar.html")
    .done(html => {
      const $temp = $("<div>").html(html);
      const template = $temp.find("#navbar-template")[0];
      if (!template) {
        console.warn("Navbar template not found.");
        return;
      }

      $("#navbar-placeholder").empty().append($(template.content).clone());
      setupCartClickInterceptor();
      fetchUserData();
    })
    .fail((_, status, err) => {
      console.error("Navbar loading failed", status, err);
    });
}

// Holt eingeloggten Benutzer (falls vorhanden)
function fetchUserData() {
  $.getJSON("../../backend/api/ApiGuest.php?me")
    .done(resp => {
      const user = resp.success ? resp.data : { loggedIn: false };
      window.currentUser = user;
      updateUserNavbar(user);
      if (user.loggedIn) updateCartCount();
    })
    .fail((_, status, err) => {
      console.error("User fetch failed", status, err);
      updateUserNavbar({ loggedIn: false });
    });
}

// Passt Navbar an Benutzerstatus an
function updateUserNavbar(user) {
  const $userContainer = $("#user-dropdown-container");
  if (!$userContainer.length) return;

  $userContainer.empty();

  if (!user.loggedIn) {
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

  // Logout-Logik
  $(".logout-link").on("click", e => {
    e.preventDefault();
    apiRequest({
      url: "../../backend/api/ApiGuest.php?logout",
      method: "POST",
      successMessage: "Logout successful! Redirecting...",
      onSuccess: () => {
        setTimeout(() => window.location.href = "../website/homepage.html", 2000);
      }
    });
  });
}

// Abfangen des Warenkorb-Links (nur für eingeloggte Nutzer)
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

// Start bei Seitenaufruf
$(document).ready(loadNavbar);