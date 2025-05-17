<?php
declare(strict_types=1);

class AdminCustomerLogic {

    // Gibt alle Kunden zurück
    public function list(mysqli $conn): array {
        $res = $conn->query("
            SELECT id, firstname, lastname, email, username, role, is_active
            FROM users
            ORDER BY created_at DESC
        ");

        return [200, $res->fetch_all(MYSQLI_ASSOC), "Customer list loaded"];
    }

    // Gibt einen einzelnen Kunden anhand der ID zurück
    public function get(int $id, mysqli $conn): array {
        $stmt = $conn->prepare("
            SELECT id, firstname, lastname, email, username, salutation,
                   role, is_active, address, zip_code, city, country
            FROM users
            WHERE id = ?
        ");
        $stmt->bind_param("i", $id);
        $stmt->execute();

        $result = $stmt->get_result()->fetch_assoc();
        return $result
            ? [200, $result, "Customer loaded"]
            : [404, null, "Customer not found"];
    }

    // Aktiviert/Deaktiviert den Kundenstatus (Toggle)
    public function toggle(int $id, mysqli $conn): array {
        $stmt = $conn->prepare("UPDATE users SET is_active = NOT is_active WHERE id = ?");
        $stmt->bind_param("i", $id);
        $ok = $stmt->execute();

        return $ok
            ? [200, ['toggled' => true], "Customer status toggled"]
            : [400, ['toggled' => false], "Toggling failed"];
    }

    // Löscht einen Kunden anhand der ID
    public function delete(int $id, mysqli $conn): array {
        $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
        $stmt->bind_param("i", $id);
        $ok = $stmt->execute();

        return $ok
            ? [200, ['deleted' => true], "Customer deleted"]
            : [400, ['deleted' => false], "Customer could not be deleted"];
    }

    // Speichert oder aktualisiert Kundendaten
    public function save(array $d, mysqli $conn): array {
        $isActiveStr = $d['is_active'] ? 'true' : 'false';

        // === UPDATE bestehender Kunde ===
        if (!empty($d['id'])) {
            if (!empty($d['password'])) {
                // Mit Passwort-Änderung
                $hash = password_hash($d['password'], PASSWORD_DEFAULT);
                $stmt = $conn->prepare("
                    UPDATE users SET
                        firstname=?, lastname=?, email=?, username=?,
                        salutation=?, role=?, is_active=?,
                        address=?, zip_code=?, city=?, country=?, password=?
                    WHERE id=?
                ");
                $stmt->bind_param(
                    "sssssssssssssi",
                    $d['firstname'], $d['lastname'], $d['email'], $d['username'],
                    $d['salutation'], $d['role'], $isActiveStr,
                    $d['address'], $d['zip_code'], $d['city'], $d['country'],
                    $hash, $d['id']
                );
            } else {
                // Ohne Passwort-Änderung
                $stmt = $conn->prepare("
                    UPDATE users SET
                        firstname=?, lastname=?, email=?, username=?,
                        salutation=?, role=?, is_active=?,
                        address=?, zip_code=?, city=?, country=?
                    WHERE id=?
                ");
                $stmt->bind_param(
                    "sssssssssssi",
                    $d['firstname'], $d['lastname'], $d['email'], $d['username'],
                    $d['salutation'], $d['role'], $isActiveStr,
                    $d['address'], $d['zip_code'], $d['city'], $d['country'],
                    $d['id']
                );
            }

            $ok = $stmt->execute();
            return $ok
                ? [200, ['updated' => true], "Customer updated"]
                : [400, ['updated' => false], "Update failed"];
        } else {
            // === INSERT neuer Kunde ===
            $hash = password_hash($d['password'] ?? bin2hex(random_bytes(8)), PASSWORD_DEFAULT);
            $stmt = $conn->prepare("
                INSERT INTO users
                    (firstname, lastname, email, username, password,
                     salutation, role, is_active, address, zip_code, city, country, created_at)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,NOW())
            ");
            $stmt->bind_param(
                "ssssssssssss",
                $d['firstname'], $d['lastname'], $d['email'], $d['username'],
                $hash, $d['salutation'], $d['role'], $isActiveStr,
                $d['address'], $d['zip_code'], $d['city'], $d['country']
            );

            $ok = $stmt->execute();
            return $ok
                ? [200, ['id' => $conn->insert_id], "Customer created"]
                : [400, null, "Creation failed"];
        }
    }
}
