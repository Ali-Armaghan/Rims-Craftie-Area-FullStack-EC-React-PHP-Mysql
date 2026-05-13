<?php
// api/products/Product.php

class Product {
    private $conn;
    private $table_name = "products";

    public function __construct($db) {
        $this->conn = $db;
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
            $query .= " AND c.slug = :cat";
        }
        
        $query .= " GROUP BY p.id ORDER BY p.created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        
        if (isset($params['category'])) {
            $stmt->bindParam(':cat', $params['category']);
        }
        
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
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
        return $stmt->fetch(PDO::FETCH_ASSOC);
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
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Admin Methods
    public function create($data) {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET name=:name, slug=:slug, category_id=:cat_id, 
                      description=:desc, price=:price, stock=:stock, images=:images";
        $stmt = $this->conn->prepare($query);
        
        $images = json_encode($data['images']);
        
        $stmt->bindParam(":name", $data['name']);
        $stmt->bindParam(":slug", $data['slug']);
        $stmt->bindParam(":cat_id", $data['category_id']);
        $stmt->bindParam(":desc", $data['description']);
        $stmt->bindParam(":price", $data['price']);
        $stmt->bindParam(":stock", $data['stock']);
        $stmt->bindParam(":images", $images);
        return $stmt->execute();
    }

    public function update($id, $data) {
        $oldImages = $this->getImagesById($id);
        $query = "UPDATE " . $this->table_name . " 
                  SET name=:name, slug=:slug, category_id=:cat_id, 
                      description=:desc, price=:price, stock=:stock, images=:images, is_active=:is_active
                  WHERE id=:id";
        $stmt = $this->conn->prepare($query);
        
        $newImages = $this->parseImages(isset($data['images']) ? $data['images'] : []);
        $images = json_encode($newImages);
        
        $stmt->bindParam(":name", $data['name']);
        $stmt->bindParam(":slug", $data['slug']);
        $stmt->bindParam(":cat_id", $data['category_id']);
        $stmt->bindParam(":desc", $data['description']);
        $stmt->bindParam(":price", $data['price']);
        $stmt->bindParam(":stock", $data['stock']);
        $stmt->bindParam(":images", $images);
        $stmt->bindParam(":is_active", $data['is_active']);
        $stmt->bindParam(":id", $id);
        
        $updated = $stmt->execute();

        if ($updated) {
            $this->deleteRemovedImages($oldImages, $newImages);
        }

        return $updated;
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
