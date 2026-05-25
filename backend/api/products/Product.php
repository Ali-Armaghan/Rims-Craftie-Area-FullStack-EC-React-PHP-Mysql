<?php
// api/products/Product.php

require_once __DIR__ . '/../helpers.php';

class Product {
    private $conn;
    private $table_name = "products";

    public function __construct($db) {
        $this->conn = $db;
        $this->ensureProductCategoriesTable();
    }

    private function ensureProductCategoriesTable() {
        static $done = false;
        if ($done) {
            return;
        }

        try {
            $this->conn->query("SELECT 1 FROM product_categories LIMIT 1");
            $done = true;
            return;
        } catch (Exception $e) {
        }

        try {
            $this->conn->exec(
                "CREATE TABLE IF NOT EXISTS product_categories (
                    product_id INT NOT NULL,
                    category_id INT NOT NULL,
                    PRIMARY KEY (product_id, category_id),
                    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
                    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
                )"
            );

            $this->conn->exec(
                "INSERT IGNORE INTO product_categories (product_id, category_id)
                 SELECT id, category_id FROM products WHERE category_id IS NOT NULL"
            );
        } catch (Exception $ignored) {
        }

        $done = true;
    }

    private function parseImages($images) {
        if (is_array($images)) {
            return array_values(array_filter($images, function ($image) {
                return is_string($image) && trim($image) !== '';
            }));
        }

        if (!is_string($images) || trim($images) === '') {
            return [];
        }

        $decoded = json_decode($images, true);
        if (is_array($decoded)) {
            return array_values(array_filter($decoded, function ($image) {
                return is_string($image) && trim($image) !== '';
            }));
        }

        return [$images];
    }

    private function extractCategoryIds($data) {
        if (!empty($data['category_ids']) && is_array($data['category_ids'])) {
            $ids = array_map('intval', $data['category_ids']);
            return array_values(array_filter($ids, static fn($id) => $id > 0));
        }

        if (!empty($data['category_id'])) {
            return [(int)$data['category_id']];
        }

        return [];
    }

    private function syncProductCategories($productId, array $categoryIds) {
        $this->ensureProductCategoriesTable();

        $delete = $this->conn->prepare("DELETE FROM product_categories WHERE product_id = ?");
        $delete->execute([(int)$productId]);

        if (!$categoryIds) {
            $clear = $this->conn->prepare("UPDATE products SET category_id = NULL WHERE id = ?");
            $clear->execute([(int)$productId]);
            return;
        }

        $insert = $this->conn->prepare(
            "INSERT INTO product_categories (product_id, category_id) VALUES (?, ?)"
        );

        foreach ($categoryIds as $categoryId) {
            $insert->execute([(int)$productId, (int)$categoryId]);
        }

        $primaryId = $categoryIds[0];
        $update = $this->conn->prepare("UPDATE products SET category_id = ? WHERE id = ?");
        $update->execute([(int)$primaryId, (int)$productId]);
    }

    private function fetchCategoriesMap(array $productIds) {
        $this->ensureProductCategoriesTable();

        if (!$productIds) {
            return [];
        }

        $productIds = array_values(array_unique(array_map('intval', $productIds)));
        $placeholders = implode(',', array_fill(0, count($productIds), '?'));

        $query = "SELECT pc.product_id, c.id, c.name, c.slug
                  FROM product_categories pc
                  INNER JOIN categories c ON c.id = pc.category_id
                  WHERE pc.product_id IN ($placeholders)
                  ORDER BY c.name ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute($productIds);

        $map = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $productId = (int)$row['product_id'];
            if (!isset($map[$productId])) {
                $map[$productId] = [];
            }
            $map[$productId][] = [
                'id' => (int)$row['id'],
                'name' => $row['name'],
                'slug' => $row['slug'],
            ];
        }

        return $map;
    }

    private function attachCategoriesToRow(array $row, array $categoriesMap = null) {
        $productId = (int)$row['id'];
        $categories = $categoriesMap[$productId] ?? [];

        if (!$categories && !empty($row['category_id'])) {
            $fallbackQuery = "SELECT id, name, slug FROM categories WHERE id = ? LIMIT 1";
            $stmt = $this->conn->prepare($fallbackQuery);
            $stmt->execute([(int)$row['category_id']]);
            $fallback = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($fallback) {
                $categories = [[
                    'id' => (int)$fallback['id'],
                    'name' => $fallback['name'],
                    'slug' => $fallback['slug'],
                ]];
            }
        }

        $row['categories'] = $categories;
        $row['category_ids'] = array_map(static fn($cat) => (int)$cat['id'], $categories);
        $row['category_names'] = implode(', ', array_map(static fn($cat) => $cat['name'], $categories));

        if ($categories) {
            $row['category_id'] = $categories[0]['id'];
            $row['category_name'] = $categories[0]['name'];
        }

        return $row;
    }

    private function attachCategories(array $rows) {
        if (!$rows) {
            return $rows;
        }

        $productIds = array_map(static fn($row) => (int)$row['id'], $rows);
        $categoriesMap = $this->fetchCategoriesMap($productIds);

        return array_map(function ($row) use ($categoriesMap) {
            return $this->attachCategoriesToRow($row, $categoriesMap);
        }, $rows);
    }

    private function getImagesById($id) {
        $query = "SELECT images FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$id]);
        $images = $stmt->fetchColumn();

        return $this->parseImages($images);
    }

    private function deleteLocalImage($imageUrl) {
        $path = parse_url($imageUrl, PHP_URL_PATH);
        if (!$path || strpos($path, '/uploads/products/') === false) {
            return;
        }

        $fileName = basename($path);
        if ($fileName === '' || $fileName === '.' || $fileName === '..') {
            return;
        }

        $uploadDir = realpath(__DIR__ . '/../../uploads/products');
        if (!$uploadDir) {
            return;
        }

        $filePath = $uploadDir . DIRECTORY_SEPARATOR . $fileName;
        $realFilePath = realpath($filePath);

        if (
            $realFilePath &&
            strpos($realFilePath, $uploadDir) === 0 &&
            is_file($realFilePath)
        ) {
            unlink($realFilePath);
        }
    }

    private function deleteRemovedImages($oldImages, $newImages) {
        $removedImages = array_diff($oldImages, $newImages);

        foreach ($removedImages as $image) {
            $this->deleteLocalImage($image);
        }
    }

    public function read($params = []) {
        $query = "SELECT p.*, c.name as category_name,
                         COALESCE(ROUND(AVG(r.rating), 1), 0) as average_rating,
                         COUNT(r.id) as review_count
                  FROM " . $this->table_name . " p 
                  LEFT JOIN categories c ON p.category_id = c.id 
                  LEFT JOIN product_reviews r ON r.product_id = p.id AND r.status = 'approved'
                  WHERE p.is_active = 1";

        if (isset($params['category'])) {
            $query .= " AND (
                EXISTS (
                    SELECT 1 FROM product_categories pc
                    INNER JOIN categories cat ON cat.id = pc.category_id
                    WHERE pc.product_id = p.id AND cat.slug = :cat
                )
                OR c.slug = :cat
            )";
        }

        $query .= " GROUP BY p.id ORDER BY p.created_at DESC";

        $stmt = $this->conn->prepare($query);

        if (isset($params['category'])) {
            $stmt->bindParam(':cat', $params['category']);
        }

        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $rows = $this->attachCategories($rows);

        return array_map('normalize_product_row', $rows);
    }

    public function readOne($slug) {
        $query = "SELECT p.*, c.name as category_name,
                         COALESCE(ROUND(AVG(r.rating), 1), 0) as average_rating,
                         COUNT(r.id) as review_count
                  FROM " . $this->table_name . " p 
                  LEFT JOIN categories c ON p.category_id = c.id 
                  LEFT JOIN product_reviews r ON r.product_id = p.id AND r.status = 'approved'
                  WHERE p.slug = ? GROUP BY p.id LIMIT 0,1";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$slug]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return $row;
        }

        $categoriesMap = $this->fetchCategoriesMap([(int)$row['id']]);
        $row = $this->attachCategoriesToRow($row, $categoriesMap);

        return normalize_product_row($row);
    }

    public function readOneById($id) {
        $query = "SELECT p.*, c.name as category_name,
                         COALESCE(ROUND(AVG(r.rating), 1), 0) as average_rating,
                         COUNT(r.id) as review_count
                  FROM " . $this->table_name . " p 
                  LEFT JOIN categories c ON p.category_id = c.id 
                  LEFT JOIN product_reviews r ON r.product_id = p.id AND r.status = 'approved'
                  WHERE p.id = ? GROUP BY p.id LIMIT 0,1";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$row) {
            return $row;
        }

        $categoriesMap = $this->fetchCategoriesMap([(int)$row['id']]);
        $row = $this->attachCategoriesToRow($row, $categoriesMap);

        return normalize_product_row($row);
    }

    public function create($data) {
        $categoryIds = $this->extractCategoryIds($data);
        $primaryCategoryId = $categoryIds ? $categoryIds[0] : null;

        $query = "INSERT INTO " . $this->table_name . " 
                  SET name=:name, slug=:slug, category_id=:cat_id, 
                      description=:desc, price=:price, stock=:stock, images=:images";
        $stmt = $this->conn->prepare($query);

        $images = json_encode($data['images']);

        $stmt->bindParam(":name", $data['name']);
        $stmt->bindParam(":slug", $data['slug']);
        $stmt->bindParam(":cat_id", $primaryCategoryId, $primaryCategoryId === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
        $stmt->bindParam(":desc", $data['description']);
        $stmt->bindParam(":price", $data['price']);
        $stmt->bindParam(":stock", $data['stock']);
        $stmt->bindParam(":images", $images);

        if (!$stmt->execute()) {
            return false;
        }

        $productId = (int)$this->conn->lastInsertId();
        $this->syncProductCategories($productId, $categoryIds);

        return true;
    }

    public function update($id, $data) {
        $oldImages = $this->getImagesById($id);
        $categoryIds = $this->extractCategoryIds($data);
        $primaryCategoryId = $categoryIds ? $categoryIds[0] : null;

        $query = "UPDATE " . $this->table_name . " 
                  SET name=:name, slug=:slug, category_id=:cat_id, 
                      description=:desc, price=:price, stock=:stock, images=:images, is_active=:is_active
                  WHERE id=:id";
        $stmt = $this->conn->prepare($query);

        $newImages = $this->parseImages(isset($data['images']) ? $data['images'] : []);
        $images = json_encode($newImages);

        $stmt->bindParam(":name", $data['name']);
        $stmt->bindParam(":slug", $data['slug']);
        $stmt->bindParam(":cat_id", $primaryCategoryId, $primaryCategoryId === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
        $stmt->bindParam(":desc", $data['description']);
        $stmt->bindParam(":price", $data['price']);
        $stmt->bindParam(":stock", $data['stock']);
        $stmt->bindParam(":images", $images);
        $stmt->bindParam(":is_active", $data['is_active']);
        $stmt->bindParam(":id", $id);

        $updated = $stmt->execute();

        if ($updated) {
            $this->syncProductCategories((int)$id, $categoryIds);
            $this->deleteRemovedImages($oldImages, $newImages);
        }

        return $updated;
    }

    public function enrichRowsWithCategories(array $rows) {
        return $this->attachCategories($rows);
    }

    public function delete($id) {
        $oldImages = $this->getImagesById($id);
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $deleted = $stmt->execute([$id]);

        if ($deleted) {
            foreach ($oldImages as $image) {
                $this->deleteLocalImage($image);
            }
        }

        return $deleted;
    }
}
?>
