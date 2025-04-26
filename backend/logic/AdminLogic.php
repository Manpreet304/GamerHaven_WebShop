<?php
// logic/AdminLogic.php
declare(strict_types=1);

class AdminLogic {
    private string $imageDir = __DIR__ . '/../../pictures/';

    // ----- PRODUCTS -----
    public function fetchAllProducts(mysqli $conn): array {
        $res = $conn->query("
            SELECT id, name, description, price, stock, rating,
                   image_url, attributes, brand, category, sub_category
            FROM products
            ORDER BY created_at DESC
        ");
        return $res->fetch_all(MYSQLI_ASSOC);
    }

    public function fetchProductById(int $id, mysqli $conn): array {
        $stmt = $conn->prepare("
            SELECT id, name, description, price, stock, rating,
                   image_url, attributes, brand, category, sub_category
            FROM products
            WHERE id = ?
        ");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc() ?: [];
    }

    public function saveProduct(array $post, array $files, mysqli $conn): array {
        // Bilder hochladen
        $newImages = [];
        if (!empty($files['product_images']['name'] ?? null)) {
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

        $isUpdate = isset($post['id']) && (int)$post['id'] > 0;
        $existing = $isUpdate ? $this->fetchProductById((int)$post['id'], $conn) : [];

        // Alte Bilder beibehalten, wenn keine neuen hochgeladen
        $oldImages = !empty($existing['image_url']) ? json_decode($existing['image_url'], true) : [];
        $imagesToSave = !empty($newImages) ? $newImages : $oldImages;
        $jsonImages = json_encode($imagesToSave, JSON_UNESCAPED_SLASHES);

        // Attribute vorbereiten
        if (isset($post['attributes'])) {
            $attrsArr = json_decode($post['attributes'], true);
            $jsonAttributes = json_encode(is_array($attrsArr) ? $attrsArr : [], JSON_UNESCAPED_UNICODE);
        } else {
            $jsonAttributes = $existing['attributes'] ?? '[]';
        }

        if ($isUpdate) {
            $stmt = $conn->prepare("
                UPDATE products SET
                  name=?, description=?, price=?, stock=?, rating=?,
                  image_url=?, sub_category=?, brand=?, category=?, attributes=?
                WHERE id=?
            ");
            $stmt->bind_param(
                "ssdidsssssi",
                $post['name'], $post['description'], $post['price'],
                $post['stock'], $post['rating'], $jsonImages,
                $post['sub_category'], $post['brand'], $post['category'],
                $jsonAttributes, $post['id']
            );
            $ok = $stmt->execute();
            return ['success' => $ok];
        } else {
            $stmt = $conn->prepare("
                INSERT INTO products
                  (name, description, price, stock, rating,
                   image_url, sub_category, brand, category, attributes, created_at)
                VALUES(?,?,?,?,?,?,?,?,?,?,NOW())
            ");
            $stmt->bind_param(
                "ssdidsssss",
                $post['name'], $post['description'], $post['price'],
                $post['stock'], $post['rating'], $jsonImages,
                $post['sub_category'], $post['brand'], $post['category'],
                $jsonAttributes
            );
            $ok = $stmt->execute();
            return ['success' => $ok, 'id' => $conn->insert_id];
        }
    }

    public function deleteProduct(int $id, mysqli $conn): bool {
        $stmt = $conn->prepare("DELETE FROM products WHERE id = ?");
        $stmt->bind_param("i", $id);
        return $stmt->execute();
    }

    // ----- CUSTOMERS -----
    public function fetchAllCustomers(mysqli $conn): array {
        $res = $conn->query("
            SELECT id, firstname, lastname, email, username, role, is_active
            FROM users
            ORDER BY created_at DESC
        ");
        return $res->fetch_all(MYSQLI_ASSOC);
    }

    public function fetchCustomerById(int $id, mysqli $conn): array {
        $stmt = $conn->prepare("
            SELECT id, firstname, lastname, email, username, salutation,
                   role, is_active, address, zip_code, city, country
            FROM users
            WHERE id = ?
        ");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc() ?: [];
    }

    public function toggleCustomerActive(int $id, mysqli $conn): bool {
        $stmt = $conn->prepare("UPDATE users SET is_active = NOT is_active WHERE id = ?");
        $stmt->bind_param("i", $id);
        return $stmt->execute();
    }

    public function deleteCustomer(int $id, mysqli $conn): bool {
        $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
        $stmt->bind_param("i", $id);
        return $stmt->execute();
    }

    public function saveCustomer(array $d, mysqli $conn): array {
        $isActiveStr = $d['is_active'] ? 'true' : 'false';

        if (!empty($d['id'])) {
            // UPDATE
            if (!empty($d['password'])) {
                $hash = password_hash($d['password'], PASSWORD_DEFAULT);
                $stmt = $conn->prepare("
                    UPDATE users SET
                      firstname=?, lastname=?, email=?, username=?,
                      salutation=?, role=?, is_active=?,
                      address=?, zip_code=?, city=?, country=?, password=?
                    WHERE id=?
                ");
                $stmt->bind_param(
                    "ssssssssssssi",
                    $d['firstname'], $d['lastname'], $d['email'], $d['username'],
                    $d['salutation'], $d['role'], $isActiveStr,
                    $d['address'], $d['zip_code'], $d['city'], $d['country'],
                    $hash, $d['id']
                );
            } else {
                $stmt = $conn->prepare("
                    UPDATE users SET
                      firstname=?, lastname=?, email=?, username=?,
                      salutation=?, role=?, is_active=?,
                      address=?, zip_code=?, city=?, country=?
                    WHERE id=?
                ");
                $stmt->bind_param(
                    "ssssssssssi",
                    $d['firstname'], $d['lastname'], $d['email'], $d['username'],
                    $d['salutation'], $d['role'], $isActiveStr,
                    $d['address'], $d['zip_code'], $d['city'], $d['country'],
                    $d['id']
                );
            }
            $ok = $stmt->execute();
            return ['success' => $ok];
        } else {
            // INSERT
            $hash = password_hash($d['password'] ?? bin2hex(random_bytes(8)), PASSWORD_DEFAULT);
            $stmt = $conn->prepare("
                INSERT INTO users
                  (firstname, lastname, email, username, password,
                   salutation, role, is_active, address, zip_code, city, country, created_at)
                VALUES(?,?,?,?,?,?,?,?,?,?,?,?,NOW())
            ");
            $stmt->bind_param(
                "ssssssssssss",
                $d['firstname'], $d['lastname'], $d['email'], $d['username'],
                $hash, $d['salutation'], $d['role'], $isActiveStr,
                $d['address'], $d['zip_code'], $d['city'], $d['country']
            );
            $ok = $stmt->execute();
            return ['success' => $ok, 'id' => $conn->insert_id];
        }
    }

    // ----- ORDERS -----
    public function fetchOrdersByCustomer(int $userId, mysqli $conn): array {
        $stmt = $conn->prepare("
            SELECT id, created_at, subtotal, discount, shipping_amount, total_amount
            FROM orders
            WHERE user_id = ?
            ORDER BY created_at DESC
        ");
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    public function fetchOrderItems(int $orderId, mysqli $conn): array {
        $stmt = $conn->prepare("
            SELECT id, name_snapshot, price_snapshot, quantity, total_price
            FROM order_items
            WHERE order_id = ?
        ");
        $stmt->bind_param("i", $orderId);
        $stmt->execute();
        return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    }

    public function removeOrderItem(int $itemId, int $qty, mysqli $conn): bool {
        // 1) Aktuelles Item holen
        $stmt = $conn->prepare("SELECT order_id, quantity, price_snapshot FROM order_items WHERE id = ?");
        $stmt->bind_param("i", $itemId);
        $stmt->execute();
        $item = $stmt->get_result()->fetch_assoc();
    
        if (!$item) return false;
    
        $orderId = (int)$item['order_id'];
        $currentQty = (int)$item['quantity'];
        $pricePerUnit = (float)$item['price_snapshot'];
    
        if ($qty >= $currentQty) {
            // Komplett löschen, wenn zu viel oder alles gelöscht wird
            $del = $conn->prepare("DELETE FROM order_items WHERE id = ?");
            $del->bind_param("i", $itemId);
            $del->execute();
        } else {
            // Nur Teil entfernen → Update
            $newQty = $currentQty - $qty;
            $newTotal = $newQty * $pricePerUnit;
    
            $upd = $conn->prepare("UPDATE order_items SET quantity = ?, total_price = ? WHERE id = ?");
            $upd->bind_param("idi", $newQty, $newTotal, $itemId);
            $upd->execute();
        }
    
        // Neue Summen aktualisieren
        $rs = $conn->prepare("
            SELECT COALESCE(SUM(total_price),0) AS subtotal
            FROM order_items
            WHERE order_id = ?
        ");
        $rs->bind_param("i", $orderId);
        $rs->execute();
        $subtotal = (float)$rs->get_result()->fetch_assoc()['subtotal'];
    
        $shipping = $subtotal >= 300.0 ? 0.0 : 9.90;
        $total = $subtotal + $shipping;
    
        $us = $conn->prepare("
            UPDATE orders
               SET subtotal=?, shipping_amount=?, total_amount=?
            WHERE id=?
        ");
        $us->bind_param("dddi", $subtotal, $shipping, $total, $orderId);
        return $us->execute();
    }    

    // ----- VOUCHERS -----
    public function fetchAllVouchers(mysqli $conn): array {
        $res = $conn->query("
            SELECT id, code, value, remaining_value, is_active, expires_at
            FROM vouchers
            ORDER BY created_at DESC
        ");
        return $res->fetch_all(MYSQLI_ASSOC);
    }

    public function fetchVoucherById(int $id, mysqli $conn): array {
        $stmt = $conn->prepare("
            SELECT id, code, value, remaining_value, is_active, expires_at
            FROM vouchers
            WHERE id = ?
        ");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc() ?: [];
    }

    private function generateCode(): string {
        $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        $code = '';
        for ($i = 0; $i < 5; $i++) {
            $code .= $chars[random_int(0, strlen($chars) - 1)];
        }
        return $code;
    }

    public function getNewVoucherCode(): string {
        return $this->generateCode();
    }

    public function saveVoucher(array $d, mysqli $conn): array {
        if (!empty($d['id'])) {
            $stmt = $conn->prepare("
                UPDATE vouchers
                SET code=?, value=?, remaining_value=?, is_active=?, expires_at=?
                WHERE id=?
            ");
            $remaining = $d['remaining_value'] ?? $d['value'];
            $stmt->bind_param("sddisi",
                $d['code'], $d['value'], $remaining,
                $d['is_active'], $d['expires_at'], $d['id']
            );
            $stmt->execute();
            return ['success' => true];
        } else {
            $code = $this->generateCode();
            $stmt = $conn->prepare("
                INSERT INTO vouchers
                (code, value, remaining_value, is_active, expires_at, created_at)
                VALUES(?,?,?,?,?,NOW())
            ");
            $stmt->bind_param("sddis",
                $code, $d['value'], $d['value'],
                $d['is_active'], $d['expires_at']
            );
            $stmt->execute();
            return ['success' => true, 'id' => $conn->insert_id];
        }
    }

    public function deleteVoucher(int $id, mysqli $conn): bool {
        $stmt = $conn->prepare("UPDATE vouchers SET is_active = 0 WHERE id = ?");
        $stmt->bind_param("i", $id);
        return $stmt->execute();
    }
}
