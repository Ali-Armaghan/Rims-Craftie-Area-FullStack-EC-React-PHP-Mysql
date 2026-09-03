<?php

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["message" => "Method not allowed."]);
    exit;
}

$allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
$maxSize = 5 * 1024 * 1024;
$allowedVideoExtensions = ['mp4', 'webm', 'mov', 'ogg', 'm4v'];
$maxVideoSize = 50 * 1024 * 1024;
$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$origin = $scheme . '://' . $_SERVER['HTTP_HOST'];
$scriptDir = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME']));
$apiBase = preg_replace('#/api$#', '', $scriptDir);

function uploadImageFile(array $file, string $uploadDir, string $publicBase, string $prefix): ?string
{
    global $allowedExtensions, $maxSize;

    if ($file['error'] !== UPLOAD_ERR_OK) {
        return null;
    }

    if ($file['size'] > $maxSize) {
        http_response_code(400);
        echo json_encode(["message" => "Image must be 5MB or less."]);
        exit;
    }

    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($extension, $allowedExtensions, true)) {
        http_response_code(400);
        echo json_encode(["message" => "Only JPG, PNG, WEBP, and GIF images are allowed."]);
        exit;
    }

    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0775, true);
    }

    $fileName = uniqid($prefix, true) . '.' . $extension;
    $targetPath = $uploadDir . '/' . $fileName;

    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        return null;
    }

    return $publicBase . '/' . $fileName;
}

function uploadVideoFile(array $file, string $uploadDir, string $publicBase, string $prefix): ?string
{
    global $allowedVideoExtensions, $maxVideoSize;

    if ($file['error'] !== UPLOAD_ERR_OK) {
        return null;
    }

    if ($file['size'] > $maxVideoSize) {
        http_response_code(400);
        echo json_encode(["message" => "Video must be 50MB or less."]);
        exit;
    }

    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($extension, $allowedVideoExtensions, true)) {
        http_response_code(400);
        echo json_encode(["message" => "Only MP4, WEBM, MOV, and OGG videos are allowed."]);
        exit;
    }

    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0775, true);
    }

    $fileName = uniqid($prefix, true) . '.' . $extension;
    $targetPath = $uploadDir . '/' . $fileName;

    if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
        return null;
    }

    return $publicBase . '/' . $fileName;
}

if ($action === 'categories') {
    if (empty($_FILES['image']) || $_FILES['image']['error'] === UPLOAD_ERR_NO_FILE) {
        http_response_code(400);
        echo json_encode(["message" => "No image uploaded."]);
        exit;
    }

    $uploadDir = __DIR__ . '/../../uploads/categories';
    $publicBase = $origin . $apiBase . '/uploads/categories';
    $imageUrl = uploadImageFile($_FILES['image'], $uploadDir, $publicBase, 'category_');

    if (!$imageUrl) {
        http_response_code(500);
        echo json_encode(["message" => "Unable to upload image."]);
        exit;
    }

    echo json_encode([
        "message" => "Image uploaded.",
        "image" => $imageUrl,
    ]);
    exit;
}

if ($action === 'product-video' || ($action === 'products' && !empty($_FILES['video']))) {
    if (empty($_FILES['video']) || $_FILES['video']['error'] === UPLOAD_ERR_NO_FILE) {
        http_response_code(400);
        echo json_encode(["message" => "No video uploaded."]);
        exit;
    }

    $uploadDir = __DIR__ . '/../../uploads/products';
    $publicBase = $origin . $apiBase . '/uploads/products';
    $videoUrl = uploadVideoFile($_FILES['video'], $uploadDir, $publicBase, 'prod_video_');

    if (!$videoUrl) {
        http_response_code(500);
        echo json_encode(["message" => "Unable to upload video."]);
        exit;
    }

    echo json_encode([
        "message" => "Video uploaded.",
        "video" => $videoUrl,
    ]);
    exit;
}

if ($action !== 'products') {
    http_response_code(404);
    echo json_encode(["message" => "Upload endpoint not found."]);
    exit;
}

if (empty($_FILES['images'])) {
    http_response_code(400);
    echo json_encode(["message" => "No images uploaded."]);
    exit;
}

$uploadDir = __DIR__ . '/../../uploads/products';
$publicBase = $origin . $apiBase . '/uploads/products';
$uploaded = [];
$files = $_FILES['images'];

for ($i = 0; $i < count($files['name']); $i++) {
    $file = [
        'name' => $files['name'][$i],
        'type' => $files['type'][$i],
        'tmp_name' => $files['tmp_name'][$i],
        'error' => $files['error'][$i],
        'size' => $files['size'][$i],
    ];

    $url = uploadImageFile($file, $uploadDir, $publicBase, 'product_');
    if ($url) {
        $uploaded[] = $url;
    }
}

if (!$uploaded) {
    http_response_code(500);
    echo json_encode(["message" => "Unable to upload images."]);
    exit;
}

echo json_encode([
    "message" => "Images uploaded.",
    "images" => $uploaded,
]);
?>
