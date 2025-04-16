function loadNavbar() {
    fetch("../../inclusions/navbar.html")
        .then(res => res.text())
        .then(html => {
            const temp = document.createElement("div");
            temp.innerHTML = html;

            const template = temp.querySelector("#navbar-template");
            if (!template) return;

            document.getElementById("navbar-placeholder").innerHTML = "";
            document.getElementById("navbar-placeholder").appendChild(template.content.cloneNode(true));

            setupCartClickInterceptor(); // Nur eingeloggte User → cart.html
            fetchUserData();
        })
        .catch(err => console.error("Navbar loading failed", err));
}

function fetchUserData() {
    fetch("../../backend/api/api_guest.php?me")
        .then(res => res.json())
        .then(user => {
            window.currentUser = user;
            updateUserNavbar(user);
        })
        .catch(err => console.error("User fetch failed", err));
}

function updateUserNavbar(user) {
    const container = document.getElementById("user-dropdown-container");
    if (!container) return;

    // Nicht eingeloggt
    if (!user.loggedIn) {
        container.innerHTML = `
            <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="bi bi-person-circle"></i>
            </a>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                <li><a class="dropdown-item" href="../website/login.html">Login</a></li>
                <li><a class="dropdown-item" href="../website/register.html">Register</a></li>
            </ul>
        `;
        return;
    }

    // Eingeloggt
    const isAdmin = user.role === "admin";
    const links = `
        ${isAdmin ? `
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" id="adminDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="bi bi-person-circle fs-5"></i> Admin Management
          </a>
          <ul class="dropdown-menu" aria-labelledby="adminDropdown">
            <li><a class="dropdown-item" href="../admin/products.html"><i class="bi bi-pencil-square"></i> Edit Products</a></li>
            <li><a class="dropdown-item" href="../admin/customers.html"><i class="bi bi-person-lines-fill"></i> Manage Customers</a></li>
            <li><a class="dropdown-item" href="../admin/vouchers.html"><i class="bi bi-card-checklist"></i> Manage Vouchers</a></li>
          </ul>
        </li>` : `
        <li class="nav-item">
            <a class="nav-link" href="../website/account.html"><i class="bi bi-person-circle fs-5"></i> My Account</a>
        </li>`}

        <li class="nav-item">
            <span class="nav-link">Welcome, ${user.username}</span>
        </li>
        <li class="nav-item">
            <a class="nav-link logout-link text-danger" href="#"><i class="bi bi-power fs-5"></i> Logout</a>
        </li>
    `;
    container.outerHTML = links;

    // Logout Event
    document.querySelectorAll(".logout-link").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            fetch("../../backend/api/api_guest.php?logout", { method: "POST" })
                .then(res => res.json())
                .then(data => data.success && location.reload());
        });
    });
}

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

loadNavbar();
