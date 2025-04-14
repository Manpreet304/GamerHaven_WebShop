<?php

function addToCart(int $userId, int $productId, int $quantity, $conn): bool {
    $stmt = $conn->prepare("SELECT id FROM cart WHERE user_id = ? AND product_id = ?");
    $stmt->bind_param("ii", $userId, $productId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        $stmt = $conn->prepare("UPDATE cart SET quantity = quantity + ? WHERE id = ?");
        $stmt->bind_param("ii", $quantity, $row["id"]);
    } else {
        $stmt = $conn->prepare("INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)");
        $stmt->bind_param("iii", $userId, $productId, $quantity);
    }

    return $stmt->execute();
}


function getCartCount(int $userId, $conn): int {
    $stmt = $conn->prepare("SELECT SUM(quantity) as total FROM cart WHERE user_id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();

    return (int) ($row["total"] ?? 0);
}
