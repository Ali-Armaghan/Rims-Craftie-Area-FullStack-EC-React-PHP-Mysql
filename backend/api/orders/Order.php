<?php
// api/orders/Order.php

require_once __DIR__ . '/../loyalty/Loyalty.php';

class Order {
    private $conn;
    private $table_name = "orders";

    public function __construct($db) {
        $this->conn = $db;
        $this->ensureOrderItemColorColumns();
        $this->ensureOrderResaleColumns();
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

    private function ensureOrderResaleColumns() {
        static $done = false;
        if ($done) {
            return;
        }

        $columns = [
            "referrer_user_id" => "ALTER TABLE orders ADD COLUMN referrer_user_id INT NULL DEFAULT NULL AFTER referred_by_code",
            "resale_discount_percent" => "ALTER TABLE orders ADD COLUMN resale_discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00 AFTER referrer_user_id",
            "resale_discount_amount" => "ALTER TABLE orders ADD COLUMN resale_discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER resale_discount_percent",
            "resale_commission_percent" => "ALTER TABLE orders ADD COLUMN resale_commission_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00 AFTER resale_discount_amount",
        ];

        foreach ($columns as $column => $sql) {
            try {
                $this->conn->query("SELECT $column FROM orders LIMIT 1");
            } catch (Exception $e) {
                try {
                    $this->conn->exec($sql);
                } catch (Exception $ignored) {
                }
            }
        }

        $done = true;
    }

    private function findResaleCodeOwner($code) {
        $code = strtoupper(trim((string) $code));
        if ($code === '') {
            return null;
        }

        $query = "SELECT id, resale_code, resale_discount_percent, resale_commission_percent, resale_code_active
                  FROM users
                  WHERE resale_code = ?
                  LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$code]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row || (int) ($row['resale_code_active'] ?? 1) !== 1) {
            return null;
        }

        return $row;
    }

    private function calculateResaleDiscount(float $subtotal, $referredByCode): array {
        $owner = $this->findResaleCodeOwner($referredByCode);
        if (!$owner) {
            return [
                'owner' => null,
                'discount_percent' => 0.0,
                'discount_amount' => 0.0,
                'commission_percent' => 0.0,
                'code' => null,
            ];
        }

        $discountPercent = max(0, min(100, (float) ($owner['resale_discount_percent'] ?? 0)));
        $commissionPercent = max(0, min(100, (float) ($owner['resale_commission_percent'] ?? 0)));
        $discountAmount = round($subtotal * ($discountPercent / 100), 2);

        return [
            'owner' => $owner,
            'discount_percent' => $discountPercent,
            'discount_amount' => $discountAmount,
            'commission_percent' => $commissionPercent,
            'code' => $owner['resale_code'],
        ];
    }

    public function create($data) {
        try {
            $this->conn->beginTransaction();

            $order_number = "ORD-" . date('Ymd') . "-" . rand(1000, 9999);
            $shipping = json_encode($data['shipping_address']);
            $referred_by_code = isset($data['referred_by_code']) ? strtoupper(trim((string) $data['referred_by_code'])) : null;

            $subtotal = (float) $data['subtotal'];
            $discountAmount = 0.0;
            $finalTotal = $subtotal;
            $loyaltyPercent = 0.0;
            $resaleDiscountPercent = 0.0;
            $resaleDiscountAmount = 0.0;
            $resaleCommissionPercent = 0.0;
            $referrerUserId = null;

            $applyLoyalty = !empty($data['apply_loyalty']);
            $loyaltyDiscountAmount = 0.0;
            if ($applyLoyalty) {
                $loyalty = new Loyalty($this->conn);
                $lifetimeSpent = $loyalty->getLifetimeSpent($data['user_id']);
                $loyaltyDiscount = $loyalty->calculateDiscount($subtotal, $lifetimeSpent);
                $loyaltyDiscountAmount = (float) $loyaltyDiscount['discount_amount'];
                $loyaltyPercent = (float) $loyaltyDiscount['discount_percent'];
            }

            $resaleConfig = $this->calculateResaleDiscount($subtotal, $referred_by_code);
            if (!empty($resaleConfig['owner'])) {
                $resaleDiscountPercent = (float) $resaleConfig['discount_percent'];
                $resaleDiscountAmount = (float) $resaleConfig['discount_amount'];
                $resaleCommissionPercent = (float) $resaleConfig['commission_percent'];
                $referrerUserId = (int) $resaleConfig['owner']['id'];
                $referred_by_code = $resaleConfig['code'];
            } else {
                $referred_by_code = null;
            }

            if ($resaleDiscountAmount >= $loyaltyDiscountAmount) {
                $discountAmount = $resaleDiscountAmount;
            } else {
                $discountAmount = $loyaltyDiscountAmount;
                $resaleDiscountPercent = 0.0;
                $resaleDiscountAmount = 0.0;
            }

            $finalTotal = max(0, round($subtotal - $discountAmount, 2));

            $query = "INSERT INTO " . $this->table_name . " 
                      SET user_id=:user_id, order_number=:onum, subtotal=:sub, 
                          discount=:discount, total=:total, shipping_address=:ship, referred_by_code=:ref,
                          referrer_user_id=:referrer_user_id, resale_discount_percent=:resale_discount_percent,
                          resale_discount_amount=:resale_discount_amount, resale_commission_percent=:resale_commission_percent";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":user_id", $data['user_id']);
            $stmt->bindParam(":onum", $order_number);
            $stmt->bindParam(":sub", $subtotal);
            $stmt->bindParam(":discount", $discountAmount);
            $stmt->bindParam(":total", $finalTotal);
            $stmt->bindParam(":ship", $shipping);
            $stmt->bindParam(":ref", $referred_by_code);
            $stmt->bindParam(":referrer_user_id", $referrerUserId, $referrerUserId === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
            $stmt->bindParam(":resale_discount_percent", $resaleDiscountPercent);
            $stmt->bindParam(":resale_discount_amount", $resaleDiscountAmount);
            $stmt->bindParam(":resale_commission_percent", $resaleCommissionPercent);
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
                "resale_discount_percent" => $resaleDiscountPercent,
                "resale_discount_amount" => $resaleDiscountAmount,
                "resale_commission_percent" => $resaleCommissionPercent,
                "total" => $finalTotal,
            ];

        } catch (Exception $e) {
            $this->conn->rollBack();
            return ["success" => false, "message" => $e->getMessage()];
        }
    }

    public function updateStatus($order_id, $status) {
        // Get current order info
        $q = "SELECT * FROM " . $this->table_name . " WHERE id = ?";
        $st = $this->conn->prepare($q);
        $st->execute([$order_id]);
        $order = $st->fetch(PDO::FETCH_ASSOC);

        if (!$order) return false;

        $query = "UPDATE " . $this->table_name . " SET status = ? WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $res = $stmt->execute([$status, $order_id]);

        // Commission Logic: Only credit if status is 'delivered' and not already credited
        if ($status === 'delivered' && $order['referred_by_code'] && $order['resale_credited'] == 0) {
            $this->creditCommission($order);
        }

        return $res;
    }

    public function delete($order_id) {
        $id = (int) $order_id;
        if ($id <= 0) {
            return false;
        }

        try {
            $this->conn->beginTransaction();
            $this->reverseCommissionIfNeeded($id);

            $stmt = $this->conn->prepare("DELETE FROM " . $this->table_name . " WHERE id = ?");
            $ok = $stmt->execute([$id]);
            $this->conn->commit();
            return $ok && $stmt->rowCount() > 0;
        } catch (Exception $e) {
            if ($this->conn->inTransaction()) {
                $this->conn->rollBack();
            }
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
            $this->conn->beginTransaction();

            foreach ($cleanIds as $id) {
                $this->reverseCommissionIfNeeded($id);
            }

            $placeholders = implode(',', array_fill(0, count($cleanIds), '?'));
            $stmt = $this->conn->prepare("DELETE FROM " . $this->table_name . " WHERE id IN ($placeholders)");
            $stmt->execute($cleanIds);
            $deleted = $stmt->rowCount();

            $this->conn->commit();
            return ["success" => true, "deleted" => $deleted];
        } catch (Exception $e) {
            if ($this->conn->inTransaction()) {
                $this->conn->rollBack();
            }
            return ["success" => false, "deleted" => 0, "message" => $e->getMessage()];
        }
    }

    private function reverseCommissionIfNeeded($order_id) {
        $q = "SELECT * FROM " . $this->table_name . " WHERE id = ?";
        $st = $this->conn->prepare($q);
        $st->execute([$order_id]);
        $order = $st->fetch(PDO::FETCH_ASSOC);

        if (!$order || (int) $order['resale_credited'] !== 1) {
            return;
        }

        $commission = (float) $order['commission_earned'];
        if ($commission <= 0 || empty($order['referred_by_code'])) {
            return;
        }

        $rq = "SELECT id FROM users WHERE resale_code = ?";
        $rs = $this->conn->prepare($rq);
        $rs->execute([$order['referred_by_code']]);
        $referrer = $rs->fetch(PDO::FETCH_ASSOC);

        if (!$referrer) {
            return;
        }

        $uq = "UPDATE users SET resale_balance = GREATEST(0, resale_balance - ?) WHERE id = ?";
        $this->conn->prepare($uq)->execute([$commission, $referrer['id']]);

        $lq = "INSERT INTO resale_ledger SET user_id=?, order_id=?, type='debit', amount=?, description=?";
        $desc = "Commission reversed (order deleted) #" . $order['order_number'];
        $this->conn->prepare($lq)->execute([$referrer['id'], $order['id'], $commission, $desc]);
    }

    private function creditCommission($order) {
        $rate = isset($order['resale_commission_percent'])
            ? (float) $order['resale_commission_percent']
            : 0.0;
        if ($rate <= 0) {
            $sq = "SELECT setting_value FROM settings WHERE setting_key = 'commission_rate'";
            $ss = $this->conn->prepare($sq);
            $ss->execute();
            $rate = (float)$ss->fetchColumn();
        }

        $commission = $order['total'] * ($rate / 100);

        // Find referrer
        $rq = "SELECT id FROM users WHERE resale_code = ?";
        $rs = $this->conn->prepare($rq);
        $rs->execute([$order['referred_by_code']]);
        $referrer = $rs->fetch(PDO::FETCH_ASSOC);

        if ($referrer) {
            try {
                $this->conn->beginTransaction();

                // 1. Update user balance
                $uq = "UPDATE users SET resale_balance = resale_balance + ? WHERE id = ?";
                $this->conn->prepare($uq)->execute([$commission, $referrer['id']]);

                // 2. Add to ledger
                $lq = "INSERT INTO resale_ledger SET user_id=?, order_id=?, type='credit', amount=?, description=?";
                $desc = "Commission from Order #" . $order['order_number'];
                $this->conn->prepare($lq)->execute([$referrer['id'], $order['id'], $commission, $desc]);

                // 3. Mark order as credited
                $oq = "UPDATE orders SET resale_credited = 1, commission_earned = ? WHERE id = ?";
                $this->conn->prepare($oq)->execute([$commission, $order['id']]);

                $this->conn->commit();
            } catch (Exception $e) {
                $this->conn->rollBack();
            }
        }
    }
}
?>
