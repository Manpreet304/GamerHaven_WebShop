<?php
declare(strict_types=1);

class AdminLogic {
    // ---------- PRODUCTS ----------
    public function fetchAllProducts(mysqli $conn): array {
        $res = $conn->query(
            "SELECT id, name, description, price, stock, rating, image_url
             FROM products ORDER BY created_at DESC"
        );
        return $res->fetch_all(MYSQLI_ASSOC);
    }

    public function fetchProductById(int $id, mysqli $conn): array {
        $stmt = $conn->prepare(
            "SELECT id, name, description, price, stock, rating, image_url
             FROM products WHERE id = ?"
        );
        $stmt->bind_param("i", $id);
        $stmt->execute();
        return $stmt->get_result()->fetch_assoc() ?: [];
    }

    public function saveProduct(array $data, mysqli $conn): array {
        if (!empty($data['id'])) {
            // UPDATE
            $stmt = $conn->prepare(
                "UPDATE products
                 SET name=?, description=?, price=?, stock=?, rating=?, image_url=?, sub_category=?, brand=?, category=?
                 WHERE id=?"
            );
            $stmt->bind_param(
                "ssdiisss i",
                $data['name'],
                $data['description'],
                $data['price'],
                $data['stock'],
                $data['rating'],
                $data['image_url'],
                $data['sub_category'],
                $data['brand'],
                $data['category'],
                $data['id']
            );
            $ok = $stmt->execute();
            return ['success' => $ok];
        } else {
            // INSERT
            $stmt = $conn->prepare(
                "INSERT INTO products
                 (name, description, price, stock, rating, image_url, sub_category, brand, category, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())"
            );
            $stmt->bind_param(
                "ssdiissss",
                $data['name'],
                $data['description'],
                $data['price'],
                $data['stock'],
                $data['rating'],
                $data['image_url'],
                $data['sub_category'],
                $data['brand'],
                $data['category']
            );
            $ok = $stmt->execute();
            return ['success' => $ok, 'id' => $conn->insert_id];
        }
    }

    public function deleteProduct(int $id, mysqli $conn): array {
        $stmt = $conn->prepare("DELETE FROM products WHERE id = ?");
        $stmt->bind_param("i", $id);
        $ok = $stmt->execute();
        return ['success' => $ok];
    }

    // ---------- CUSTOMERS ----------
    public function fetchAllCustomers(mysqli $conn): array {
        $res = $conn->query(
            "SELECT id, username, email, is_active
             FROM users WHERE role = 'user'
             ORDER BY created_at DESC"
        );
        return $res->fetch_all(MYSQLI_ASSOC);
    }

    public function toggleCustomerActive(int $id, mysqli $conn): array {
        $stmt = $conn->prepare(
            "UPDATE users SET is_active = NOT is_active WHERE id = ?"
        );
        $stmt->bind_param("i", $id);
        $ok = $stmt->execute();
        return ['success' => $ok];
    }

    // ---------- VOUCHERS ----------
    public function fetchAllVouchers(mysqli $conn): array {
        $res = $conn->query(
            "SELECT id, code, value, remaining_value, is_active, expires_at
             FROM vouchers ORDER BY created_at DESC"
        );
        return $res->fetch_all(MYSQLI_ASSOC);
    }

    public function fetchVoucherById(int $id, mysqli $conn): array {
        $stmt = $conn->prepare(
            "SELECT id, code, value, remaining_value, is_active, expires_at
             FROM vouchers WHERE id = ?"
        );
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

    public function saveVoucher(array $data, mysqli $conn): array {
        if (!empty($data['id'])) {
            // UPDATE
            $stmt = $conn->prepare(
                "UPDATE vouchers
                 SET code=?, value=?, remaining_value=?, is_active=?, expires_at=?
                 WHERE id=?"
            );
            $stmt->bind_param(
                "sddi si",
                $data['code'],
                $data['value'],
                $data['remaining_value'],
                $data['is_active'],
                $data['expires_at'],
                $data['id']
            );
            $ok = $stmt->execute();
            return ['success' => $ok];
        } else {
            // INSERT
            $code = $this->generateCode();
            $stmt = $conn->prepare(
                "INSERT INTO vouchers
                 (code, value, remaining_value, is_active, expires_at, created_at)
                 VALUES (?, ?, ?, ?, ?, NOW())"
            );
            $stmt->bind_param(
                "sd ids",
                $code,
                $data['value'],
                $data['value'],    // at creation remaining = full value
                $data['is_active'],
                $data['expires_at']
            );
            $ok = $stmt->execute();
            return ['success' => $ok, 'id' => $conn->insert_id];
        }
    }

    public function deleteVoucher(int $id, mysqli $conn): array {
        $stmt = $conn->prepare("DELETE FROM vouchers WHERE id = ?");
        $stmt->bind_param("i", $id);
        $ok = $stmt->execute();
        return ['success' => $ok];
    }
}
