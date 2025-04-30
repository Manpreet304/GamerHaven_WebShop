<?php
class ProductLogic {
    public function getAllProducts($conn): array {
        $stmt = $conn->prepare("SELECT * FROM products ORDER BY created_at DESC");
        $stmt->execute();
        $result = $stmt->get_result();

        $products = [];
        while ($row = $result->fetch_assoc()) {
            $row["images"] = $this->extractImages($row["image_url"]);
            unset($row["image_url"]);
            $products[] = $row;
        }

        return $products;
    }

    public function getFilteredProducts($conn, array $filters): array {
        $sql = "SELECT * FROM products WHERE 1=1";
        $params = [];
        $types = "";

        if (!empty($filters["category"])) {
            $sql .= " AND category = ?";
            $params[] = $filters["category"];
            $types .= "s";
        }

        if (!empty($filters["brand"])) {
            $brands = explode(",", $filters["brand"]);
            $sql .= " AND brand IN (" . implode(",", array_fill(0, count($brands), "?")) . ")";
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

        if (isset($filters["stock"]) && $filters["stock"] !== "") {
            $sql .= $filters["stock"] === "1" ? " AND stock > 0" : " AND stock = 0";
        }        

        if (!empty($filters["search"])) {
            $sql .= " AND (name LIKE ? OR brand LIKE ? OR category LIKE ?)";
            $search = "%" . $filters["search"] . "%";
            $params = array_merge($params, [$search, $search, $search]);
            $types .= "sss";
        }

        $sql .= " ORDER BY created_at DESC";
        $stmt = $conn->prepare($sql);
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }

        $stmt->execute();
        $result = $stmt->get_result();

        $products = [];
        while ($row = $result->fetch_assoc()) {
            $row["images"] = $this->extractImages($row["image_url"]);
            unset($row["image_url"]);
            $products[] = $row;
        }

        return $products;
    }

    private function extractImages(string $imageField): array {
        $images = json_decode($imageField, true);
        if (is_array($images)) {
            return array_map(fn($img) => "/GamerHaven_WebShop/" . ltrim($img, "/"), $images);
        }
        return array_map(fn($img) => "/GamerHaven_WebShop/" . ltrim($img, "/"), explode(",", $imageField));
    }
}
