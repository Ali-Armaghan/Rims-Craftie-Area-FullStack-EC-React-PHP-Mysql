<?php

/**
 * Public base URL for /uploads/... (no trailing slash).
 * Override in config/public.php on production if needed.
 */
function public_upload_origin(): string
{
    static $origin = null;
    if ($origin !== null) {
        return $origin;
    }

    $configFile = __DIR__ . '/../config/public.php';
    if (is_file($configFile)) {
        $cfg = include $configFile;
        if (!empty($cfg['upload_origin']) && is_string($cfg['upload_origin'])) {
            $origin = rtrim($cfg['upload_origin'], '/');
            return $origin;
        }
    }

    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $scriptDir = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/api/index.php'));
    $apiBase = preg_replace('#/api/?$#', '', $scriptDir);

    $origin = rtrim($scheme . '://' . $host . $apiBase, '/');
    return $origin;
}

/** Turn stored localhost (or any host) upload paths into the live server URL. */
function normalize_upload_url(?string $url): ?string
{
    if ($url === null || trim($url) === '') {
        return $url;
    }

    $url = trim($url);

    if (preg_match('#/uploads/(?:categories|products)/[^\s?#]+#i', $url, $matches)) {
        return public_upload_origin() . $matches[0];
    }

    if (preg_match('#^/uploads/#i', $url)) {
        return public_upload_origin() . $url;
    }

    return $url;
}

function normalize_category_row(array $row): array
{
    if (array_key_exists('image', $row)) {
        $row['image'] = normalize_upload_url($row['image']);
    }
    return $row;
}

function normalize_product_row(array $row): array
{
    if (!isset($row['images'])) {
        return $row;
    }

    $images = $row['images'];

    if (is_string($images) && trim($images) !== '') {
        $decoded = json_decode($images, true);
        if (is_array($decoded)) {
            $normalized = array_map(
                static fn($img) => is_string($img) ? normalize_upload_url($img) : $img,
                $decoded
            );
            $row['images'] = json_encode($normalized);
        } else {
            $row['images'] = json_encode([normalize_upload_url($images)]);
        }
    } elseif (is_array($images)) {
        $row['images'] = array_map(
            static fn($img) => is_string($img) ? normalize_upload_url($img) : $img,
            $images
        );
    }

    if (array_key_exists('price', $row)) {
        $row['sale_price'] = $row['price'] !== null ? (float)$row['price'] : 0;
    }

    if (array_key_exists('original_price', $row)) {
        $row['original_price'] = $row['original_price'] !== null
            ? (float)$row['original_price']
            : null;
    }

    if (array_key_exists('description', $row)) {
        $row['short_description'] = $row['description'];
    }

    return $row;
}
