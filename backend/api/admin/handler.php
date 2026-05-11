<?php
// api/admin/handler.php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/Admin.php';

$database = new Database();
$db = $database->getConnection();
$admin = new Admin($db);

$data = json_decode(file_get_contents("php://input"));

// In a real app, verify Admin JWT here
// $isAdmin = verifyAdminToken(); 
// if (!$isAdmin) { http_response_code(403); exit; }

switch ($action) {
    case 'stats':
        echo json_encode($admin->getDashboardStats());
        break;

    case 'live-traffic':
        echo json_encode($admin->getLiveTraffic());
        break;

    case 'resale-management':
        echo json_encode($admin->getReSaleManagement());
        break;

    case 'adjust-balance':
        if (!empty($data->user_id) && !empty($data->amount) && !empty($data->type)) {
            $res = $admin->adjustUserBalance($data->user_id, $data->amount, $data->type, $data->reason, 1);
            echo json_encode(["success" => $res]);
        }
        break;

    case 'update-settings':
        if (!empty($data->key) && isset($data->value)) {
            $q = "UPDATE settings SET setting_value = ? WHERE setting_key = ?";
            $st = $db->prepare($q);
            $res = $st->execute([$data->value, $data->key]);
            echo json_encode(["success" => $res]);
        }
        break;

    default:
        http_response_code(404);
        break;
}
?>
