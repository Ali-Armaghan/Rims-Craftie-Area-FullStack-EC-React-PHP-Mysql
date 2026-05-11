<?php
// api/products/Product.php

class Product {
    private $conn;
    private $table_name = "products";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function read($params = []) {
        $query = "SELECT p.*, c.name as category_name 
                  FROM " . $this->table_name . " p 
                  LEFT JOIN categories c ON p.category_id = c.id 
                  WHERE p.is_active = 1";
        
        if (isset($params['category'])) {
            $query .= " AND c.slug = :cat";
        }
        
        $query .= " ORDER BY p.created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        
        if (isset($params['category'])) {
            $stmt->bindParam(':cat', $params['category']);
        }
        
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function readOne($slug) {
        $query = "SELECT p.*, c.name as category_name 
                  FROM " . $this->table_name . " p 
                  LEFT JOIN categories c ON p.category_id = c.id 
                  WHERE p.slug = ? LIMIT 0,1";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$slug]);
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
        $query = "UPDATE " . $this->table_name . " 
                  SET name=:name, slug=:slug, category_id=:cat_id, 
                      description=:desc, price=:price, stock=:stock, images=:images, is_active=:is_active
                  WHERE id=:id";
        $stmt = $this->conn->prepare($query);
        
        $images = json_encode($data['images']);
        
        $stmt->bindParam(":name", $data['name']);
        $stmt->bindParam(":slug", $data['slug']);
        $stmt->bindParam(":cat_id", $data['category_id']);
        $stmt->bindParam(":desc", $data['description']);
        $stmt->bindParam(":price", $data['price']);
        $stmt->bindParam(":stock", $data['stock']);
        $stmt->bindParam(":images", $images);
        $stmt->bindParam(":is_active", $data['is_active']);
        $stmt->bindParam(":id", $id);
        
        return $stmt->execute();
    }

    public function delete($id) {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$id]);
    }
}
?>
