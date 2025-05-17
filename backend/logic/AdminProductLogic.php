<?php
declare(strict_types=1);

class AdminProductLogic {
    private string $imageDir = __DIR__ . '/../../pictures/';

    /**
     * Alle Produkte aus der Datenbank laden.
     */
    public function list(mysqli $conn): array {
        $res = $conn->query("
            SELECT id, name, description, price, stock, rating,
                   image_url, attributes, brand, category, sub_category
            FROM products
            ORDER BY created_at DESC
        ");
        return [200, $res->fetch_all(MYSQLI_ASSOC), "Product list loaded"];
    }

    /**
     * Einzelnes Produkt anhand ID laden.
     */
    public function get(int $id, mysqli $conn): array {
        $stmt = $conn->prepare("
            SELECT id, name, description, price, stock, rating,
                   image_url, attributes, brand, category, sub_category
            FROM products
            WHERE id = ?
        ");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $product = $stmt->get_result()->fetch_assoc();

        return $product
            ? [200, $product, "Product loaded"]
            : [404, null, "Product not found"];
    }

    /**
     * Produkt speichern (neu oder Update).
     */
    public function save(array $post, array $files, mysqli $conn): array {
        $newImages = [];

        // --- Pflichtfelder prüfen ---
        $required = ['name', 'description', 'price', 'stock', 'brand', 'category', 'sub_category', 'rating'];
        foreach ($required as $field) {
            if (!isset($post[$field]) || $post[$field] === '') {
                return [400, ['error' => 'Missing required fields'], "Validation failed"];
            }
        }

        // --- Bilder speichern ---
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
        $existing = $isUpdate ? $this->get((int)$post['id'], $conn)[1] : [];

        $oldImages    = !empty($existing['image_url']) ? json_decode($existing['image_url'], true) : [];
        $imagesToSave = !empty($newImages) ? $newImages : $oldImages;
        $jsonImages   = json_encode($imagesToSave, JSON_UNESCAPED_SLASHES);

        $jsonAttributes = isset($post['attributes'])
            ? json_encode(json_decode($post['attributes'], true) ?: [], JSON_UNESCAPED_UNICODE)
            : ($existing['attributes'] ?? '[]');

        // --- UPDATE ---
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

            return $ok
                ? [200, ['updated' => true], "Product updated"]
                : [400, ['updated' => false], "Update failed"];
        }

        // --- INSERT ---
        $stmt = $conn->prepare("
            INSERT INTO products
                (name, description, price, stock, rating,
                 image_url, sub_category, brand, category, attributes, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ");
        $stmt->bind_param(
            "ssdidsssss",
            $post['name'], $post['description'], $post['price'],
            $post['stock'], $post['rating'], $jsonImages,
            $post['sub_category'], $post['brand'], $post['category'],
            $jsonAttributes
        );
        $ok = $stmt->execute();

        return $ok
            ? [200, ['id' => $conn->insert_id], "Product created"]
            : [400, null, "Product creation failed"];
    }

    /**
     * Produkt löschen.
     */
    public function delete(int $id, mysqli $conn): array {
        $stmt = $conn->prepare("DELETE FROM products WHERE id = ?");
        $stmt->bind_param("i", $id);
        $ok = $stmt->execute();

        return $ok
            ? [200, ['deleted' => true], "Product deleted"]
            : [400, ['deleted' => false], "Product could not be deleted"];
    }
}
