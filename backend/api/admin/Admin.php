<?php
// api/admin/Admin.php

class Admin {
    private $conn;

    public function __construct($db) {
        $this->conn = $db;
        $this->ensureUserResaleColumns();
        $this->ensureOrderResaleColumns();
    }

    private function ensureColumn($table, $column, $sql) {
        try {
            $this->conn->query("SELECT $column FROM $table LIMIT 1");
        } catch (Exception $e) {
            try {
                $this->conn->exec($sql);
            } catch (Exception $ignored) {
            }
        }
    }

    private function ensureUserResaleColumns() {
        static $done = false;
        if ($done) {
            return;
        }

        $this->ensureColumn(
            'users',
            'resale_discount_percent',
            "ALTER TABLE users ADD COLUMN resale_discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00 AFTER resale_code"
        );
        $this->ensureColumn(
            'users',
            'resale_commission_percent',
            "ALTER TABLE users ADD COLUMN resale_commission_percent DECIMAL(5,2) NOT NULL DEFAULT 5.00 AFTER resale_discount_percent"
        );
        $this->ensureColumn(
            'users',
            'resale_code_active',
            "ALTER TABLE users ADD COLUMN resale_code_active TINYINT(1) NOT NULL DEFAULT 1 AFTER resale_commission_percent"
        );

        $done = true;
    }

    private function ensureOrderResaleColumns() {
        static $done = false;
        if ($done) {
            return;
        }

        $this->ensureColumn(
            'orders',
            'referrer_user_id',
            "ALTER TABLE orders ADD COLUMN referrer_user_id INT NULL DEFAULT NULL AFTER referred_by_code"
        );
        $this->ensureColumn(
            'orders',
            'resale_discount_percent',
            "ALTER TABLE orders ADD COLUMN resale_discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00 AFTER referrer_user_id"
        );
        $this->ensureColumn(
            'orders',
            'resale_discount_amount',
            "ALTER TABLE orders ADD COLUMN resale_discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER resale_discount_percent"
        );
        $this->ensureColumn(
            'orders',
            'resale_commission_percent',
            "ALTER TABLE orders ADD COLUMN resale_commission_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00 AFTER resale_discount_amount"
        );

        $done = true;
    }

    private function sanitizeResaleCode($value) {
        $code = strtoupper(trim((string) $value));
        return preg_replace('/[^A-Z0-9-]/', '', $code);
    }

    private function clampPercent($value, $default = 0) {
        if ($value === null || $value === '') {
            return (float) $default;
        }

        $number = round((float) $value, 2);
        return max(0, min(100, $number));
    }

    private function generateUniqueResaleCode() {
        $characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        do {
            $code = 'RS-';
            for ($i = 0; $i < 8; $i++) {
                $code .= $characters[rand(0, strlen($characters) - 1)];
            }

            $stmt = $this->conn->prepare("SELECT id FROM users WHERE resale_code = ? LIMIT 1");
            $stmt->execute([$code]);
        } while ($stmt->fetch(PDO::FETCH_ASSOC));

        return $code;
    }

    public function getDashboardStats() {
        $stats = [];
        
        // Total Sales
        $q1 = "SELECT SUM(total) as total_sales FROM orders WHERE status != 'cancelled'";
        $stats['total_sales'] = $this->conn->query($q1)->fetchColumn() ?: 0;

        // Total Orders
        $q2 = "SELECT COUNT(*) as total_orders FROM orders";
        $stats['total_orders'] = $this->conn->query($q2)->fetchColumn() ?: 0;

        // Total Users
        $q3 = "SELECT COUNT(*) as total_users FROM users";
        $stats['total_users'] = $this->conn->query($q3)->fetchColumn() ?: 0;

        // Live Visitors (last 2 minutes)
        $q4 = "SELECT COUNT(*) FROM live_traffic WHERE last_ping_at > DATE_SUB(NOW(), INTERVAL 2 MINUTE)";
        $stats['live_visitors'] = $this->conn->query($q4)->fetchColumn() ?: 0;

        $monthlySales = array_fill(1, 12, 0);
        $q5 = "SELECT MONTH(created_at) as month, COALESCE(SUM(total), 0) as total
               FROM orders
               WHERE status != 'cancelled' AND YEAR(created_at) = YEAR(CURDATE())
               GROUP BY MONTH(created_at)";
        $stmt = $this->conn->prepare($q5);
        $stmt->execute();
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $monthlySales[(int)$row['month']] = (float)$row['total'];
        }

        $monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        $stats['monthly_sales'] = [];
        foreach ($monthNames as $index => $name) {
            $stats['monthly_sales'][] = [
                'name' => $name,
                'total' => $monthlySales[$index + 1]
            ];
        }

        $q6 = "SELECT o.id, o.order_number, o.total, o.created_at,
                      COALESCE(u.name, 'Guest') as customer_name,
                      COALESCE(u.email, '') as customer_email
               FROM orders o
               LEFT JOIN users u ON o.user_id = u.id
               ORDER BY o.created_at DESC
               LIMIT 5";
        $stmt = $this->conn->prepare($q6);
        $stmt->execute();
        $stats['recent_orders'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return $stats;
    }

    public function getLiveTraffic() {
        $query = "SELECT lt.session_id, lt.current_page, lt.current_page_title,
                         lt.current_page_view_id, lt.is_logged_in, lt.last_ping_at,
                         vs.session_uuid, vs.ip_address, vs.user_agent, vs.device_type,
                         vs.browser, vs.os, vs.landing_page, vs.first_seen,
                         vs.page_count, vs.total_duration,
                         COALESCE(u.name, 'Guest') as user_name,
                         COALESCE(u.email, '') as user_email
                  FROM live_traffic lt 
                  JOIN visitor_sessions vs ON lt.session_id = vs.id 
                  LEFT JOIN users u ON vs.user_id = u.id 
                  WHERE lt.last_ping_at > DATE_SUB(NOW(), INTERVAL 5 MINUTE) 
                  ORDER BY lt.last_ping_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getVisitorSessions() {
        $query = "SELECT vs.id, vs.session_uuid, vs.user_id, vs.ip_address,
                         vs.device_type, vs.browser, vs.os, vs.referer_url,
                         vs.landing_page, vs.page_count, vs.total_duration,
                         vs.is_active, vs.first_seen, vs.last_seen, vs.ended_at,
                         COALESCE(u.name, 'Guest') as user_name,
                         COALESCE(u.email, '') as user_email,
                         COUNT(pv.id) as actual_page_views
                  FROM visitor_sessions vs
                  LEFT JOIN users u ON vs.user_id = u.id
                  LEFT JOIN page_views pv ON pv.session_id = vs.id
                  GROUP BY vs.id
                  ORDER BY vs.last_seen DESC
                  LIMIT 200";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getVisitorSessionDetails($session_id) {
        $sessionQuery = "SELECT vs.*, COALESCE(u.name, 'Guest') as user_name,
                                COALESCE(u.email, '') as user_email
                         FROM visitor_sessions vs
                         LEFT JOIN users u ON vs.user_id = u.id
                         WHERE vs.id = ?";
        $stmt = $this->conn->prepare($sessionQuery);
        $stmt->execute([$session_id]);
        $session = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$session) {
            return null;
        }

        $pageQuery = "SELECT id, page_path, page_url, page_title, referrer_url,
                             stay_duration, entered_at, exited_at, exit_type
                      FROM page_views
                      WHERE session_id = ?
                      ORDER BY entered_at DESC";
        $stmt = $this->conn->prepare($pageQuery);
        $stmt->execute([$session_id]);
        $session['page_views'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $eventQuery = "SELECT id, page_view_id, event_type, event_name,
                              page_path, event_data, occurred_at
                       FROM visitor_events
                       WHERE session_id = ?
                       ORDER BY occurred_at DESC
                       LIMIT 100";
        $stmt = $this->conn->prepare($eventQuery);
        $stmt->execute([$session_id]);
        $session['events'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return $session;
    }

    private function percentChange($current, $previous) {
        if ((float)$previous === 0.0) {
            return (float)$current > 0 ? 100 : 0;
        }

        return round((($current - $previous) / $previous) * 100, 1);
    }

    private function secondsDiff($current, $previous) {
        return (int)$current - (int)$previous;
    }

    public function getTrafficAnalytics() {
        $currentStart = "DATE_SUB(CURDATE(), INTERVAL 6 DAY)";
        $previousStart = "DATE_SUB(CURDATE(), INTERVAL 13 DAY)";
        $previousEnd = "DATE_SUB(CURDATE(), INTERVAL 7 DAY)";

        $chart = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = date('Y-m-d', strtotime("-$i day"));
            $chart[$date] = [
                'name' => date('D', strtotime($date)),
                'clicks' => 0,
                'uniques' => 0
            ];
        }

        $q1 = "SELECT DATE(occurred_at) as day, COUNT(*) as clicks
               FROM visitor_events
               WHERE event_type = 'click' AND occurred_at >= $currentStart
               GROUP BY DATE(occurred_at)";
        $stmt = $this->conn->prepare($q1);
        $stmt->execute();
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            if (isset($chart[$row['day']])) {
                $chart[$row['day']]['clicks'] = (int)$row['clicks'];
            }
        }

        $q2 = "SELECT DATE(first_seen) as day, COUNT(DISTINCT session_uuid) as uniques
               FROM visitor_sessions
               WHERE first_seen >= $currentStart
               GROUP BY DATE(first_seen)";
        $stmt = $this->conn->prepare($q2);
        $stmt->execute();
        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            if (isset($chart[$row['day']])) {
                $chart[$row['day']]['uniques'] = (int)$row['uniques'];
            }
        }

        $currentClicks = (int)$this->conn->query("SELECT COUNT(*) FROM visitor_events WHERE event_type = 'click' AND occurred_at >= $currentStart")->fetchColumn();
        $previousClicks = (int)$this->conn->query("SELECT COUNT(*) FROM visitor_events WHERE event_type = 'click' AND occurred_at BETWEEN $previousStart AND $previousEnd")->fetchColumn();

        $currentVisitors = (int)$this->conn->query("SELECT COUNT(DISTINCT session_uuid) FROM visitor_sessions WHERE first_seen >= $currentStart")->fetchColumn();
        $previousVisitors = (int)$this->conn->query("SELECT COUNT(DISTINCT session_uuid) FROM visitor_sessions WHERE first_seen BETWEEN $previousStart AND $previousEnd")->fetchColumn();

        $currentSessions = (int)$this->conn->query("SELECT COUNT(*) FROM visitor_sessions WHERE first_seen >= $currentStart")->fetchColumn();
        $previousSessions = (int)$this->conn->query("SELECT COUNT(*) FROM visitor_sessions WHERE first_seen BETWEEN $previousStart AND $previousEnd")->fetchColumn();

        $currentBounces = (int)$this->conn->query("SELECT COUNT(*) FROM visitor_sessions WHERE first_seen >= $currentStart AND page_count <= 1")->fetchColumn();
        $previousBounces = (int)$this->conn->query("SELECT COUNT(*) FROM visitor_sessions WHERE first_seen BETWEEN $previousStart AND $previousEnd AND page_count <= 1")->fetchColumn();

        $currentBounceRate = $currentSessions > 0 ? round(($currentBounces / $currentSessions) * 100, 1) : 0;
        $previousBounceRate = $previousSessions > 0 ? round(($previousBounces / $previousSessions) * 100, 1) : 0;

        $currentAvgSession = (int)$this->conn->query("SELECT COALESCE(AVG(total_duration), 0) FROM visitor_sessions WHERE first_seen >= $currentStart")->fetchColumn();
        $previousAvgSession = (int)$this->conn->query("SELECT COALESCE(AVG(total_duration), 0) FROM visitor_sessions WHERE first_seen BETWEEN $previousStart AND $previousEnd")->fetchColumn();

        $q3 = "SELECT
                  CASE
                    WHEN referer_url IS NULL OR referer_url = '' OR referer_url = 'direct' THEN 'Direct'
                    ELSE SUBSTRING_INDEX(REPLACE(REPLACE(referer_url, 'https://', ''), 'http://', ''), '/', 1)
                  END as name,
                  COUNT(*) as value
               FROM visitor_sessions
               WHERE first_seen >= $currentStart
               GROUP BY name
               ORDER BY value DESC
               LIMIT 5";
        $stmt = $this->conn->prepare($q3);
        $stmt->execute();
        $referrers = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $q4 = "SELECT COALESCE(device_type, 'unknown') as name, COUNT(*) as count
               FROM visitor_sessions
               WHERE first_seen >= $currentStart
               GROUP BY device_type";
        $stmt = $this->conn->prepare($q4);
        $stmt->execute();
        $deviceRows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $deviceTotal = array_sum(array_map(function ($row) { return (int)$row['count']; }, $deviceRows));
        $devices = [];
        foreach ($deviceRows as $row) {
            $devices[] = [
                'name' => ucfirst($row['name']),
                'value' => $deviceTotal > 0 ? round(((int)$row['count'] / $deviceTotal) * 100) : 0
            ];
        }

        $q5 = "SELECT pv.id, pv.page_path, pv.page_title, pv.page_url,
                      pv.referrer_url, pv.stay_duration, pv.entered_at,
                      pv.exited_at, pv.exit_type,
                      vs.session_uuid, vs.ip_address, vs.device_type, vs.browser,
                      vs.os, COALESCE(u.name, 'Guest') as user_name,
                      COALESCE(u.email, '') as user_email
               FROM page_views pv
               JOIN visitor_sessions vs ON pv.session_id = vs.id
               LEFT JOIN users u ON pv.user_id = u.id
               ORDER BY pv.entered_at DESC
               LIMIT 50";
        $stmt = $this->conn->prepare($q5);
        $stmt->execute();
        $pageViews = $stmt->fetchAll(PDO::FETCH_ASSOC);

        return [
            'chart' => array_values($chart),
            'total_clicks' => $currentClicks,
            'total_clicks_change' => $this->percentChange($currentClicks, $previousClicks),
            'unique_visitors' => $currentVisitors,
            'unique_visitors_change' => $this->percentChange($currentVisitors, $previousVisitors),
            'bounce_rate' => $currentBounceRate,
            'bounce_rate_change' => round($currentBounceRate - $previousBounceRate, 1),
            'avg_session' => $currentAvgSession,
            'avg_session_change' => $this->secondsDiff($currentAvgSession, $previousAvgSession),
            'referrers' => $referrers,
            'devices' => $devices,
            'page_views' => $pageViews
        ];
    }

    public function getPageAnalytics($days = 7) {
        $days = max(1, min(90, (int)$days));
        $since = "DATE_SUB(NOW(), INTERVAL $days DAY)";

        $query = "SELECT pv.page_path,
                         MAX(NULLIF(pv.page_title, '')) AS page_title,
                         COUNT(*) AS page_views,
                         COUNT(DISTINCT pv.session_id) AS unique_visitors,
                         ROUND(AVG(CASE WHEN pv.stay_duration > 0 THEN pv.stay_duration END), 0) AS avg_stay_seconds
                  FROM page_views pv
                  WHERE pv.entered_at >= $since
                  GROUP BY pv.page_path
                  ORDER BY page_views DESC
                  LIMIT 12";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $pages = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($pages as &$page) {
            $page['page_views'] = (int)$page['page_views'];
            $page['unique_visitors'] = (int)$page['unique_visitors'];
            $page['avg_stay_seconds'] = (int)($page['avg_stay_seconds'] ?? 0);
            $page['label'] = $this->formatPageLabel($page['page_path']);
        }
        unset($page);

        $totalPageViews = (int)$this->conn->query(
            "SELECT COUNT(*) FROM page_views WHERE entered_at >= $since"
        )->fetchColumn();

        $totalUniqueVisitors = (int)$this->conn->query(
            "SELECT COUNT(DISTINCT session_uuid) FROM visitor_sessions WHERE first_seen >= $since"
        )->fetchColumn();

        $overallAvgStay = (int)$this->conn->query(
            "SELECT COALESCE(ROUND(AVG(CASE WHEN stay_duration > 0 THEN stay_duration END), 0), 0)
             FROM page_views WHERE entered_at >= $since"
        )->fetchColumn();

        return [
            'days' => $days,
            'total_page_views' => $totalPageViews,
            'total_unique_visitors' => $totalUniqueVisitors,
            'overall_avg_stay_seconds' => $overallAvgStay,
            'pages' => $pages,
        ];
    }

    private function formatPageLabel($pagePath) {
        $path = trim($pagePath ?: '/');

        if ($path === '/') {
            return 'Home';
        }

        $pathPart = $path;
        $queryPart = '';
        if (($queryPos = strpos($path, '?')) !== false) {
            $pathPart = substr($path, 0, $queryPos);
            $queryPart = substr($path, $queryPos + 1);
        }

        $segments = array_values(array_filter(explode('/', trim($pathPart, '/'))));
        $segmentLabel = $segments
            ? ucwords(str_replace(['-', '_'], ' ', end($segments)))
            : 'Page';

        if (count($segments) > 1 && preg_match('/^\d+$/', end($segments))) {
            $parent = $segments[count($segments) - 2];
            $segmentLabel = ucwords(str_replace(['-', '_'], ' ', $parent)) . ' #' . end($segments);
        }

        if ($queryPart !== '') {
            $shortQuery = strlen($queryPart) > 16
                ? substr($queryPart, 0, 14) . '..'
                : $queryPart;
            $label = $segmentLabel . ' (' . $shortQuery . ')';
        } else {
            $label = $pathPart;
        }

        if (strlen($label) > 40) {
            return substr($label, 0, 37) . '...';
        }

        return $label;
    }

    public function getReSaleManagement() {
        $query = "SELECT id, name, email, resale_code, resale_balance,
                         resale_discount_percent, resale_commission_percent, resale_code_active
                  FROM users ORDER BY resale_balance DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function adjustUserBalance($user_id, $amount, $type, $reason, $admin_id) {
        try {
            $this->conn->beginTransaction();

            $operator = ($type === 'credit') ? '+' : '-';
            $query = "UPDATE users SET resale_balance = resale_balance $operator ? WHERE id = ?";
            $this->conn->prepare($query)->execute([$amount, $user_id]);

            $lQuery = "INSERT INTO resale_ledger SET user_id=?, type=?, amount=?, description=?";
            $desc = "Admin Adjustment: " . $reason;
            $this->conn->prepare($lQuery)->execute([$user_id, $type, $amount, $desc]);

            $this->conn->commit();
            return true;
        } catch (Exception $e) {
            $this->conn->rollBack();
            return false;
        }
    }
    public function getUsers() {
        $query = "SELECT id, name, email, phone, resale_code, resale_balance,
                         resale_discount_percent, resale_commission_percent, resale_code_active,
                         status, created_at
                  FROM users ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function createUser($data) {
        $name = trim((string) ($data['name'] ?? ''));
        $email = strtolower(trim((string) ($data['email'] ?? '')));
        $password = (string) ($data['password'] ?? '');
        $phone = trim((string) ($data['phone'] ?? ''));
        $status = ($data['status'] ?? 'active') === 'inactive' ? 'inactive' : 'active';
        $resaleCode = !empty($data['resale_code'])
            ? $this->sanitizeResaleCode($data['resale_code'])
            : $this->generateUniqueResaleCode();
        $discountPercent = $this->clampPercent($data['resale_discount_percent'] ?? 0, 0);
        $commissionPercent = $this->clampPercent($data['resale_commission_percent'] ?? 5, 5);
        $codeActive = !empty($data['resale_code_active']) ? 1 : 0;

        if ($name === '' || $email === '' || $password === '' || $resaleCode === '') {
            return ['success' => false, 'message' => 'Missing required fields'];
        }

        $emailStmt = $this->conn->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
        $emailStmt->execute([$email]);
        if ($emailStmt->fetch(PDO::FETCH_ASSOC)) {
            return ['success' => false, 'message' => 'Email already exists'];
        }

        $codeStmt = $this->conn->prepare("SELECT id FROM users WHERE resale_code = ? LIMIT 1");
        $codeStmt->execute([$resaleCode]);
        if ($codeStmt->fetch(PDO::FETCH_ASSOC)) {
            return ['success' => false, 'message' => 'Resale code already exists'];
        }

        $query = "INSERT INTO users
                  SET name=?, email=?, password=?, phone=?, resale_code=?,
                      resale_discount_percent=?, resale_commission_percent=?,
                      resale_code_active=?, status=?";
        $stmt = $this->conn->prepare($query);
        $ok = $stmt->execute([
            $name,
            $email,
            password_hash($password, PASSWORD_BCRYPT),
            $phone,
            $resaleCode,
            $discountPercent,
            $commissionPercent,
            $codeActive,
            $status,
        ]);

        if (!$ok) {
            return ['success' => false, 'message' => 'Unable to create user'];
        }

        return ['success' => true, 'id' => (int) $this->conn->lastInsertId(), 'resale_code' => $resaleCode];
    }

    public function updateUser($id, $data) {
        $id = (int) $id;
        if ($id <= 0) {
            return ['success' => false, 'message' => 'Invalid user id'];
        }

        $currentStmt = $this->conn->prepare("SELECT id, email, resale_code FROM users WHERE id = ? LIMIT 1");
        $currentStmt->execute([$id]);
        $current = $currentStmt->fetch(PDO::FETCH_ASSOC);
        if (!$current) {
            return ['success' => false, 'message' => 'User not found'];
        }

        $name = trim((string) ($data['name'] ?? ''));
        $email = strtolower(trim((string) ($data['email'] ?? '')));
        $phone = trim((string) ($data['phone'] ?? ''));
        $status = ($data['status'] ?? 'active') === 'inactive' ? 'inactive' : 'active';
        $resaleCode = !empty($data['resale_code'])
            ? $this->sanitizeResaleCode($data['resale_code'])
            : $current['resale_code'];
        $discountPercent = $this->clampPercent($data['resale_discount_percent'] ?? 0, 0);
        $commissionPercent = $this->clampPercent($data['resale_commission_percent'] ?? 5, 5);
        $codeActive = !empty($data['resale_code_active']) ? 1 : 0;
        $password = isset($data['password']) ? trim((string) $data['password']) : '';

        if ($name === '' || $email === '' || $resaleCode === '') {
            return ['success' => false, 'message' => 'Missing required fields'];
        }

        $emailStmt = $this->conn->prepare("SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1");
        $emailStmt->execute([$email, $id]);
        if ($emailStmt->fetch(PDO::FETCH_ASSOC)) {
            return ['success' => false, 'message' => 'Email already exists'];
        }

        $codeStmt = $this->conn->prepare("SELECT id FROM users WHERE resale_code = ? AND id != ? LIMIT 1");
        $codeStmt->execute([$resaleCode, $id]);
        if ($codeStmt->fetch(PDO::FETCH_ASSOC)) {
            return ['success' => false, 'message' => 'Resale code already exists'];
        }

        $query = "UPDATE users
                  SET name=?, email=?, phone=?, resale_code=?,
                      resale_discount_percent=?, resale_commission_percent=?,
                      resale_code_active=?, status=?";
        $params = [$name, $email, $phone, $resaleCode, $discountPercent, $commissionPercent, $codeActive, $status];

        if ($password !== '') {
            $query .= ", password=?";
            $params[] = password_hash($password, PASSWORD_BCRYPT);
        }

        $query .= " WHERE id=?";
        $params[] = $id;

        $stmt = $this->conn->prepare($query);
        $ok = $stmt->execute($params);

        if (!$ok) {
            return ['success' => false, 'message' => 'Unable to update user'];
        }

        return ['success' => true, 'id' => $id, 'resale_code' => $resaleCode];
    }

    public function getSaleCountdownSettings() {
        $keys = ['sale_countdown_enabled', 'sale_countdown_ends_at'];
        $placeholders = implode(',', array_fill(0, count($keys), '?'));
        $query = "SELECT setting_key, setting_value FROM settings WHERE setting_key IN ($placeholders)";
        $stmt = $this->conn->prepare($query);
        $stmt->execute($keys);

        $settings = [
            'enabled' => false,
            'ends_at' => null
        ];

        foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
            if ($row['setting_key'] === 'sale_countdown_enabled') {
                $settings['enabled'] = $row['setting_value'] === '1';
            }

            if ($row['setting_key'] === 'sale_countdown_ends_at') {
                $settings['ends_at'] = $row['setting_value'];
            }
        }

        return $settings;
    }

    public function updateSaleCountdownSettings($enabled, $ends_at) {
        $query = "INSERT INTO settings (setting_key, setting_value)
                  VALUES (?, ?)
                  ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)";
        $stmt = $this->conn->prepare($query);

        $enabledValue = $enabled ? '1' : '0';
        $stmt->execute(['sale_countdown_enabled', $enabledValue]);
        $stmt->execute(['sale_countdown_ends_at', $ends_at]);

        return $this->getSaleCountdownSettings();
    }
}
?>
