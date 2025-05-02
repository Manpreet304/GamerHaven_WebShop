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
        return [
            "status" => 200,
            "body" => $this->logic->fetchAllProducts($conn)
        ];
    }

    public function getProduct(int $id, mysqli $conn): array {
        $product = $this->logic->fetchProductById($id, $conn);
        return [
            "status" => !empty($product) ? 200 : 404,
            "body" => $product
        ];
    }

    public function saveProduct(array $post, array $files, mysqli $conn): array {
        $result = $this->logic->saveProduct($post, $files, $conn);
        return [
            "status" => $result["success"] ? 200 : 400,
            "body" => $result
        ];
    }

    public function deleteProduct(int $id, mysqli $conn): array {
        $ok = $this->logic->deleteProduct($id, $conn);
        return [
            "status" => $ok ? 200 : 400,
            "body" => ["deleted" => $ok]
        ];
    }

    // ----- CUSTOMERS -----
    public function listCustomers(mysqli $conn): array {
        return [
            "status" => 200,
            "body" => $this->logic->fetchAllCustomers($conn)
        ];
    }

    public function getCustomer(int $id, mysqli $conn): array {
        $customer = $this->logic->fetchCustomerById($id, $conn);
        return [
            "status" => !empty($customer) ? 200 : 404,
            "body" => $customer
        ];
    }

    public function toggleCustomer(int $id, mysqli $conn): array {
        $ok = $this->logic->toggleCustomerActive($id, $conn);
        return [
            "status" => $ok ? 200 : 400,
            "body" => ["toggled" => $ok]
        ];
    }

    public function saveCustomer(array $data, mysqli $conn): array {
        $result = $this->logic->saveCustomer($data, $conn);
        return [
            "status" => $result["success"] ? 200 : 400,
            "body" => $result
        ];
    }

    public function deleteCustomer(int $id, mysqli $conn): array {
        $ok = $this->logic->deleteCustomer($id, $conn);
        return [
            "status" => $ok ? 200 : 400,
            "body" => ["deleted" => $ok]
        ];
    }

    // ----- ORDERS -----
    public function listOrdersByCustomer(int $userId, mysqli $conn): array {
        return [
            "status" => 200,
            "body" => $this->logic->fetchOrdersByCustomer($userId, $conn)
        ];
    }

    public function listOrderItems(int $orderId, mysqli $conn): array {
        return [
            "status" => 200,
            "body" => $this->logic->fetchOrderItems($orderId, $conn)
        ];
    }

    public function removeOrderItem(int $itemId, int $qty, mysqli $conn): array {
        $ok = $this->logic->removeOrderItem($itemId, $qty, $conn);
        return [
            "status" => $ok ? 200 : 400,
            "body" => ["removed" => $ok]
        ];
    }

    // ----- VOUCHERS -----
    public function listVouchers(mysqli $conn): array {
        return [
            "status" => 200,
            "body" => $this->logic->fetchAllVouchers($conn)
        ];
    }

    public function getVoucher(int $id, mysqli $conn): array {
        $voucher = $this->logic->fetchVoucherById($id, $conn);
        return [
            "status" => !empty($voucher) ? 200 : 404,
            "body" => $voucher
        ];
    }

    public function getNewVoucherCode(): array {
        return [
            "status" => 200,
            "body" => ["code" => $this->logic->getNewVoucherCode()]
        ];
    }

    public function saveVoucher(array $data, mysqli $conn): array {
        $result = $this->logic->saveVoucher($data, $conn);
        return [
            "status" => $result["success"] ? 200 : 400,
            "body" => $result
        ];
    }

    public function deleteVoucher(int $id, mysqli $conn): array {
        $ok = $this->logic->deleteVoucher($id, $conn);
        return [
            "status" => $ok ? 200 : 400,
            "body" => ["deactivated" => $ok]
        ];
    }
}
