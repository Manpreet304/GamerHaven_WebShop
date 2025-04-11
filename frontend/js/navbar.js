function loadNavbar() {
    fetch("../../inclusions/navbar.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("navbar-placeholder").innerHTML = data;

            fetch("/GamerHaven_WebShop/backend/api/api_guest.php?me")
                .then(res => res.json())
                .then(user => {
                    const container = document.getElementById("user-dropdown-container");
                    if (!container) return;

                    if (!user.loggedIn) {
                        // Guest view: login/register
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
                    } else {
                        let links = "";

                        if (user.role === "user") {
                            links += `
                                <li class="nav-item">
                                    <a class="nav-link" href="../website/account.html" title="My Account">
                                        <i class="bi bi-person-circle fs-5"></i>
                                    </a>
                                </li>
                            `;
                        } else if (user.role === "admin") {
                            // Admin Dropdown Menu
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
                                </li>
                            `;
                        }

                        links += `
                            <li class="nav-item">
                                <span class="nav-link">Welcome, ${user.username}</span>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link logout-link text-danger" href="#" title="Logout">
                                    <i class="bi bi-power fs-5"></i>
                                </a>
                            </li>
                        `;

                        container.outerHTML = links;

                        // Logout Button-Handler
                        document.querySelectorAll(".logout-link").forEach(link => {
                            link.addEventListener("click", (e) => {
                                e.preventDefault();

                                // Logout-Request
                                fetch("/GamerHaven_WebShop/backend/api/api_guest.php?logout", {
                                    method: "POST"
                                })
                                .then(response => response.json())  // Antwort vom Server
                                .then(data => {
                                    if (data.success) {
                                        // Wenn erfolgreich ausgeloggt, Navbar neu laden
                                        location.reload();  // Seite neu laden, damit die Navbar aktualisiert wird
                                    } else {
                                        console.error("Logout failed:", data.error);
                                    }
                                })
                                .catch(error => {
                                    console.error("Error during logout:", error);
                                });
                            });
                        });
                    }
                });
        })
        .catch(error => console.error("Error loading navbar:", error));
}

loadNavbar();
