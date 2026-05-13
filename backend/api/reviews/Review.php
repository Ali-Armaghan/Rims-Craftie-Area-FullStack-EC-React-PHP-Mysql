<?php
class Review {
    private $conn;
    private $table_name = "product_reviews";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function readByProduct($product_id) {
        $query = "SELECT id, product_id, reviewer, reviewer_email, review, rating, created_at AS date_created
                  FROM " . $this->table_name . "
                  WHERE product_id = ? AND status = 'approved'
                  ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$product_id]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function readAll() {
        $query = "SELECT r.id, r.product_id, p.name AS product_name, r.reviewer,
                         r.reviewer_email, r.review, r.rating, r.status,
                         r.created_at AS date_created
                  FROM " . $this->table_name . " r
                  LEFT JOIN products p ON r.product_id = p.id
                  ORDER BY r.created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($data) {
        $query = "INSERT INTO " . $this->table_name . "
                  SET product_id=:product_id, reviewer=:reviewer,
                      reviewer_email=:reviewer_email, review=:review,
                      rating=:rating, status=:status";
        $stmt = $this->conn->prepare($query);

        $product_id = (int)$data['product_id'];
        $reviewer = htmlspecialchars(strip_tags($data['reviewer']));
        $reviewer_email = htmlspecialchars(strip_tags($data['reviewer_email']));
        $review = htmlspecialchars(strip_tags($data['review']));
        $rating = max(1, min(5, (int)$data['rating']));
        $status = isset($data['status']) && $data['status'] === 'pending' ? 'pending' : 'approved';

        $stmt->bindParam(":product_id", $product_id);
        $stmt->bindParam(":reviewer", $reviewer);
        $stmt->bindParam(":reviewer_email", $reviewer_email);
        $stmt->bindParam(":review", $review);
        $stmt->bindParam(":rating", $rating);
        $stmt->bindParam(":status", $status);

        if ($stmt->execute()) {
            return [
                "id" => (int)$this->conn->lastInsertId(),
                "product_id" => $product_id,
                "reviewer" => $reviewer,
                "reviewer_email" => $reviewer_email,
                "review" => $review,
                "rating" => $rating,
                "status" => $status,
                "date_created" => date('Y-m-d H:i:s')
            ];
        }

        return false;
    }

    public function update($id, $data) {
        $query = "UPDATE " . $this->table_name . "
                  SET product_id=:product_id, reviewer=:reviewer,
                      reviewer_email=:reviewer_email, review=:review,
                      rating=:rating, status=:status
                  WHERE id=:id";
        $stmt = $this->conn->prepare($query);

        $product_id = (int)$data['product_id'];
        $reviewer = htmlspecialchars(strip_tags($data['reviewer']));
        $reviewer_email = htmlspecialchars(strip_tags($data['reviewer_email']));
        $review = htmlspecialchars(strip_tags($data['review']));
        $rating = max(1, min(5, (int)$data['rating']));
        $status = isset($data['status']) && $data['status'] === 'pending' ? 'pending' : 'approved';

        $stmt->bindParam(":product_id", $product_id);
        $stmt->bindParam(":reviewer", $reviewer);
        $stmt->bindParam(":reviewer_email", $reviewer_email);
        $stmt->bindParam(":review", $review);
        $stmt->bindParam(":rating", $rating);
        $stmt->bindParam(":status", $status);
        $stmt->bindParam(":id", $id);

        return $stmt->execute();
    }

    public function updateStatus($id, $status) {
        $status = $status === 'pending' ? 'pending' : 'approved';
        $query = "UPDATE " . $this->table_name . " SET status = ? WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$status, $id]);
    }

    public function delete($id) {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$id]);
    }
}
?>
