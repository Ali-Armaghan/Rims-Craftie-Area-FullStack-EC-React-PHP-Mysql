<?php
// api/admin/handler.php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/Admin.php';

$database = new Database();
$db = $database->getConnection();
$admin = new Admin($db);

$data = json_decode(file_get_contents("php://input"), true);
if (!is_array($data)) {
    $data = [];
}

// In a real app, verify Admin JWT here
// $isAdmin = verifyAdminToken(); 
// if (!$isAdmin) { http_response_code(403); exit; }

switch ($action) {
    case 'stats':
        echo json_encode($admin->getDashboardStats());
        break;
    
    case 'users':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            echo json_encode($admin->getUsers());
            break;
        }

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            $result = $admin->createUser($data);
            http_response_code(!empty($result['success']) ? 201 : 400);
            echo json_encode($result);
            break;
        }

        if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
            $id = !empty($data['id']) ? (int) $data['id'] : 0;
            $result = $admin->updateUser($id, $data);
            http_response_code(!empty($result['success']) ? 200 : 400);
            echo json_encode($result);
            break;
        }

        http_response_code(405);
        echo json_encode(["message" => "Method not allowed"]);
        break;

    case 'live-traffic':
        echo json_encode($admin->getLiveTraffic());
        break;

    case 'visitor-sessions':
        echo json_encode($admin->getVisitorSessions());
        break;

    case 'visitor-session':
        if (empty($_GET['id'])) {
            http_response_code(400);
            echo json_encode(["message" => "Session id is required"]);
            break;
        }

        $session = $admin->getVisitorSessionDetails($_GET['id']);
        if (!$session) {
            http_response_code(404);
            echo json_encode(["message" => "Session not found"]);
            break;
        }

        echo json_encode($session);
        break;

    case 'analytics':
        echo json_encode($admin->getTrafficAnalytics());
        break;

    case 'page-analytics':
        $days = isset($_GET['days']) ? (int)$_GET['days'] : 7;
        echo json_encode($admin->getPageAnalytics($days));
        break;

    case 'sale-countdown':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') {
            echo json_encode($admin->getSaleCountdownSettings());
            break;
        }

        if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT') {
            $enabled = !empty($data['enabled']);
            $ends_at = $data['ends_at'] ?? null;
            echo json_encode($admin->updateSaleCountdownSettings($enabled, $ends_at));
            break;
        }

        http_response_code(405);
        echo json_encode(["message" => "Method not allowed"]);
        break;

    case 'update-settings':
        if (!empty($data['key']) && array_key_exists('value', $data)) {
            $q = "UPDATE settings SET setting_value = ? WHERE setting_key = ?";
            $st = $db->prepare($q);
            $res = $st->execute([$data['value'], $data['key']]);
            echo json_encode(["success" => $res]);
        }
        break;

    default:
        http_response_code(404);
        break;
}
?>
