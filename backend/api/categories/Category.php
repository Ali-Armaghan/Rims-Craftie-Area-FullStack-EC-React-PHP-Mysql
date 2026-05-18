<?php
class Category {
    private $conn;
    private $table_name = "categories";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function read() {
        $query = "SELECT c.*, p.name AS parent_name,
                         (SELECT COUNT(*) FROM products WHERE category_id = c.id) AS product_count
                  FROM " . $this->table_name . " c
                  LEFT JOIN " . $this->table_name . " p ON c.parent_id = p.id
                  ORDER BY c.name ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function readOne($id) {
        $query = "SELECT c.*, p.name AS parent_name
                  FROM " . $this->table_name . " c
                  LEFT JOIN " . $this->table_name . " p ON c.parent_id = p.id
                  WHERE c.id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function create($data) {
        $name = htmlspecialchars(strip_tags($data['name']));
        $slug = !empty($data['slug'])
            ? $this->makeSlug($data['slug'])
            : $this->makeSlug($name);
        $slug = $this->ensureUniqueSlug($slug);
        $parent_id = !empty($data['parent_id']) ? (int)$data['parent_id'] : null;

        $query = "INSERT INTO " . $this->table_name . "
                  SET name=:name, slug=:slug, parent_id=:parent_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":name", $name);
        $stmt->bindParam(":slug", $slug);
        $stmt->bindParam(":parent_id", $parent_id, $parent_id === null ? PDO::PARAM_NULL : PDO::PARAM_INT);

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

        if ($parent_id === (int)$id) {
            return false;
        }

        $query = "UPDATE " . $this->table_name . "
                  SET name=:name, slug=:slug, parent_id=:parent_id
                  WHERE id=:id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":name", $name);
        $stmt->bindParam(":slug", $slug);
        $stmt->bindParam(":parent_id", $parent_id, $parent_id === null ? PDO::PARAM_NULL : PDO::PARAM_INT);
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
