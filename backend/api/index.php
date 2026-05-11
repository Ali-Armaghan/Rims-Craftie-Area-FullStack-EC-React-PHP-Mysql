<?php
// api/index.php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/database.php';

// Get the path from the URL
$path = isset($_GET['path']) ? $_GET['path'] : '';
$pathParts = explode('/', trim($path, '/'));

$module = isset($pathParts[0]) ? $pathParts[0] : '';
$action = isset($pathParts[1]) ? $pathParts[1] : '';

// Simple Router
switch ($module) {
    case 'auth':
        require_once __DIR__ . '/auth/handler.php';
        break;
    case 'products':
        require_once __DIR__ . '/products/handler.php';
        break;
    case 'orders':
        require_once __DIR__ . '/orders/handler.php';
        break;
    case 'resale':
        require_once __DIR__ . '/resale/handler.php';
        break;
    case 'tracking':
        require_once __DIR__ . '/tracking/handler.php';
        break;
    case 'admin':
        require_once __DIR__ . '/admin/handler.php';
        break;
    default:
        http_response_code(404);
        echo json_encode(["message" => "Endpoint not found."]);
        break;
}
?>
