<?php
// controller/AdminController.php
declare(strict_types=1);

require_once("../logic/AdminLogic.php");

class AdminController {
    private AdminLogic $logic;

    public function __construct() {
        $this->logic = new AdminLogic();
    }

    // ----- PRODUCTS -----
    public function listProducts(mysqli $conn): array {
        return $this->logic->fetchAllProducts($conn);
    }

    public function getProduct(int $id, mysqli $conn): array {
        return $this->logic->fetchProductById($id, $conn);
    }

    public function saveProduct(array $post, array $files, mysqli $conn): array {
        return $this->logic->saveProduct($post, $files, $conn);
    }

    public function deleteProduct(int $id, mysqli $conn): array {
        return ['success' => $this->logic->deleteProduct($id, $conn)];
    }

    // ----- CUSTOMERS -----
    public function listCustomers(mysqli $conn): array {
        return $this->logic->fetchAllCustomers($conn);
    }

    public function getCustomer(int $id, mysqli $conn): array {
        return $this->logic->fetchCustomerById($id, $conn);
    }

    public function toggleCustomer(int $id, mysqli $conn): array {
        return ['success' => $this->logic->toggleCustomerActive($id, $conn)];
    }

    public function saveCustomer(array $data, mysqli $conn): array {
        return $this->logic->saveCustomer($data, $conn);
    }
    public function deleteCustomer(int $id, mysqli $conn): array {
        return ['success' => $this->logic->deleteCustomer($id, $conn)];
    }

    // ----- ORDERS -----
    public function listOrdersByCustomer(int $userId, mysqli $conn): array {
        return $this->logic->fetchOrdersByCustomer($userId, $conn);
    }

    public function listOrderItems(int $orderId, mysqli $conn): array {
        return $this->logic->fetchOrderItems($orderId, $conn);
    }

    public function removeOrderItem(int $itemId, mysqli $conn): array {
        return ['success' => $this->logic->deleteOrderItem($itemId, $conn)];
    }

    // ----- VOUCHERS -----
    public function listVouchers(mysqli $conn): array {
        return $this->logic->fetchAllVouchers($conn);
    }

    public function getVoucher(int $id, mysqli $conn): array {
        return $this->logic->fetchVoucherById($id, $conn);
    }

    public function getNewVoucherCode(): array {
        return ['code' => $this->logic->getNewVoucherCode()];
    }

    public function saveVoucher(array $data, mysqli $conn): array {
        return $this->logic->saveVoucher($data, $conn);
    }

    public function deleteVoucher(int $id, mysqli $conn): array {
        return ['success' => $this->logic->deleteVoucher($id, $conn)];
    }
}
