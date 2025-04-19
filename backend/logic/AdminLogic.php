<?php
declare(strict_types=1);

class AdminLogic {
    private string $imageDir = __DIR__ . '/../../pictures/';

    // ----- PRODUCTS -----
    public function fetchAllProducts(mysqli $conn): array {
        $res = $conn->query(
            "SELECT 
               id, name, description, price, stock, rating,
               image_url, attributes, brand, category, sub_category
             FROM products
             ORDER BY created_at DESC"
        );
        return $res->fetch_all(MYSQLI_ASSOC);
    }

    public function fetchProductById(int $id, mysqli $conn): array {
        $stmt = $conn->prepare(
            "SELECT 
               id, name, description, price, stock, rating,
               image_url, attributes, brand, category, sub_category
             FROM products
             WHERE id = ?"
        );
        $stmt->bind_param("i", $id);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc() ?: [];
    }

    public function saveProduct(array $post, array $files, mysqli $conn): array {
        // 1) Bilder verarbeiten (unchanged)
        $newImages = [];
        if (!empty($files['product_images']['name'])) {
            foreach ($files['product_images']['error'] as $i => $err) {
                if ($err === UPLOAD_ERR_OK) {
                    $tmp = $files['product_images']['tmp_name'][$i];
                    $ext = strtolower(pathinfo($files['product_images']['name'][$i], PATHINFO_EXTENSION));
                    if ($ext !== 'jpg') continue;
                    $uniq = uniqid('img_', true) . '.jpg';
                    move_uploaded_file($tmp, $this->imageDir . $uniq);
                    $newImages[] = "pictures/$uniq";
                }
            }
        }

        // 2) Attributes JSON übernehmen
        // Wenn das Frontend ein JSON liefert, benutzen wir es; bei Update ohne neues JSON behalten wir den alten Wert
        $incomingJson = $post['attributes'] ?? null;

        $isUpdate = !empty($post['id']);
        $existing = $isUpdate
            ? $this->fetchProductById((int)$post['id'], $conn)
            : [];

        // Bilder-Liste zusammenstellen
        $oldImages = $existing['image_url'] ? json_decode($existing['image_url'], true) : [];
        $imagesToSave = !empty($newImages) ? $newImages : $oldImages;
        $jsonImages = json_encode($imagesToSave, JSON_UNESCAPED_SLASHES);

        // Attributes final bestimmen
        if ($isUpdate) {
            if ($incomingJson !== null) {
                // Neu: wir validieren und re-encoden
                $attrsArr = json_decode($incomingJson, true);
                $jsonAttributes = json_encode(
                    is_array($attrsArr) ? $attrsArr : [],
                    JSON_UNESCAPED_UNICODE
                );
            } else {
                // Keine Änderung: alter JSON in DB behalten
                $jsonAttributes = $existing['attributes'] ?? '[]';
            }
        } else {
            // Insert: wenn kein JSON, leeres Objekt
            if ($incomingJson !== null) {
                $attrsArr = json_decode($incomingJson, true);
                $jsonAttributes = json_encode(
                    is_array($attrsArr) ? $attrsArr : [],
                    JSON_UNESCAPED_UNICODE
                );
            } else {
                $jsonAttributes = '[]';
            }
        }

        // 3) DB speichern
        if ($isUpdate) {
            $stmt = $conn->prepare(
                "UPDATE products SET
                   name=?, description=?, price=?, stock=?, rating=?,
                   image_url=?, sub_category=?, brand=?, category=?, attributes=?
                 WHERE id=?"
            );
            $stmt->bind_param(
                "ssdidsssssi",
                $post['name'],
                $post['description'],
                $post['price'],             // d = double (decimal(3,2))
                $post['stock'],             // i = integer
                $post['rating'],            // d = double
                $jsonImages,
                $post['sub_category'],
                $post['brand'],
                $post['category'],
                $jsonAttributes,
                $post['id']
            );
            $ok = $stmt->execute();
            return ['success' => $ok];
        } else {
            $stmt = $conn->prepare(
                "INSERT INTO products
                   (name, description, price, stock, rating, image_url, sub_category, brand, category, attributes, created_at)
                 VALUES(?,?,?,?,?,?,?,?,?,?,NOW())"
            );
            $stmt->bind_param(
                "ssdidsssss",
                $post['name'],
                $post['description'],
                $post['price'],
                $post['stock'],
                $post['rating'],
                $jsonImages,
                $post['sub_category'],
                $post['brand'],
                $post['category'],
                $jsonAttributes
            );
            $ok = $stmt->execute();
            return ['success' => $ok, 'id' => $conn->insert_id];
        }
    }

    public function deleteProduct(int $id, mysqli $conn): array {
        $stmt = $conn->prepare("DELETE FROM products WHERE id=?");
        $stmt->bind_param("i", $id);
        $ok = $stmt->execute();
        return ['success' => $ok];
    }

    // ----- CUSTOMERS -----
    public function fetchAllCustomers(mysqli $conn): array {
        $res = $conn->query(
            "SELECT id, firstname, lastname, email, username, role, address, zip_code, city, country, salutation, is_active
             FROM users
             ORDER BY created_at DESC"
        );
        return $res->fetch_all(MYSQLI_ASSOC);
    }

    public function fetchCustomerById(int $id, mysqli $conn): array {
        $stmt = $conn->prepare(
            "SELECT id, firstname, lastname, email, username, salutation, role, is_active, address, zip_code, city, country
             FROM users
             WHERE id = ?"
        );
        $stmt->bind_param("i", $id);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc() ?: [];
    }

    public function toggleCustomerActive(int $id, mysqli $conn): array {
        $stmt = $conn->prepare("UPDATE users SET is_active = NOT is_active WHERE id = ?");
        $stmt->bind_param("i", $id);
        $ok = $stmt->execute();
        return ['success' => $ok];
    }

    public function saveCustomer(array $d, mysqli $conn): array {
        if (!empty($d['id'])) {
            if (!empty($d['password'])) {
                $hash = password_hash($d['password'], PASSWORD_DEFAULT);
                $stmt = $conn->prepare(
                    "UPDATE users SET
                       firstname=?, lastname=?, email=?, username=?, salutation=?, role=?, is_active=?, address=?, zip_code=?, city=?, country=?, password=?
                     WHERE id=?"
                );
                $stmt->bind_param("ssssssiissssi",
                    $d['firstname'], $d['lastname'], $d['email'], $d['username'],
                    $d['salutation'], $d['role'], $d['is_active'],
                    $d['address'], $d['zip_code'], $d['city'], $d['country'],
                    $hash, $d['id']
                );
            } else {
                $stmt = $conn->prepare(
                    "UPDATE users SET
                       firstname=?, lastname=?, email=?, username=?, salutation=?, role=?, is_active=?, address=?, zip_code=?, city=?, country=?
                     WHERE id=?"
                );
                $stmt->bind_param("ssssssiisssi",
                    $d['firstname'], $d['lastname'], $d['email'], $d['username'],
                    $d['salutation'], $d['role'], $d['is_active'],
                    $d['address'], $d['zip_code'], $d['city'], $d['country'],
                    $d['id']
                );
            }
            $ok = $stmt->execute();
            return ['success' => $ok];
        } else {
            $hash = password_hash($d['password'] ?? bin2hex(random_bytes(8)), PASSWORD_DEFAULT);
            $stmt = $conn->prepare(
                "INSERT INTO users
                   (firstname, lastname, email, username, password, salutation, role, is_active, address, zip_code, city, country, created_at)
                 VALUES(?,?,?,?,?,?,?,?,?,?,?, ?, NOW())"
            );
            $stmt->bind_param("ssssssisissss",
                $d['firstname'], $d['lastname'], $d['email'], $d['username'],
                $hash, $d['salutation'], $d['role'], $d['is_active'],
                $d['address'], $d['zip_code'], $d['city'], $d['country']
            );
            $ok = $stmt->execute();
            return ['success' => $ok, 'id' => $conn->insert_id];
        }
    }

    // ----- VOUCHERS -----
    public function fetchAllVouchers(mysqli $conn): array {
        $res = $conn->query(
            "SELECT id, code, value, remaining_value, is_active, expires_at
             FROM vouchers
             ORDER BY created_at DESC"
        );
        return $res->fetch_all(MYSQLI_ASSOC);
    }

    public function fetchVoucherById(int $id, mysqli $conn): array {
        $stmt = $conn->prepare(
            "SELECT id, code, value, remaining_value, is_active, expires_at
             FROM vouchers
             WHERE id = ?"
        );
        $stmt->bind_param("i", $id);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc() ?: [];
    }

    private function generateCode(): string {
        $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        $c = '';
        for ($i = 0; $i < 5; $i++) {
            $c .= $chars[random_int(0, strlen($chars) - 1)];
        }
        return $c;
    }

    public function saveVoucher(array $d, mysqli $conn): array {
        if (!empty($d['id'])) {
            $stmt = $conn->prepare(
              "UPDATE vouchers SET code=?,value=?,remaining_value=?,is_active=?,expires_at=? WHERE id=?"
            );
            $remaining = $d['remaining_value'] ?? $d['value'];
            $stmt->bind_param("sddisi",
              $d['code'], $d['value'], $remaining, $d['is_active'], $d['expires_at'], $d['id']
            );
            $ok = $stmt->execute();
            return ['success' => $ok];
        } else {
            $code = $this->generateCode();
            $stmt = $conn->prepare(
              "INSERT INTO vouchers(code,value,remaining_value,is_active,expires_at,created_at)
               VALUES(?,?,?,?,?, NOW())"
            );
            $stmt->bind_param("sddis",
              $code, $d['value'], $d['value'], $d['is_active'], $d['expires_at']
            );
            $ok = $stmt->execute();
            return ['success' => $ok, 'id' => $conn->insert_id];
        }
    }

    public function deleteVoucher(int $id, mysqli $conn): array {
        $stmt = $conn->prepare("DELETE FROM vouchers WHERE id=?");
        $stmt->bind_param("i", $id);
        $ok = $stmt->execute();
        return ['success' => $ok];
    }
}
