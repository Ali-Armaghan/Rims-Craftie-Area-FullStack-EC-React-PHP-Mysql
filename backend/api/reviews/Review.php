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

    public function create($data) {
        $query = "INSERT INTO " . $this->table_name . "
                  SET product_id=:product_id, reviewer=:reviewer,
                      reviewer_email=:reviewer_email, review=:review, rating=:rating";
        $stmt = $this->conn->prepare($query);

        $product_id = (int)$data['product_id'];
        $reviewer = htmlspecialchars(strip_tags($data['reviewer']));
        $reviewer_email = htmlspecialchars(strip_tags($data['reviewer_email']));
        $review = htmlspecialchars(strip_tags($data['review']));
        $rating = max(1, min(5, (int)$data['rating']));

        $stmt->bindParam(":product_id", $product_id);
        $stmt->bindParam(":reviewer", $reviewer);
        $stmt->bindParam(":reviewer_email", $reviewer_email);
        $stmt->bindParam(":review", $review);
        $stmt->bindParam(":rating", $rating);

        if ($stmt->execute()) {
            return [
                "id" => (int)$this->conn->lastInsertId(),
                "product_id" => $product_id,
                "reviewer" => $reviewer,
                "reviewer_email" => $reviewer_email,
                "review" => $review,
                "rating" => $rating,
                "date_created" => date('Y-m-d H:i:s')
            ];
        }

        return false;
    }
}
?>
