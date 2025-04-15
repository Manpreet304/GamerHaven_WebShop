<?php

class ProductLogic {
    public function getAllProducts($conn): array {
        $stmt = $conn->prepare("SELECT id, name, description, price, stock, brand, category, sub_category, attributes, image_url, rating FROM products ORDER BY created_at DESC");
        $stmt->execute();
        $result = $stmt->get_result();
        $products = [];

        while ($row = $result->fetch_assoc()) {
            $row["images"] = $this->processImages($row["image_url"]);
            unset($row["image_url"]);
            $products[] = $row;
        }
        return $products;
    }

    public function getFilteredProducts($conn, array $filters): array {
        $sql = "SELECT id, name, description, price, stock, brand, category, sub_category, attributes, image_url, rating FROM products WHERE 1=1";
        $params = [];
        $types = "";

        if (!empty($filters["category"])) {
            $sql .= " AND category = ?";
            $params[] = $filters["category"];
            $types .= "s";
        }

        if (!empty($filters["brand"])) {
            $brands = explode(",", $filters["brand"]);
            $placeholders = implode(",", array_fill(0, count($brands), "?"));
            $sql .= " AND brand IN ($placeholders)";
            $params = array_merge($params, $brands);
            $types .= str_repeat("s", count($brands));
        }

        if (!empty($filters["priceMin"])) {
            $sql .= " AND price >= ?";
            $params[] = floatval($filters["priceMin"]);
            $types .= "d";
        }

        if (!empty($filters["priceMax"])) {
            $sql .= " AND price <= ?";
            $params[] = floatval($filters["priceMax"]);
            $types .= "d";
        }

        if (!empty($filters["rating"])) {
            $sql .= " AND rating >= ?";
            $params[] = floatval($filters["rating"]);
            $types .= "d";
        }

        if ($filters["stock"] !== null && $filters["stock"] !== "") {
            if ($filters["stock"] == "1") $sql .= " AND stock > 0";
            if ($filters["stock"] == "0") $sql .= " AND stock = 0";
        }

        if (!empty($filters["search"])) {
            $sql .= " AND (name LIKE ? OR brand LIKE ? OR category LIKE ?)";
            $searchTerm = "%" . $filters["search"] . "%";
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $params[] = $searchTerm;
            $types .= "sss";
        }        
        
        $sql .= " ORDER BY created_at DESC";
        $stmt = $conn->prepare($sql);
        if (!empty($params)) $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $result = $stmt->get_result();
        $products = [];

        while ($row = $result->fetch_assoc()) {
            $row["images"] = $this->processImages($row["image_url"]);
            unset($row["image_url"]);
            $products[] = $row;
        }
        return $products;
    }

    private function processImages($imageData): array {
        $decoded = json_decode($imageData, true);
        if (is_array($decoded)) {
            return array_map(fn($img) => "/GamerHaven_WebShop/" . ltrim($img, "/"), $decoded);
        } else {
            $fallback = array_map('trim', explode(",", $imageData));
            return array_map(fn($img) => "/GamerHaven_WebShop/" . ltrim($img, "/"), $fallback);
        }
    }
}