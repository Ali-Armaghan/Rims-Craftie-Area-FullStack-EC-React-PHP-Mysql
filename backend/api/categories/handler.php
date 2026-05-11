<?php
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/Category.php';

$database = new Database();
$db = $database->getConnection();
$category = new Category($db);

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $res = $category->read();
    echo json_encode($res);
}
?>
