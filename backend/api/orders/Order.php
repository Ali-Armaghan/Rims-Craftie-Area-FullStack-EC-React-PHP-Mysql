<?php
// api/orders/Order.php

require_once __DIR__ . '/../loyalty/Loyalty.php';

class Order {
    private $conn;
    private $table_name = "orders";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create($data) {
        try {
            $this->conn->beginTransaction();

            $order_number = "ORD-" . date('Ymd') . "-" . rand(1000, 9999);
            $shipping = json_encode($data['shipping_address']);
            $referred_by_code = isset($data['referred_by_code']) ? $data['referred_by_code'] : null;

            $subtotal = (float) $data['subtotal'];
            $discountAmount = 0.0;
            $finalTotal = $subtotal;
            $loyaltyPercent = 0.0;

            $applyLoyalty = !empty($data['apply_loyalty']);
            if ($applyLoyalty) {
                $loyalty = new Loyalty($this->conn);
                $lifetimeSpent = $loyalty->getLifetimeSpent($data['user_id']);
                $loyaltyDiscount = $loyalty->calculateDiscount($subtotal, $lifetimeSpent);
                $discountAmount = (float) $loyaltyDiscount['discount_amount'];
                $finalTotal = (float) $loyaltyDiscount['total_after_discount'];
                $loyaltyPercent = (float) $loyaltyDiscount['discount_percent'];
            }

            $query = "INSERT INTO " . $this->table_name . " 
                      SET user_id=:user_id, order_number=:onum, subtotal=:sub, 
                          discount=:discount, total=:total, shipping_address=:ship, referred_by_code=:ref";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(":user_id", $data['user_id']);
            $stmt->bindParam(":onum", $order_number);
            $stmt->bindParam(":sub", $subtotal);
            $stmt->bindParam(":discount", $discountAmount);
            $stmt->bindParam(":total", $finalTotal);
            $stmt->bindParam(":ship", $shipping);
            $stmt->bindParam(":ref", $referred_by_code);
            $stmt->execute();
            
            $order_id = $this->conn->lastInsertId();

            // Insert Items
            foreach ($data['items'] as $item) {
                $iq = "INSERT INTO order_items 
                       SET order_id=:oid, product_id=:pid, product_name=:name, 
                           price=:price, quantity=:qty, subtotal=:sub";
                $istmt = $this->conn->prepare($iq);
                $istmt->bindParam(":oid", $order_id);
                $istmt->bindParam(":pid", $item['product_id']);
                $istmt->bindParam(":name", $item['name']);
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

    private function creditCommission($order) {
        // Get commission rate from settings
        $sq = "SELECT setting_value FROM settings WHERE setting_key = 'commission_rate'";
        $ss = $this->conn->prepare($sq);
        $ss->execute();
        $rate = (float)$ss->fetchColumn();

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
