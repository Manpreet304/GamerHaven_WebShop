<?php
declare(strict_types=1);

require_once(__DIR__ . '/../logic/AdminProductLogic.php');
require_once(__DIR__ . '/../logic/AdminCustomerLogic.php');
require_once(__DIR__ . '/../logic/AdminOrderLogic.php');
require_once(__DIR__ . '/../logic/AdminVoucherLogic.php');

class AdminController {
    private AdminProductLogic $products;
    private AdminCustomerLogic $customers;
    private AdminOrderLogic $orders;
    private AdminVoucherLogic $vouchers;
    private mysqli $conn;

    public function __construct(mysqli $conn) {
        $this->conn = $conn;
        $this->products  = new AdminProductLogic();
        $this->customers = new AdminCustomerLogic();
        $this->orders    = new AdminOrderLogic();
        $this->vouchers  = new AdminVoucherLogic();
    }

    // PRODUCTS
    public function listProducts(): array {
        return $this->products->list($this->conn);
    }

    public function getProduct(int $id): array {
        return $this->products->get($id, $this->conn);
    }

    public function saveProduct(array $post, array $files): array {
        return $this->products->save($post, $files, $this->conn);
    }

    public function deleteProduct(int $id): array {
        return $this->products->delete($id, $this->conn);
    }

    // CUSTOMERS
    public function listCustomers(): array {
        return $this->customers->list($this->conn);
    }

    public function getCustomer(int $id): array {
        return $this->customers->get($id, $this->conn);
    }

    public function toggleCustomer(int $id): array {
        return $this->customers->toggle($id, $this->conn);
    }

    public function saveCustomer(array $data): array {
        return $this->customers->save($data, $this->conn);
    }

    public function deleteCustomer(int $id): array {
        return $this->customers->delete($id, $this->conn);
    }

    // ORDERS
    public function listOrdersByCustomer(int $customerId): array {
        return $this->orders->listByCustomer($customerId, $this->conn);
    }

    public function listAllOrders(): array {
        return $this->orders->listAll($this->conn);
    }

    public function listOrderItems(int $orderId): array {
        return $this->orders->listItems($orderId, $this->conn);
    }

    public function removeOrderItem(int $itemId, int $qty): array {
        return $this->orders->removeItem($itemId, $qty, $this->conn);
    }

    // VOUCHERS
    public function listVouchers(): array {
        return $this->vouchers->list($this->conn);
    }

    public function getVoucher(int $id): array {
        return $this->vouchers->get($id, $this->conn);
    }

    public function getNewVoucherCode(): array {
        return $this->vouchers->generateCode();
    }

    public function saveVoucher(array $data): array {
        return $this->vouchers->save($data, $this->conn);
    }
}
