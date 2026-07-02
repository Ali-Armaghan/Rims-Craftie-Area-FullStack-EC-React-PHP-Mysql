<?php
// api/loyalty/Loyalty.php

class Loyalty {
    private $conn;

    private const TIERS = [
        ['min' => 20000, 'percent' => 15, 'label' => 'Platinum'],
        ['min' => 15000, 'percent' => 12, 'label' => 'Gold'],
        ['min' => 10000, 'percent' => 8, 'label' => 'Silver'],
        ['min' => 5000, 'percent' => 5, 'label' => 'Bronze'],
    ];

    public function __construct($db) {
        $this->conn = $db;
    }

    public static function getTierDefinitions(): array {
        return array_reverse(self::TIERS);
    }

    public function getLifetimeSpent($userId): float {
        $query = "SELECT COALESCE(SUM(total), 0) AS lifetime_spent
                  FROM orders
                  WHERE user_id = ?
                    AND status = 'delivered'";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([(int) $userId]);
        return (float) $stmt->fetchColumn();
    }

    public function getTierForSpent(float $lifetimeSpent): array {
        foreach (self::TIERS as $tier) {
            if ($lifetimeSpent >= $tier['min']) {
                return $tier;
            }
        }

        return [
            'min' => 0,
            'percent' => 0,
            'label' => 'Member',
        ];
    }

    public function getNextTier(float $lifetimeSpent): ?array {
        $eligible = array_reverse(self::TIERS);
        foreach ($eligible as $tier) {
            if ($lifetimeSpent < $tier['min']) {
                return $tier;
            }
        }
        return null;
    }

    public function calculateDiscount(float $subtotal, float $lifetimeSpent): array {
        $tier = $this->getTierForSpent($lifetimeSpent);
        $percent = (float) $tier['percent'];
        $amount = round($subtotal * ($percent / 100), 2);
        $total = max(0, round($subtotal - $amount, 2));

        return [
            'lifetime_spent' => $lifetimeSpent,
            'tier_label' => $tier['label'],
            'tier_threshold' => $tier['min'],
            'discount_percent' => $percent,
            'discount_amount' => $amount,
            'total_after_discount' => $total,
        ];
    }

    public function getStatus($userId): array {
        $lifetimeSpent = $this->getLifetimeSpent($userId);
        $tier = $this->getTierForSpent($lifetimeSpent);
        $nextTier = $this->getNextTier($lifetimeSpent);

        return [
            'lifetime_spent' => $lifetimeSpent,
            'tier_label' => $tier['label'],
            'tier_threshold' => $tier['min'],
            'discount_percent' => (float) $tier['percent'],
            'next_tier_threshold' => $nextTier ? $nextTier['min'] : null,
            'next_tier_percent' => $nextTier ? (float) $nextTier['percent'] : null,
            'amount_to_next_tier' => $nextTier ? max(0, $nextTier['min'] - $lifetimeSpent) : 0,
            'tiers' => self::getTierDefinitions(),
        ];
    }
}
?>
