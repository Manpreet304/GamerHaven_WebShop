function loadNavbar() {
    fetch("../../inclusions/navbar.html")
        .then(response => response.text())
        .then(data => {
            const tempContainer = document.createElement("div");
            tempContainer.innerHTML = data;

            const template = tempContainer.querySelector("#navbar-template");
            if (!template) return;

            const navbarPlaceholder = document.getElementById("navbar-placeholder");
            navbarPlaceholder.innerHTML = "";
            navbarPlaceholder.appendChild(template.content.cloneNode(true));

            // Eventlistener für Cart-Link NACH dem Einfügen setzen
            setupCartClickInterceptor();

            // Danach User-Daten laden
            fetch("../../backend/api/api_guest.php?me")
                .then(res => res.json())
                .then(user => {
                    updateUserNavbar(user);
                    window.currentUser = user; // Global für Cart-Intercept
                })
                .catch(err => console.error("User fetch failed", err));
        })
        .catch(error => console.error("Navbar loading failed", error));
}

function updateUserNavbar(user) {
    const container = document.getElementById("user-dropdown-container");
    if (!container) return;

    if (!user.loggedIn) {
        container.innerHTML = `
            <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button"
               data-bs-toggle="dropdown" aria-expanded="false">
                <i class="bi bi-person-circle"></i>
            </a>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                <li><a class="dropdown-item" href="../website/login.html">Login</a></li>
                <li><a class="dropdown-item" href="../website/register.html">Register</a></li>
            </ul>
        `;
        return;
    }

    let links = "";

    if (user.role === "user") {
        links += `
            <li class="nav-item">
                <a class="nav-link" href="../website/account.html" title="My Account">
                    <i class="bi bi-person-circle fs-5"></i> My Account
                </a>
            </li>`;
    } else if (user.role === "admin") {
        links += `
            <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" id="adminDropdown" role="button"
                   data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="bi bi-person-circle fs-5"></i> Admin Management
                </a>
                <ul class="dropdown-menu" aria-labelledby="adminDropdown">
                    <li><a class="dropdown-item" href="../admin/products.html"><i class="bi bi-pencil-square"></i> Edit Products</a></li>
                    <li><a class="dropdown-item" href="../admin/customers.html"><i class="bi bi-person-lines-fill"></i> Manage Customers</a></li>
                    <li><a class="dropdown-item" href="../admin/vouchers.html"><i class="bi bi-card-checklist"></i> Manage Vouchers</a></li>
                </ul>
            </li>`;
    }

    // Für eingeloggte Benutzer oder Admin - "Welcome" und Logout
    links += `
        <li class="nav-item">
            <span class="nav-link">Welcome, ${user.username}</span>
        </li>
        <li class="nav-item">
            <a class="nav-link logout-link text-danger" href="#" title="Logout">
                <i class="bi bi-power fs-5"></i> Logout
            </a>
        </li>`;

    container.outerHTML = links;

    // Logout-Eventlistener
    document.querySelectorAll(".logout-link").forEach(link => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            fetch("../../backend/api/api_guest.php?logout", {
                method: "POST"
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) location.reload();
            });
        });
    });
}

function setupCartClickInterceptor() {
    $(document).on("click", "#nav-cart-link", function (e) {
        e.preventDefault();

        // Prüfen, ob der Benutzer eingeloggt ist
        if (window.currentUser && window.currentUser.loggedIn) {
            window.location.href = "cart.html";
        } else {
            showMessage("danger", "Please login to use the cart.");
        }
    });
}

loadNavbar();
