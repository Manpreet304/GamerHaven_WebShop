<?php
declare(strict_types=1);
require_once __DIR__ . '/../logic/AccountLogic.php';

class AccountController {
    private AccountLogic $logic;

    public function __construct(mysqli $conn) {
        $this->logic = new AccountLogic($conn);
    }

    public function updateAccount(int $userId, array $data): array {
        return $this->logic->updateAccount($userId, $data);
    }

    public function changePassword(int $userId, array $data): array {
        return $this->logic->changePassword($userId, $data);
    }

    public function addPayment(int $userId, array $data): array {
        return $this->logic->addPaymentMethod($userId, $data);
    }
}
