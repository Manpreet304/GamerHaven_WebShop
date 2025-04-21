<?php
declare(strict_types=1);
require_once __DIR__ . '/../logic/AdminLogic.php';

class AdminController {
    private AdminLogic $logic;

    public function __construct() {
        $this->logic = new AdminLogic();
    }

    // ----- PRODUCTS -----
    public function listProducts($conn) {
        return $this->logic->fetchAllProducts($conn);
    }

    public function getProduct(int $id, $conn) {
        return $this->logic->fetchProductById($id, $conn);
    }

    public function saveProduct(array $post, array $files, $conn) {
        return $this->logic->saveProduct($post, $files, $conn);
    }

    public function deleteProduct(int $id, $conn) {
        return $this->logic->deleteProduct($id, $conn);
    }

    // ----- CUSTOMERS -----
    public function listCustomers($conn) {
        return $this->logic->fetchAllCustomers($conn);
    }

    public function getCustomer(int $id, $conn) {
        return $this->logic->fetchCustomerById($id, $conn);
    }

    public function toggleCustomer(int $id, $conn) {
        return $this->logic->toggleCustomerActive($id, $conn);
    }

    public function saveCustomer(array $data, $conn) {
        return $this->logic->saveCustomer($data, $conn);
    }

    // ----- ORDERS -----
    public function listOrdersByCustomer(int $userId, $conn) {
        return $this->logic->fetchOrdersByCustomer($userId, $conn);
    }

    public function listOrderItems(int $orderId, $conn) {
        return $this->logic->fetchOrderItems($orderId, $conn);
    }

    public function removeOrderItem(int $itemId, $conn) {
        return $this->logic->deleteOrderItem($itemId, $conn);
    }

    // ----- VOUCHERS -----
    public function listVouchers($conn) {
        return $this->logic->fetchAllVouchers($conn);
    }

    public function getVoucher(int $id, $conn) {
        return $this->logic->fetchVoucherById($id, $conn);
    }

    public function saveVoucher(array $data, $conn) {
        return $this->logic->saveVoucher($data, $conn);
    }

    public function deleteVoucher(int $id, $conn) {
        return $this->logic->deleteVoucher($id, $conn);
    }

    public function getNewVoucherCode($conn) {
        return $this->logic->getNewVoucherCode();
    }
}