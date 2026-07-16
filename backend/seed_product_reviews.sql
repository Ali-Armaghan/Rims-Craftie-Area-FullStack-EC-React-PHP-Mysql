-- ============================================================
-- Ateeqo: Seed product reviews (min 10 per product, avg 4-5)
-- Run on LIVE DB via phpMyAdmin / MySQL client.
-- Safe to re-run: only fills products that have fewer than 10 reviews.
-- ============================================================

START TRANSACTION;

DROP TEMPORARY TABLE IF EXISTS tmp_reviewers;
CREATE TEMPORARY TABLE tmp_reviewers (
  rid INT NOT NULL PRIMARY KEY,
  reviewer VARCHAR(100) NOT NULL
);
INSERT INTO tmp_reviewers (rid, reviewer) VALUES
(1, 'Ayesha Khan'),
(2, 'Fatima Ali'),
(3, 'Hira Ahmed'),
(4, 'Sana Malik'),
(5, 'Zara Hussain'),
(6, 'Maryam Iqbal'),
(7, 'Nimra Sheikh'),
(8, 'Laiba Raza'),
(9, 'Mehwish Noor'),
(10, 'Anam Batool'),
(11, 'Sara Javed'),
(12, 'Iqra Siddiqui'),
(13, 'Mahnoor Asif'),
(14, 'Amna Rehman'),
(15, 'Bushra Tariq'),
(16, 'Rabia Nadeem'),
(17, 'Saima Farooq'),
(18, 'Kiran Shah'),
(19, 'Nadia Qureshi'),
(20, 'Hina Imran'),
(21, 'Aleena Butt'),
(22, 'Kinza Mir'),
(23, 'Eman Haider'),
(24, 'Momina Saad'),
(25, 'Areeba Yousaf'),
(26, 'Umaima Khalid'),
(27, 'Dua Zeeshan'),
(28, 'Hafsa Bilal'),
(29, 'Mishal Aslam'),
(30, 'Sundas Adeel'),
(31, 'Ali Raza'),
(32, 'Usman Khan'),
(33, 'Hassan Ali'),
(34, 'Bilal Ahmed'),
(35, 'Hamza Malik'),
(36, 'Ahmed Sheikh'),
(37, 'Omar Farooq'),
(38, 'Saad Iqbal'),
(39, 'Zain Abbas'),
(40, 'Fahad Hussain'),
(41, 'Taha Rehman'),
(42, 'Arsalan Shah'),
(43, 'Waleed Butt'),
(44, 'Danish Qureshi'),
(45, 'Noman Siddiqui'),
(46, 'Shahzaib Noor'),
(47, 'Haris Jamil'),
(48, 'Rizwan Asif'),
(49, 'Sameer Tariq'),
(50, 'Yasir Imran');

DROP TEMPORARY TABLE IF EXISTS tmp_review_texts;
CREATE TEMPORARY TABLE tmp_review_texts (
  tid INT NOT NULL PRIMARY KEY,
  review_text TEXT NOT NULL
);
INSERT INTO tmp_review_texts (tid, review_text) VALUES
(1, 'Bohot zabardast bag hai, quality bilkul premium lagi. Delivery bhi time pe aa gayi.'),
(2, 'Material soft aur strong hai. Roz ke use ke liye perfect hai.'),
(3, 'Color pics jaisa hi aaya. Size bhi theek hai, recommended!'),
(4, 'Pehle thora doubt tha lekin milne ke baad bohot acha laga. Worth the price.'),
(5, 'Stitching clean hai aur zip smoothly chalti hai. Happy with purchase.'),
(6, 'Gift ke liye liya tha, unko bohot pasand aaya. Packaging bhi achi thi.'),
(7, 'Daily office use me chal raha hai, spacious aur stylish dono.'),
(8, 'Kapra soft hai, look classy hai. Ateeqo se phir order karungi.'),
(9, 'Price ke hisaab se quality bohot better hai. Satisfied customer.'),
(10, 'Strap comfortable hai, lambi walk pe bhi shoulder me dard nahi hota.'),
(11, 'Design unique hai, market me common bags se alag lagta hai.'),
(12, 'Colour fade nahi hua wash ke baad. Quality solid hai.'),
(13, 'Delivery fast thi aur bag bilkul new condition me mila.'),
(14, 'Size perfect hai phone, wallet, makeup sab comfortably aa jata hai.'),
(15, 'Friend ne recommend kiya tha, ab main bhi recommend karti hun.'),
(16, 'Finishing bohot neat hai. Photos se better lag raha hai real me.'),
(17, 'Pehli baar order kiya, experience acha raha. Definitely buying again.'),
(18, 'Zip aur lining dono durable lagte hain. Value for money.'),
(19, 'Style modern hai, casual aur formal dono ke sath match ho jata hai.'),
(20, 'Customer service bhi responsive thi. Overall 10/10 experience.'),
(21, 'Beautiful bag with great craftsmanship. Feels premium in hand.'),
(22, 'Love the design and the quality of the fabric. Highly recommend.'),
(23, 'Perfect everyday tote. Spacious, stylish, and well made.'),
(24, 'Excellent purchase. The stitching is neat and the color is lovely.'),
(25, 'Arrived quickly and looks exactly like the photos. Very happy.'),
(26, 'Comfortable to carry and surprisingly roomy. Great value.'),
(27, 'The finish is clean and elegant. Will order more colors soon.'),
(28, 'Solid quality for the price. My new go-to bag for work.'),
(29, 'Looks expensive and feels durable. Impressed with Ateeqo.'),
(30, 'Soft material, strong straps, and a classy look. Five stars.'),
(31, 'Great gift option. Packaging was neat and product was perfect.'),
(32, 'Lightweight yet sturdy. Perfect for daily use around the city.'),
(33, 'The details are thoughtfully done. Feels like a premium brand.'),
(34, 'Color is rich and the size is just right. Totally satisfied.'),
(35, 'Bought it for travel and it held up really well. Recommended.');

DROP TEMPORARY TABLE IF EXISTS tmp_nums;
CREATE TEMPORARY TABLE tmp_nums (n INT NOT NULL PRIMARY KEY);
INSERT INTO tmp_nums (n) VALUES
(1),(2),(3),(4),(5),(6),(7),(8),(9),(10);

-- Products needing reviews (fewer than 10)
DROP TEMPORARY TABLE IF EXISTS tmp_products_need_reviews;
CREATE TEMPORARY TABLE tmp_products_need_reviews AS
SELECT p.id
FROM products p
LEFT JOIN product_reviews r ON r.product_id = p.id
GROUP BY p.id
HAVING COUNT(r.id) < 10;

INSERT INTO product_reviews (product_id, reviewer, reviewer_email, review, rating, status, created_at)
SELECT
  p.id AS product_id,
  rv.reviewer,
  CONCAT(
    LOWER(REPLACE(rv.reviewer, ' ', '.')),
    '.',
    p.id,
    '.',
    n.n,
    '@gmail.com'
  ) AS reviewer_email,
  rt.review_text AS review,
  -- Mix of 4 and 5 only → average lands ~4.6 to 4.8
  CASE
    WHEN ((p.id + n.n) % 5) = 0 THEN 4
    WHEN ((p.id + n.n) % 7) = 0 THEN 4
    ELSE 5
  END AS rating,
  'approved' AS status,
  DATE_SUB(NOW(), INTERVAL ((p.id * 3 + n.n * 5) % 90) DAY)
    - INTERVAL ((p.id + n.n) % 20) HOUR AS created_at
FROM tmp_products_need_reviews need
INNER JOIN products p ON p.id = need.id
CROSS JOIN tmp_nums n
INNER JOIN tmp_reviewers rv
  ON rv.rid = ((p.id * 7 + n.n * 3 - 1) % 50) + 1
INNER JOIN tmp_review_texts rt
  ON rt.tid = ((p.id * 11 + n.n * 5 - 1) % 35) + 1;

COMMIT;

-- Verify: every product should have >= 10 reviews, avg between 4 and 5
SELECT
  p.id,
  p.name,
  COUNT(r.id) AS review_count,
  ROUND(AVG(r.rating), 2) AS avg_rating
FROM products p
LEFT JOIN product_reviews r ON r.product_id = p.id AND r.status = 'approved'
GROUP BY p.id, p.name
ORDER BY p.id;
