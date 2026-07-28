<?php
// api/checkout-drafts/CheckoutDraft.php

class CheckoutDraft {
    private $conn;
    private $table_name = "checkout_drafts";

    public function __construct($db) {
        $this->conn = $db;
        $this->ensureTable();
    }

    private function ensureTable() {
        static $done = false;
        if ($done) {
            return;
        }

        try {
            $this->conn->query("SELECT id FROM " . $this->table_name . " LIMIT 1");
        } catch (Exception $e) {
            try {
                $this->conn->exec(
                    "CREATE TABLE IF NOT EXISTS checkout_drafts (
                        id INT AUTO_INCREMENT PRIMARY KEY,
                        draft_token VARCHAR(64) NOT NULL,
                        user_id INT NULL DEFAULT NULL,
                        full_name VARCHAR(150) NULL DEFAULT NULL,
                        phone VARCHAR(30) NULL DEFAULT NULL,
                        email VARCHAR(150) NULL DEFAULT NULL,
                        address TEXT NULL DEFAULT NULL,
                        city VARCHAR(100) NULL DEFAULT NULL,
                        referral_code VARCHAR(40) NULL DEFAULT NULL,
                        cart_json JSON NULL DEFAULT NULL,
                        cart_total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
                        status ENUM('abandoned', 'converted') NOT NULL DEFAULT 'abandoned',
                        converted_order_id INT NULL DEFAULT NULL,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        UNIQUE KEY uq_checkout_drafts_token (draft_token),
                        KEY idx_checkout_drafts_phone (phone),
                        KEY idx_checkout_drafts_status_updated (status, updated_at)
                    )"
                );
            } catch (Exception $ignored) {
            }
        }

        $done = true;
    }

    private function normalizePhone($phone) {
        return preg_replace('/\D+/', '', (string)$phone);
    }

    private function encodeCart($cart) {
        if (is_string($cart)) {
            return $cart;
        }
        return json_encode(is_array($cart) ? $cart : []);
    }

    public function upsert($data) {
        $token = trim((string)($data['draft_token'] ?? ''));
        if ($token === '') {
            return ['success' => false, 'message' => 'draft_token is required'];
        }

        $phone = trim((string)($data['phone'] ?? ''));
        $phoneDigits = $this->normalizePhone($phone);
        if (strlen($phoneDigits) < 7) {
            return ['success' => false, 'message' => 'Phone must have at least 7 digits'];
        }

        $userId = isset($data['user_id']) && $data['user_id'] !== '' && $data['user_id'] !== null
            ? (int)$data['user_id']
            : null;
        $fullName = trim((string)($data['full_name'] ?? ''));
        $email = trim((string)($data['email'] ?? ''));
        $address = trim((string)($data['address'] ?? ''));
        $city = trim((string)($data['city'] ?? ''));
        $referral = strtoupper(trim((string)($data['referral_code'] ?? '')));
        $cartJson = $this->encodeCart($data['cart_json'] ?? $data['items'] ?? []);
        $cartTotal = isset($data['cart_total']) ? (float)$data['cart_total'] : 0.0;

        $query = "INSERT INTO " . $this->table_name . "
                    (draft_token, user_id, full_name, phone, email, address, city, referral_code,
                     cart_json, cart_total, status)
                  VALUES
                    (:token, :user_id, :full_name, :phone, :email, :address, :city, :referral,
                     :cart_json, :cart_total, 'abandoned')
                  ON DUPLICATE KEY UPDATE
                    user_id = VALUES(user_id),
                    full_name = VALUES(full_name),
                    phone = VALUES(phone),
                    email = VALUES(email),
                    address = VALUES(address),
                    city = VALUES(city),
                    referral_code = VALUES(referral_code),
                    cart_json = VALUES(cart_json),
                    cart_total = VALUES(cart_total),
                    status = IF(status = 'converted', status, 'abandoned'),
                    updated_at = CURRENT_TIMESTAMP";

        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':token', $token);
        $stmt->bindValue(':user_id', $userId, $userId === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
        $stmt->bindValue(':full_name', $fullName !== '' ? $fullName : null);
        $stmt->bindValue(':phone', $phone);
        $stmt->bindValue(':email', $email !== '' ? $email : null);
        $stmt->bindValue(':address', $address !== '' ? $address : null);
        $stmt->bindValue(':city', $city !== '' ? $city : null);
        $stmt->bindValue(':referral', $referral !== '' ? $referral : null);
        $stmt->bindValue(':cart_json', $cartJson);
        $stmt->bindValue(':cart_total', $cartTotal);

        if (!$stmt->execute()) {
            return ['success' => false, 'message' => 'Failed to save checkout draft'];
        }

        $row = $this->findByToken($token);
        return [
            'success' => true,
            'draft' => $row,
        ];
    }

    public function convert($data) {
        $token = trim((string)($data['draft_token'] ?? ''));
        if ($token === '') {
            return ['success' => false, 'message' => 'draft_token is required'];
        }

        $orderId = isset($data['order_id']) && $data['order_id'] !== '' && $data['order_id'] !== null
            ? (int)$data['order_id']
            : null;

        $query = "UPDATE " . $this->table_name . "
                  SET status = 'converted',
                      converted_order_id = COALESCE(:order_id, converted_order_id),
                      updated_at = CURRENT_TIMESTAMP
                  WHERE draft_token = :token";
        $stmt = $this->conn->prepare($query);
        $stmt->bindValue(':order_id', $orderId, $orderId === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
        $stmt->bindValue(':token', $token);
        $stmt->execute();

        return [
            'success' => true,
            'draft' => $this->findByToken($token),
        ];
    }

    public function findByToken($token) {
        $stmt = $this->conn->prepare(
            "SELECT * FROM " . $this->table_name . " WHERE draft_token = ? LIMIT 1"
        );
        $stmt->execute([$token]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? $this->normalizeRow($row) : null;
    }

    public function listAll($status = null) {
        $query = "SELECT * FROM " . $this->table_name;
        $params = [];

        if ($status === 'abandoned' || $status === 'converted') {
            $query .= " WHERE status = ?";
            $params[] = $status;
        }

        $query .= " ORDER BY updated_at DESC, id DESC LIMIT 500";
        $stmt = $this->conn->prepare($query);
        $stmt->execute($params);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return array_map(function ($row) {
            return $this->normalizeRow($row);
        }, $rows);
    }

    private function normalizeRow($row) {
        if (isset($row['cart_json']) && is_string($row['cart_json'])) {
            $decoded = json_decode($row['cart_json'], true);
            $row['cart_items'] = is_array($decoded) ? $decoded : [];
        } elseif (is_array($row['cart_json'] ?? null)) {
            $row['cart_items'] = $row['cart_json'];
        } else {
            $row['cart_items'] = [];
        }

        $row['cart_total'] = isset($row['cart_total']) ? (float)$row['cart_total'] : 0;
        $row['id'] = isset($row['id']) ? (int)$row['id'] : null;
        $row['user_id'] = isset($row['user_id']) && $row['user_id'] !== null ? (int)$row['user_id'] : null;
        $row['converted_order_id'] = isset($row['converted_order_id']) && $row['converted_order_id'] !== null
            ? (int)$row['converted_order_id']
            : null;

        return $row;
    }
}
