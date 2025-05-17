<?php
declare(strict_types=1);

class AdminVoucherLogic {

    /**
     * Lade alle Gutscheine und aktualisiere inaktive automatisch.
     */
    public function list(mysqli $conn): array {
        // Abgelaufene oder verbrauchte Gutscheine deaktivieren
        $conn->query("
            UPDATE vouchers
            SET is_active = CASE
                WHEN expires_at < CURDATE() OR remaining_value <= 0 THEN 0
                ELSE is_active
            END
        ");

        $res = $conn->query("
            SELECT id, code, value, remaining_value, is_active, expires_at, created_at
            FROM vouchers
            ORDER BY created_at DESC
        ");
        return [200, $res->fetch_all(MYSQLI_ASSOC), "Vouchers loaded"];
    }

    /**
     * Lade einen bestimmten Gutschein (inkl. Statusaktualisierung).
     */
    public function get(int $id, mysqli $conn): array {
        $conn->query("
            UPDATE vouchers
            SET is_active = CASE
                WHEN expires_at < CURDATE() OR remaining_value <= 0 THEN 0
                ELSE is_active
            END
        ");

        $stmt = $conn->prepare("
            SELECT id, code, value, remaining_value, is_active, expires_at
            FROM vouchers
            WHERE id = ?
        ");
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $voucher = $stmt->get_result()->fetch_assoc();

        return $voucher
            ? [200, $voucher, "Voucher loaded"]
            : [404, null, "Voucher not found"];
    }

    /**
     * Generiere einen zufälligen neuen Gutscheincode.
     */
    public function generateCode(): array {
        $code = $this->generateRandomCode();
        return [200, ['code' => $code], "Voucher code generated"];
    }

    /**
     * Speichere oder aktualisiere einen Gutschein.
     */
    public function save(array $d, mysqli $conn): array {
        $expiresAt       = $d['expires_at'];
        $today           = date('Y-m-d');
        $remaining       = isset($d['remaining_value']) ? (float)$d['remaining_value'] : (float)$d['value'];
        $requestedActive = !empty($d['is_active']) ? 1 : 0;

        // Aktivierung nicht möglich, wenn abgelaufen
        if ($requestedActive && $expiresAt < $today) {
            return [400, ['updated' => false], "Cannot activate voucher: expiration date is in the past."];
        }

        // Automatische Deaktivierung bei abgelaufenem Datum oder 0€ Restwert
        $isActive = ($expiresAt < $today || $remaining <= 0) ? 0 : $requestedActive;

        if (!empty($d['id'])) {
            // UPDATE
            $stmt = $conn->prepare("
                UPDATE vouchers
                SET code = ?, value = ?, remaining_value = ?, is_active = ?, expires_at = ?
                WHERE id = ?
            ");
            $stmt->bind_param('sddisi', $d['code'], $d['value'], $remaining, $isActive, $expiresAt, $d['id']);
            $ok = $stmt->execute();

            return $ok
                ? [200, ['updated' => true], "Voucher updated"]
                : [400, ['updated' => false], "Update failed"];
        } else {
            // INSERT
            $code = !empty($d['code']) ? $d['code'] : $this->generateRandomCode();

            $stmt = $conn->prepare("
                INSERT INTO vouchers (code, value, remaining_value, is_active, expires_at, created_at)
                VALUES (?, ?, ?, ?, ?, NOW())
            ");
            $stmt->bind_param('sddis', $code, $d['value'], $remaining, $isActive, $expiresAt);
            $ok = $stmt->execute();

            return $ok
                ? [200, ['id' => $conn->insert_id, 'code' => $code], "Voucher created"]
                : [400, null, "Creation failed"];
        }
    }

    /**
     * Erzeuge einen 5-stelligen alphanumerischen Code.
     */
    private function generateRandomCode(): string {
        $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        $code = '';
        for ($i = 0; $i < 5; $i++) {
            $code .= $chars[random_int(0, strlen($chars) - 1)];
        }
        return $code;
    }
}
