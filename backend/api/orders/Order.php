<?php
// api/orders/Order.php

require_once __DIR__ . '/../loyalty/Loyalty.php';

class Order {
    private $conn;
    private $table_name = "orders";

    public function __construct($db) {
        $this->conn = $db;
        $this->ensureOrderItemColorColumns();
    }

    private function ensureOrderItemColorColumns() {
        static $done = false;
        if ($done) {
            return;
        }

        try {
            $this->conn->query("SELECT color_name, color_hex FROM order_items LIMIT 1");
        } catch (Exception $e) {
            try {
                $this->conn->exec(
                    "ALTER TABLE order_items
                     ADD COLUMN color_name VARCHAR(100) NULL DEFAULT NULL AFTER product_name,
                     ADD COLUMN color_hex VARCHAR(20) NULL DEFAULT NULL AFTER color_name"
                );
            } catch (Exception $ignored) {
                try {
                    $this->conn->exec(
                        "ALTER TABLE order_items ADD COLUMN color_name VARCHAR(100) NULL DEFAULT NULL AFTER product_name"
                    );
                } catch (Exception $ignored2) {
                }
                try {
                    $this->conn->exec(
                        "ALTER TABLE order_items ADD COLUMN color_hex VARCHAR(20) NULL DEFAULT NULL AFTER color_name"
                    );
                } catch (Exception $ignored3) {
                }
            }
        }

        $done = true;
    }

    public function create($data) {
        try {
            $this->conn->beginTransaction();

            $order_number = "ORD-" . date('Ymd') . "-" . rand(1000, 9999);
            $shipping = json_encode($data['shipping_address']);

            $subtotal = (float) $data['subtotal'];
            $discountAmount = 0.0;
            $loyaltyPercent = 0.0;

            $userId = !empty($data['user_id']) ? (int) $data['user_id'] : null;

            $applyLoyalty = !empty($data['apply_loyalty']);
            if ($applyLoyalty && $userId !== null) {
                $loyalty = new Loyalty($this->conn);
                $lifetimeSpent = $loyalty->getLifetimeSpent($userId);
                $loyaltyDiscount = $loyalty->calculateDiscount($subtotal, $lifetimeSpent);
                $discountAmount = (float) $loyaltyDiscount['discount_amount'];
                $loyaltyPercent = (float) $loyaltyDiscount['discount_percent'];
            }

            $finalTotal = max(0, round($subtotal - $discountAmount, 2));

            $query = "INSERT INTO " . $this->table_name . " 
                      SET user_id=:user_id, order_number=:onum, subtotal=:sub, 
                          discount=:discount, total=:total, shipping_address=:ship";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindValue(":user_id", $userId, $userId !== null ? PDO::PARAM_INT : PDO::PARAM_NULL);
            $stmt->bindValue(":onum", $order_number);
            $stmt->bindValue(":sub", $subtotal);
            $stmt->bindValue(":discount", $discountAmount);
            $stmt->bindValue(":total", $finalTotal);
            $stmt->bindValue(":ship", $shipping);
            $stmt->execute();
            
            $order_id = $this->conn->lastInsertId();

            // Insert Items
            foreach ($data['items'] as $item) {
                $iq = "INSERT INTO order_items 
                       SET order_id=:oid, product_id=:pid, product_name=:name,
                           color_name=:color_name, color_hex=:color_hex,
                           price=:price, quantity=:qty, subtotal=:sub";
                $istmt = $this->conn->prepare($iq);
                $istmt->bindParam(":oid", $order_id);
                $istmt->bindParam(":pid", $item['product_id']);
                $istmt->bindParam(":name", $item['name']);
                $colorName = !empty($item['color_name']) ? trim((string) $item['color_name']) : null;
                $colorHex = !empty($item['color_hex']) ? trim((string) $item['color_hex']) : null;
                if ($colorHex !== null && !preg_match('/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/', $colorHex)) {
                    $colorHex = null;
                }
                $istmt->bindParam(":color_name", $colorName, $colorName === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
                $istmt->bindParam(":color_hex", $colorHex, $colorHex === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
                $istmt->bindParam(":price", $item['price']);
                $istmt->bindParam(":qty", $item['quantity']);
                $sub = $item['price'] * $item['quantity'];
                $istmt->bindParam(":sub", $sub);
                $istmt->execute();
            }

            $this->conn->commit();
            return [
                "success" => true,
                "order_id" => (int)$order_id,
                "order_number" => $order_number,
                "loyalty_discount" => $discountAmount,
                "loyalty_discount_percent" => $loyaltyPercent,
                "total" => $finalTotal,
            ];

        } catch (Exception $e) {
            $this->conn->rollBack();
            return ["success" => false, "message" => $e->getMessage()];
        }
    }

    public function updateStatus($order_id, $status) {
        $query = "UPDATE " . $this->table_name . " SET status = ? WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$status, $order_id]);
    }

    public function delete($order_id) {
        $id = (int) $order_id;
        if ($id <= 0) {
            return false;
        }

        try {
            $stmt = $this->conn->prepare("DELETE FROM " . $this->table_name . " WHERE id = ?");
            $ok = $stmt->execute([$id]);
            return $ok && $stmt->rowCount() > 0;
        } catch (Exception $e) {
            return false;
        }
    }

    public function deleteMany($ids) {
        if (!is_array($ids) || empty($ids)) {
            return ["success" => false, "deleted" => 0, "message" => "No order ids provided"];
        }

        $cleanIds = array_values(array_unique(array_filter(array_map('intval', $ids), function ($id) {
            return $id > 0;
        })));

        if (empty($cleanIds)) {
            return ["success" => false, "deleted" => 0, "message" => "Invalid order ids"];
        }

        try {
            $placeholders = implode(',', array_fill(0, count($cleanIds), '?'));
            $stmt = $this->conn->prepare("DELETE FROM " . $this->table_name . " WHERE id IN ($placeholders)");
            $stmt->execute($cleanIds);
            $deleted = $stmt->rowCount();

            return ["success" => true, "deleted" => $deleted];
        } catch (Exception $e) {
            return ["success" => false, "deleted" => 0, "message" => $e->getMessage()];
        }
    }
}
?>
