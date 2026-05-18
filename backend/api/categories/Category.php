<?php
require_once __DIR__ . '/../helpers.php';

class Category {
    private $conn;
    private $table_name = "categories";

    public function __construct($db) {
        $this->conn = $db;
        $this->ensureCategoryColumns();
    }

    private function ensureCategoryColumns() {
        try {
            $this->conn->query("SELECT show_on_home, home_sort_order, image FROM " . $this->table_name . " LIMIT 1");
        } catch (Exception $e) {
            try {
                $this->conn->exec(
                    "ALTER TABLE " . $this->table_name . " ADD COLUMN show_on_home TINYINT(1) NOT NULL DEFAULT 0"
                );
            } catch (Exception $ignored) {
            }

            try {
                $this->conn->exec(
                    "ALTER TABLE " . $this->table_name . " ADD COLUMN home_sort_order INT NOT NULL DEFAULT 0"
                );
            } catch (Exception $ignored) {
            }

            try {
                $this->conn->exec(
                    "ALTER TABLE " . $this->table_name . " ADD COLUMN image VARCHAR(500) NULL DEFAULT NULL"
                );
            } catch (Exception $ignored) {
            }
        }
    }

    private function deleteLocalImage($imageUrl) {
        if (!is_string($imageUrl) || trim($imageUrl) === '') {
            return;
        }

        $path = parse_url($imageUrl, PHP_URL_PATH);
        if (!$path || strpos($path, '/uploads/categories/') === false) {
            return;
        }

        $fileName = basename($path);
        if ($fileName === '' || $fileName === '.' || $fileName === '..') {
            return;
        }

        $uploadDir = realpath(__DIR__ . '/../../uploads/categories');
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

    public function read() {
        $query = "SELECT c.*, p.name AS parent_name,
                         (SELECT COUNT(*) FROM products WHERE category_id = c.id) AS product_count
                  FROM " . $this->table_name . " c
                  LEFT JOIN " . $this->table_name . " p ON c.parent_id = p.id
                  ORDER BY c.home_sort_order ASC, c.name ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return array_map('normalize_category_row', $rows);
    }

    public function readHomeSections($productLimit = 8) {
        $query = "SELECT c.id, c.name, c.slug, c.show_on_home, c.home_sort_order
                  FROM " . $this->table_name . " c
                  WHERE c.show_on_home = 1
                  ORDER BY c.home_sort_order ASC, c.name ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $limit = max(1, min((int)$productLimit, 24));
        $productQuery = "SELECT p.*, c.name AS category_name,
                                COALESCE(ROUND(AVG(r.rating), 1), 0) AS average_rating,
                                COUNT(r.id) AS review_count
                         FROM products p
                         LEFT JOIN categories c ON p.category_id = c.id
                         LEFT JOIN product_reviews r ON r.product_id = p.id AND r.status = 'approved'
                         WHERE p.category_id = ? AND p.is_active = 1
                         GROUP BY p.id
                         ORDER BY p.created_at DESC
                         LIMIT {$limit}";

        $productStmt = $this->conn->prepare($productQuery);

        foreach ($categories as &$category) {
            $productStmt->execute([$category['id']]);
            $products = $productStmt->fetchAll(PDO::FETCH_ASSOC);
            $category['products'] = array_map('normalize_product_row', $products);
        }

        return $categories;
    }

    public function readOne($id) {
        $query = "SELECT c.*, p.name AS parent_name
                  FROM " . $this->table_name . " c
                  LEFT JOIN " . $this->table_name . " p ON c.parent_id = p.id
                  WHERE c.id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? normalize_category_row($row) : $row;
    }

    public function create($data) {
        $name = htmlspecialchars(strip_tags($data['name']));
        $slug = !empty($data['slug'])
            ? $this->makeSlug($data['slug'])
            : $this->makeSlug($name);
        $slug = $this->ensureUniqueSlug($slug);
        $parent_id = !empty($data['parent_id']) ? (int)$data['parent_id'] : null;
        $show_on_home = !empty($data['show_on_home']) ? 1 : 0;
        $home_sort_order = isset($data['home_sort_order']) ? (int)$data['home_sort_order'] : 0;
        $image = !empty($data['image']) ? trim($data['image']) : null;

        $query = "INSERT INTO " . $this->table_name . "
                  SET name=:name, slug=:slug, parent_id=:parent_id,
                      show_on_home=:show_on_home, home_sort_order=:home_sort_order, image=:image";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":name", $name);
        $stmt->bindParam(":slug", $slug);
        $stmt->bindParam(":parent_id", $parent_id, $parent_id === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
        $stmt->bindParam(":show_on_home", $show_on_home, PDO::PARAM_INT);
        $stmt->bindParam(":home_sort_order", $home_sort_order, PDO::PARAM_INT);
        $stmt->bindParam(":image", $image, $image === null ? PDO::PARAM_NULL : PDO::PARAM_STR);

        if ($stmt->execute()) {
            return $this->readOne($this->conn->lastInsertId());
        }

        return false;
    }

    public function update($id, $data) {
        $existing = $this->readOne($id);
        if (!$existing) {
            return false;
        }

        $name = htmlspecialchars(strip_tags($data['name']));
        $slug = !empty($data['slug'])
            ? $this->makeSlug($data['slug'])
            : $this->makeSlug($name);
        $slug = $this->ensureUniqueSlug($slug, (int)$id);
        $parent_id = !empty($data['parent_id']) ? (int)$data['parent_id'] : null;
        $show_on_home = !empty($data['show_on_home']) ? 1 : 0;
        $home_sort_order = isset($data['home_sort_order']) ? (int)$data['home_sort_order'] : 0;

        if ($parent_id === (int)$id) {
            return false;
        }

        $image = array_key_exists('image', $data)
            ? (!empty($data['image']) ? trim($data['image']) : null)
            : ($existing['image'] ?? null);

        if (!empty($existing['image']) && $existing['image'] !== $image) {
            $this->deleteLocalImage($existing['image']);
        }

        $query = "UPDATE " . $this->table_name . "
                  SET name=:name, slug=:slug, parent_id=:parent_id,
                      show_on_home=:show_on_home, home_sort_order=:home_sort_order, image=:image
                  WHERE id=:id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":name", $name);
        $stmt->bindParam(":slug", $slug);
        $stmt->bindParam(":parent_id", $parent_id, $parent_id === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
        $stmt->bindParam(":show_on_home", $show_on_home, PDO::PARAM_INT);
        $stmt->bindParam(":home_sort_order", $home_sort_order, PDO::PARAM_INT);
        $stmt->bindParam(":image", $image, $image === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
        $stmt->bindParam(":id", $id, PDO::PARAM_INT);

        if ($stmt->execute()) {
            return $this->readOne($id);
        }

        return false;
    }

    public function delete($id) {
        $childQuery = "SELECT COUNT(*) FROM " . $this->table_name . " WHERE parent_id = ?";
        $stmt = $this->conn->prepare($childQuery);
        $stmt->execute([$id]);
        if ((int)$stmt->fetchColumn() > 0) {
            return ['success' => false, 'message' => 'Remove or reassign subcategories first.'];
        }

        $productQuery = "SELECT COUNT(*) FROM products WHERE category_id = ?";
        $stmt = $this->conn->prepare($productQuery);
        $stmt->execute([$id]);
        if ((int)$stmt->fetchColumn() > 0) {
            return ['success' => false, 'message' => 'Reassign products before deleting this category.'];
        }

        $existing = $this->readOne($id);
        if ($existing && !empty($existing['image'])) {
            $this->deleteLocalImage($existing['image']);
        }

        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        $deleted = $stmt->execute([$id]);

        return ['success' => $deleted];
    }

    private function makeSlug($value) {
        $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9]+/', '-', $value), '-'));
        return $slug !== '' ? $slug : 'category';
    }

    private function slugExists($slug, $excludeId = null) {
        $query = "SELECT id FROM " . $this->table_name . " WHERE slug = ?";
        if ($excludeId) {
            $query .= " AND id != ?";
        }

        $stmt = $this->conn->prepare($query);
        $params = $excludeId ? [$slug, $excludeId] : [$slug];
        $stmt->execute($params);

        return (bool)$stmt->fetch(PDO::FETCH_ASSOC);
    }

    private function ensureUniqueSlug($slug, $excludeId = null) {
        $base = $slug;
        $counter = 1;

        while ($this->slugExists($slug, $excludeId)) {
            $slug = $base . '-' . $counter;
            $counter++;
        }

        return $slug;
    }
}
?>
