<?php
// api/products/handler.php

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/Product.php';

$database = new Database();
$db = $database->getConnection();
$product = new Product($db);

// action is already set by index.php or we use the remaining path
$slug = isset($pathParts[1]) ? $pathParts[1] : '';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if ($slug) {
        $res = $product->readOne($slug);
        if ($res) {
            echo json_encode($res);
        } else {
            http_response_code(404);
            echo json_encode(["message" => "Product not found."]);
        }
    } else {
        $params = $_GET;
        $res = $product->read($params);
        echo json_encode($res);
    }
}
?>
