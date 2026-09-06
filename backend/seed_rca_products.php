<?php
// backend/seed_rca_products.php
// Seeder for Rim's Craftie Area (RCA) Database

require_once __DIR__ . '/config/database.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    die("Database connection failed!\n");
}

echo "Starting RCA Product & Category Seeder...\n";

// 1. Ensure required tables and columns exist
$db->exec("
    CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        parent_id INT NULL,
        show_on_home TINYINT(1) NOT NULL DEFAULT 0,
        home_sort_order INT NOT NULL DEFAULT 0,
        image VARCHAR(500) NULL DEFAULT NULL,
        FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
");

$db->exec("
    CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_id INT NULL,
        name VARCHAR(200) NOT NULL,
        slug VARCHAR(200) UNIQUE NOT NULL,
        description TEXT NULL,
        long_description TEXT NULL,
        price DECIMAL(10,2) NOT NULL,
        original_price DECIMAL(10,2) NULL DEFAULT NULL,
        stock INT DEFAULT 0,
        images JSON NULL,
        colors JSON NULL DEFAULT NULL,
        video VARCHAR(500) NULL DEFAULT NULL,
        video_position INT NOT NULL DEFAULT 2,
        is_active TINYINT(1) DEFAULT 1,
        is_sold_out TINYINT(1) NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
");

$db->exec("
    CREATE TABLE IF NOT EXISTS product_categories (
        product_id INT NOT NULL,
        category_id INT NOT NULL,
        PRIMARY KEY (product_id, category_id),
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
");

$db->exec("
    CREATE TABLE IF NOT EXISTS product_reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id INT NOT NULL,
        reviewer VARCHAR(100) NOT NULL,
        reviewer_email VARCHAR(150) NOT NULL,
        review TEXT NOT NULL,
        rating TINYINT NOT NULL,
        status ENUM('approved', 'pending') DEFAULT 'approved',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
");

$db->exec("
    CREATE TABLE IF NOT EXISTS settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(50) UNIQUE NOT NULL,
        setting_value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
");

// Update settings
$db->exec("INSERT INTO settings (setting_key, setting_value) VALUES ('currency', 'PKR') ON DUPLICATE KEY UPDATE setting_value = 'PKR'");

// Disable FK checks to safely truncate / refresh
$db->exec("SET FOREIGN_KEY_CHECKS = 0;");
$db->exec("TRUNCATE TABLE product_reviews;");
$db->exec("TRUNCATE TABLE product_categories;");
$db->exec("TRUNCATE TABLE products;");
$db->exec("TRUNCATE TABLE categories;");
$db->exec("SET FOREIGN_KEY_CHECKS = 1;");

echo "Tables cleared and ready for seeding.\n";

// 2. Insert Categories
$categories = [
    [
        'id' => 1,
        'name' => 'Resin Trays & Platters',
        'slug' => 'resin-trays-platters',
        'image' => '/uploads/categories/cat_resin_trays.jpg',
        'show_on_home' => 1,
        'home_sort_order' => 1
    ],
    [
        'id' => 2,
        'name' => 'Nikkah Nama & Stationery',
        'slug' => 'nikkah-nama-stationery',
        'image' => '/uploads/categories/cat_nikkah_nama.jpg',
        'show_on_home' => 1,
        'home_sort_order' => 2
    ],
    [
        'id' => 3,
        'name' => 'Resin Keepsake Plaques',
        'slug' => 'resin-plaques-keepsakes',
        'image' => '/uploads/categories/cat_nikkah_plaques.jpg',
        'show_on_home' => 1,
        'home_sort_order' => 3
    ],
    [
        'id' => 4,
        'name' => 'Custom Nikkah Pens',
        'slug' => 'nikkah-pens',
        'image' => '/uploads/categories/cat_nikkah_pens.jpg',
        'show_on_home' => 1,
        'home_sort_order' => 4
    ],
    [
        'id' => 5,
        'name' => 'Handcrafted Resin Jewellery',
        'slug' => 'resin-jewellery',
        'image' => '/uploads/categories/cat_resin_jewellery.jpg',
        'show_on_home' => 1,
        'home_sort_order' => 5
    ],
    [
        'id' => 6,
        'name' => 'Islamic Car Hangings',
        'slug' => 'car-hangings',
        'image' => '/uploads/categories/cat_car_hangings.jpg',
        'show_on_home' => 1,
        'home_sort_order' => 6
    ],
    [
        'id' => 7,
        'name' => 'Personalized Keychains',
        'slug' => 'keychains',
        'image' => '/uploads/categories/cat_keychains.jpg',
        'show_on_home' => 1,
        'home_sort_order' => 7
    ],
    [
        'id' => 8,
        'name' => 'Pressed Flower Bookmarks',
        'slug' => 'bookmarks',
        'image' => '/uploads/categories/cat_bookmarks.jpg',
        'show_on_home' => 1,
        'home_sort_order' => 8
    ],
    [
        'id' => 9,
        'name' => 'Wedding Favors & Gifts',
        'slug' => 'favors-gifts',
        'image' => '/uploads/categories/cat_favors.jpg',
        'show_on_home' => 1,
        'home_sort_order' => 9
    ],
    [
        'id' => 10,
        'name' => 'Resin Hardcover Diaries',
        'slug' => 'resin-diaries',
        'image' => '/uploads/categories/cat_diaries.jpg',
        'show_on_home' => 1,
        'home_sort_order' => 10
    ],
    [
        'id' => 11,
        'name' => 'New Arrivals',
        'slug' => 'new-arrivals',
        'image' => null,
        'show_on_home' => 1,
        'home_sort_order' => 11
    ],
    [
        'id' => 12,
        'name' => 'Best Sellers',
        'slug' => 'best-sellers',
        'image' => null,
        'show_on_home' => 1,
        'home_sort_order' => 12
    ]
];

$catStmt = $db->prepare("
    INSERT INTO categories (id, name, slug, image, show_on_home, home_sort_order)
    VALUES (:id, :name, :slug, :image, :show_on_home, :home_sort_order)
");

foreach ($categories as $cat) {
    $catStmt->execute([
        ':id' => $cat['id'],
        ':name' => $cat['name'],
        ':slug' => $cat['slug'],
        ':image' => $cat['image'],
        ':show_on_home' => $cat['show_on_home'],
        ':home_sort_order' => $cat['home_sort_order']
    ]);
}
echo "Inserted " . count($categories) . " categories.\n";

// 3. Products Data
$products = [
    [
        'id' => 1,
        'category_id' => 3, // Resin Keepsake Plaques
        'category_ids' => [3, 12], // also Best Sellers
        'name' => 'Royal Emerald Floral Wedding Flower Preservation Plaque',
        'slug' => 'royal-emerald-floral-wedding-preservation-plaque',
        'description' => 'Handcrafted floral preservation keepsake plaque made with crystal clear artist-grade epoxy resin. Preserves your actual wedding rose petals with gold foil accents and custom couple names in calligraphy.',
        'long_description' => 'Capture the essence of your big day forever with our bespoke Wedding Flower Preservation Plaque. Crafted using high-clarity UV-resistant resin, each piece is meticulously cured to prevent yellowing over time. Features customizable Arabic/English calligraphy for couple names, Nikkah date, and gold or silver leaf foil flaking. Dimensions: 8x10 inches with acrylic display stand included.',
        'price' => 4500.00,
        'original_price' => 5500.00,
        'stock' => 25,
        'images' => [
            '/uploads/products/prod_1.jpg',
            '/uploads/products/prod_3.jpg',
            '/uploads/products/prod_12.jpg'
        ],
        'colors' => [
            ['name' => 'Gold Foil & Emerald', 'hex' => '#046307'],
            ['name' => 'Rose Gold & Pearl', 'hex' => '#B76E79'],
            ['name' => 'Silver Flake & White', 'hex' => '#C0C0C0']
        ],
        'reviews' => [
            [
                'reviewer' => 'Ayesha Khan',
                'email' => 'ayesha.k@example.com',
                'rating' => 5,
                'review' => 'The preservation plaque turned out so breathtaking! The rose petals from my Nikkah look fresh and the gold calligraphy is super crisp. Highly recommended!'
            ],
            [
                'reviewer' => 'Fatima Tariq',
                'email' => 'fatima.t@example.com',
                'rating' => 5,
                'review' => 'Exceptional quality resin and great packaging. Delivered safely with zero scratches. Looks stunning in our living room.'
            ]
        ]
    ],
    [
        'id' => 2,
        'category_id' => 2, // Nikkah Nama & Stationery
        'category_ids' => [2, 12], // also Best Sellers
        'name' => 'Deluxe Velvet Border Nikkah Nama Certificate Frame',
        'slug' => 'deluxe-velvet-border-nikkah-nama-certificate-frame',
        'description' => 'Exquisite handcrafted Nikkah certificate featuring gold foiled Islamic borders, premium velvet matte finish, and customized bride & groom names with Qubool Hai vows.',
        'long_description' => 'Make your Nikkah contract a treasured family heirloom. Printed on 350 GSM heavyweight archival textured cardstock with shimmering metallic gold foil borders, enclosed in a premium gold-trimmed display frame. Comes with a personalized certificate cylinder and protective keepsake sleeve.',
        'price' => 3850.00,
        'original_price' => 4800.00,
        'stock' => 40,
        'images' => [
            '/uploads/products/prod_2.jpg',
            '/uploads/products/prod_4.jpg',
            '/uploads/products/prod_14.jpg'
        ],
        'colors' => [
            ['name' => 'Emerald Green & Gold', 'hex' => '#046307'],
            ['name' => 'Royal Maroon & Gold', 'hex' => '#800000'],
            ['name' => 'Ivory Pearl & Gold', 'hex' => '#FFFFF0'],
            ['name' => 'Midnight Blue & Silver', 'hex' => '#191970']
        ],
        'reviews' => [
            [
                'reviewer' => 'Zainab Bilal',
                'email' => 'zainab.b@example.com',
                'rating' => 5,
                'review' => 'Such a regal design! The velvet touch and golden calligraphy made our Nikkah ceremony photos look luxurious.'
            ],
            [
                'reviewer' => 'Hamza Malik',
                'email' => 'hamza.m@example.com',
                'rating' => 5,
                'review' => 'Customization was done exactly as requested. Shipped very fast in sturdy packaging.'
            ]
        ]
    ],
    [
        'id' => 3,
        'category_id' => 1, // Resin Trays & Platters
        'category_ids' => [1, 12], // also Best Sellers
        'name' => 'Custom Bismillah Islamic Calligraphy Resin Serving Tray',
        'slug' => 'custom-bismillah-islamic-calligraphy-resin-serving-tray',
        'description' => 'Luxury handmade epoxy resin tray with embossed 3D Arabic calligraphy (Bismillah / BarakaAllahu Lakuma), natural marble swirls, and metallic brushed gold heavy handles.',
        'long_description' => 'Elevate your dining and coffee table styling with this magnificent custom resin serving tray. Made from food-safe, non-toxic, heat-resistant resin layered over high-density backing. Includes sturdy brass alloy handles and rubber surface protector pads. Size: 14 x 9 inches.',
        'price' => 5200.00,
        'original_price' => 6500.00,
        'stock' => 18,
        'images' => [
            '/uploads/products/prod_3.jpg',
            '/uploads/products/prod_11.jpg',
            '/uploads/products/prod_5.jpg'
        ],
        'colors' => [
            ['name' => 'White & Gold Marble', 'hex' => '#FAF0E6'],
            ['name' => 'Black Obsidian & Gold', 'hex' => '#000000'],
            ['name' => 'Ocean Turquoise', 'hex' => '#40E0D0']
        ],
        'reviews' => [
            [
                'reviewer' => 'Mahnoor Asif',
                'email' => 'mahnoor@example.com',
                'rating' => 5,
                'review' => 'A true piece of art! The gold handles are heavy and premium, and the resin shine is glass-like.'
            ]
        ]
    ],
    [
        'id' => 4,
        'category_id' => 4, // Custom Nikkah Pens
        'category_ids' => [4, 11], // also New Arrivals
        'name' => 'Royal Ostrich Feather & Pearl Signature Nikkah Pen',
        'slug' => 'royal-ostrich-feather-pearl-signature-nikkah-pen',
        'description' => 'Handcrafted signature pen adorned with soft premium ostrich feather plume, cascading faux pearls, crystal rhinestones, and smooth-flowing black ink.',
        'long_description' => 'Seal your forever vows with unmatched grace. Designed specifically for signing the Nikkah Nama and wedding registers, this signature pen features a high-grade metal pen body, fine 0.5mm smooth German gel ink cartridge, and hand-strung pearl embellishments. Includes a luxury satin-lined presentation box.',
        'price' => 1450.00,
        'original_price' => 1900.00,
        'stock' => 50,
        'images' => [
            '/uploads/products/prod_4.jpg',
            '/uploads/products/prod_14.jpg',
            '/uploads/products/prod_2.jpg'
        ],
        'colors' => [
            ['name' => 'Pure White & Gold', 'hex' => '#FFFFFF'],
            ['name' => 'Blush Pink & Rose Gold', 'hex' => '#FFB6C1'],
            ['name' => 'Royal Emerald & Gold', 'hex' => '#004B23']
        ],
        'reviews' => [
            [
                'reviewer' => 'Hira Rehman',
                'email' => 'hira.r@example.com',
                'rating' => 5,
                'review' => 'Super fluffy feather and write very smoothly. Looked gorgeous during our signing moment!'
            ]
        ]
    ],
    [
        'id' => 5,
        'category_id' => 1, // Resin Trays & Platters
        'category_ids' => [1, 9], // also Wedding Favors & Gifts
        'name' => 'Real Botanical Pressed Daisy Resin Coaster Set (4 Pcs)',
        'slug' => 'real-botanical-pressed-daisy-resin-coaster-set-4pcs',
        'description' => 'Set of 4 handmade crystal clear resin coasters infused with genuine naturally pressed wild daisies, baby breath flowers, and golden edge trim.',
        'long_description' => 'Bring the timeless beauty of nature indoors. Each coaster is individually poured and handcrafted using hand-picked, preserved botanical blossoms. Heat resistant up to 90°C with non-slip silicone bumper feet. Set includes 4 round coasters (4 inch diameter each).',
        'price' => 1950.00,
        'original_price' => 2600.00,
        'stock' => 30,
        'images' => [
            '/uploads/products/prod_5.jpg',
            '/uploads/products/prod_16.jpg',
            '/uploads/products/prod_8.jpg'
        ],
        'colors' => [
            ['name' => 'Natural White Floral', 'hex' => '#FFFDD0'],
            ['name' => 'Pink Hydrangea', 'hex' => '#E6A8D7'],
            ['name' => 'Golden Leaf Blend', 'hex' => '#D4AF37']
        ],
        'reviews' => [
            [
                'reviewer' => 'Sarah Ahmed',
                'email' => 'sarah.a@example.com',
                'rating' => 5,
                'review' => 'Such aesthetic coasters for my coffee corner! Real flowers look so delicate and preserved perfectly.'
            ]
        ]
    ],
    [
        'id' => 6,
        'category_id' => 6, // Islamic Car Hangings
        'category_ids' => [6, 12], // also Best Sellers
        'name' => 'Personalized Ayatul Kursi Acrylic & Resin Car Hanging Charm',
        'slug' => 'personalized-ayatul-kursi-acrylic-resin-car-hanging-charm',
        'description' => 'Dual-sided resin and acrylic rear-view mirror hanging charm engraved with Ayatul Kursi and personalized family name or initial, completed with a silky tassel.',
        'long_description' => 'Travel with divine protection and serene style. Laser-cut high-gloss acrylic coated with protective crystal resin. Features Ayatul Kursi in sharp Arabic calligraphy on one side and a personalized custom prayer or name on the reverse. Attached to an adjustable gold beaded hanging chain.',
        'price' => 1250.00,
        'original_price' => 1650.00,
        'stock' => 60,
        'images' => [
            '/uploads/products/prod_6.jpg',
            '/uploads/products/prod_15.jpg',
            '/uploads/products/prod_7.jpg'
        ],
        'colors' => [
            ['name' => 'Mirror Gold & Black', 'hex' => '#D4AF37'],
            ['name' => 'Mirror Silver & White', 'hex' => '#C0C0C0'],
            ['name' => 'Rose Gold & Pearl', 'hex' => '#B76E79']
        ],
        'reviews' => [
            [
                'reviewer' => 'Usman Ali',
                'email' => 'usman.ali@example.com',
                'rating' => 5,
                'review' => 'Great gift idea. The gold mirror acrylic reflects beautifully in the car and does not overheat.'
            ]
        ]
    ],
    [
        'id' => 7,
        'category_id' => 7, // Personalized Keychains
        'category_ids' => [7, 9], // also Favors & Gifts
        'name' => 'Custom 24K Gold Flake Alphabet Initial Resin Keychain',
        'slug' => 'custom-24k-gold-flake-alphabet-initial-resin-keychain',
        'description' => 'Personalized alphabet letter keychain handcrafted with 24K gold foil flakes, dried rose petals, and matching colored suede tassel with gold alloy keyring.',
        'long_description' => 'A perfect personalized accessory or party giveaway. Choose any initial from A-Z with custom flower petals, gold/silver foil, and high-strength reinforced screw eye pins that will never detach or break.',
        'price' => 750.00,
        'original_price' => 990.00,
        'stock' => 100,
        'images' => [
            '/uploads/products/prod_7.jpg',
            '/uploads/products/prod_8.jpg',
            '/uploads/products/prod_6.jpg'
        ],
        'colors' => [
            ['name' => 'Gold Flake & Rose', 'hex' => '#D4AF37'],
            ['name' => 'Silver Flake & Lavender', 'hex' => '#C0C0C0'],
            ['name' => 'Copper Flake & Teal', 'hex' => '#B87333']
        ],
        'reviews' => [
            [
                'reviewer' => 'Nimra Shah',
                'email' => 'nimra@example.com',
                'rating' => 5,
                'review' => 'Ordered 5 keychains for my cousins and everyone loved them! Very shiny and solid.'
            ]
        ]
    ],
    [
        'id' => 8,
        'category_id' => 8, // Pressed Flower Bookmarks
        'category_ids' => [8, 9], // also Favors & Gifts
        'name' => 'Handcrafted Pressed Floral Resin Quran & Book Bookmark',
        'slug' => 'handcrafted-pressed-floral-resin-quran-book-bookmark',
        'description' => 'Ultra-slim durable resin bookmark embedded with real dried forget-me-not flowers, gold leaf, and a luxury handmade matching silk tassel.',
        'long_description' => 'Perfect reading companion for Quran study, novel reading, and journals. Ultra-smooth polished edges that protect your book pages from any creasing or tearing. Dimensions: 5.5 x 1 inch.',
        'price' => 850.00,
        'original_price' => 1150.00,
        'stock' => 75,
        'images' => [
            '/uploads/products/prod_8.jpg',
            '/uploads/products/prod_5.jpg',
            '/uploads/products/prod_7.jpg'
        ],
        'colors' => [
            ['name' => 'Pastel Pink & Gold', 'hex' => '#FFC0CB'],
            ['name' => 'Sky Blue & Silver', 'hex' => '#87CEEB'],
            ['name' => 'Forest Green & Gold', 'hex' => '#228B22']
        ],
        'reviews' => [
            [
                'reviewer' => 'Maryam Siddiqui',
                'email' => 'maryam.s@example.com',
                'rating' => 5,
                'review' => 'Slim enough to fit in my Quran without damaging the binding. Beautiful floral design.'
            ]
        ]
    ],
    [
        'id' => 9,
        'category_id' => 9, // Wedding Favors & Gifts
        'category_ids' => [9, 12], // also Best Sellers
        'name' => 'Custom Wedding Event Favors with Resin Initial Tag (Pack of 10)',
        'slug' => 'custom-wedding-event-favors-resin-initial-tag-pack-of-10',
        'description' => 'Set of 10 customized wedding / bridal shower favor boxes including mini resin floral charms, personalized thank you tags, and satin ribbon packaging.',
        'long_description' => 'Impress your wedding guests with memorable handcrafted keepsake giveaways. Each box contains an artisanal resin mini charm/keychain customized with your event date and monogram. Minimum pack 10 pieces.',
        'price' => 3500.00,
        'original_price' => 4500.00,
        'stock' => 20,
        'images' => [
            '/uploads/products/prod_9.jpg',
            '/uploads/products/prod_1.jpg',
            '/uploads/products/prod_4.jpg'
        ],
        'colors' => [
            ['name' => 'Champagne & Gold', 'hex' => '#F7E7CE'],
            ['name' => 'Dusty Rose & Silver', 'hex' => '#DCAE96'],
            ['name' => 'Royal Emerald', 'hex' => '#097969']
        ],
        'reviews' => [
            [
                'reviewer' => 'Sana Javed',
                'email' => 'sana.j@example.com',
                'rating' => 5,
                'review' => 'Ordered 50 packs for my Dholki favors. Guests were raving about how unique and cute they were!'
            ]
        ]
    ],
    [
        'id' => 10,
        'category_id' => 10, // Resin Hardcover Diaries
        'category_ids' => [10, 11], // also New Arrivals
        'name' => 'Handcrafted Ocean Wave Epoxy Resin A5 Hardcover Diary',
        'slug' => 'handcrafted-ocean-wave-epoxy-resin-a5-hardcover-diary',
        'description' => 'Reusable 6-ring binder journal featuring a hand-poured multi-layered ocean wave resin cover with real sand, seafoam cells, and gold foil personalization.',
        'long_description' => 'An extraordinary handcrafted journal for notes, sketches, and daily reflections. Front and back covers are cast in 3D multi-layered beach ocean resin with shimmering mica pigments. Comes with 160 pages of 100 GSM premium unlined/lined refillable paper and magnetic ribbon closure.',
        'price' => 2800.00,
        'original_price' => 3500.00,
        'stock' => 22,
        'images' => [
            '/uploads/products/prod_10.jpg',
            '/uploads/products/prod_8.jpg',
            '/uploads/products/prod_3.jpg'
        ],
        'colors' => [
            ['name' => 'Deep Ocean Blue', 'hex' => '#003366'],
            ['name' => 'Turquoise Lagoon', 'hex' => '#008080'],
            ['name' => 'Pink Sunset Coral', 'hex' => '#FF7F50']
        ],
        'reviews' => [
            [
                'reviewer' => 'Khadija Butt',
                'email' => 'khadija.b@example.com',
                'rating' => 5,
                'review' => 'The 3D wave effect on the cover is mindblowing. Feels like a real piece of ocean in your hand.'
            ]
        ]
    ],
    [
        'id' => 11,
        'category_id' => 1, // Resin Trays & Platters
        'category_ids' => [1, 11], // also New Arrivals
        'name' => 'Luxury Amethyst Geode Resin Serving Platter with Handles',
        'slug' => 'luxury-amethyst-geode-resin-serving-platter-handles',
        'description' => 'Masterpiece geode serving board featuring crushed raw crystal quartz, shimmering purple-gold mica layers, and polished brass handles.',
        'long_description' => 'A conversation starter for every gathering. Hand-poured in 4 separate resin layers to create true three-dimensional crystalline depth. Resilient, scratch-resistant topcoat with food-grade certification. Dimensions: 16 x 11 inches.',
        'price' => 6800.00,
        'original_price' => 8500.00,
        'stock' => 12,
        'images' => [
            '/uploads/products/prod_11.jpg',
            '/uploads/products/prod_3.jpg',
            '/uploads/products/prod_16.jpg'
        ],
        'colors' => [
            ['name' => 'Royal Purple & Gold', 'hex' => '#4B0082'],
            ['name' => 'Emerald & Gold Geode', 'hex' => '#004B23'],
            ['name' => 'Midnight Black & Gold', 'hex' => '#1C1C1C']
        ],
        'reviews' => [
            [
                'reviewer' => 'Rabia Farooq',
                'email' => 'rabia.f@example.com',
                'rating' => 5,
                'review' => 'Stunning craftsmanship! The quartz crystals and resin blending are top tier.'
            ]
        ]
    ],
    [
        'id' => 12,
        'category_id' => 3, // Resin Keepsake Plaques
        'category_ids' => [3, 2], // also Nikkah Nama & Stationery
        'name' => 'Customized Mirror Acrylic Thumbprint Nikkah Plaque Stand',
        'slug' => 'customized-mirror-acrylic-thumbprint-nikkah-plaque-stand',
        'description' => 'Personalized gold mirror plaque with spaces for bride and groom thumb impressions, couple names, and Nikkah date in Arabic thuluth calligraphy.',
        'long_description' => 'The most trending wedding keepsake for contemporary couples. Crafted from 3mm high-reflection acrylic mirror mounted on a solid wooden mahogany stand. Includes high-pigment washable inkpad kit (Gold/Silver).',
        'price' => 3200.00,
        'original_price' => 4200.00,
        'stock' => 35,
        'images' => [
            '/uploads/products/prod_12.jpg',
            '/uploads/products/prod_1.jpg',
            '/uploads/products/prod_2.jpg'
        ],
        'colors' => [
            ['name' => 'Mirror Gold', 'hex' => '#D4AF37'],
            ['name' => 'Mirror Silver', 'hex' => '#C0C0C0'],
            ['name' => 'Rose Gold Mirror', 'hex' => '#B76E79']
        ],
        'reviews' => [
            [
                'reviewer' => 'Iqra Noor',
                'email' => 'iqra.n@example.com',
                'rating' => 5,
                'review' => 'Came out so elegant! The thumb impression space was clean and ink washed off easily without staining.'
            ]
        ]
    ],
    [
        'id' => 13,
        'category_id' => 5, // Handcrafted Resin Jewellery
        'category_ids' => [5, 11], // also New Arrivals
        'name' => 'Preserved Real Red Rose Petal Resin Pendant & Earring Jewelry Set',
        'slug' => 'preserved-real-red-rose-petal-resin-pendant-earring-set',
        'description' => 'Handcrafted botanical jewelry set containing real preserved crimson rose petals encased in tear-drop crystal resin with 18K gold-plated hypoallergenic chain.',
        'long_description' => 'Wear a piece of everlasting nature. Each pendant and earring pair is hand-cast with organic floral botanicals in lightweight, bubble-free UV resin. Chain length: 18 inches with 2-inch extender. Nickel-free and lead-free.',
        'price' => 2200.00,
        'original_price' => 2900.00,
        'stock' => 28,
        'images' => [
            '/uploads/products/prod_13.jpg',
            '/uploads/products/prod_7.jpg',
            '/uploads/products/prod_5.jpg'
        ],
        'colors' => [
            ['name' => 'Ruby Red & Gold', 'hex' => '#9B111E'],
            ['name' => 'Emerald Green & Gold', 'hex' => '#097969'],
            ['name' => 'Ocean Blue & Silver', 'hex' => '#1E90FF']
        ],
        'reviews' => [
            [
                'reviewer' => 'Anum Sheikh',
                'email' => 'anum.s@example.com',
                'rating' => 5,
                'review' => 'Very lightweight and dainty! Got so many compliments at a wedding.'
            ]
        ]
    ],
    [
        'id' => 14,
        'category_id' => 4, // Custom Nikkah Pens
        'category_ids' => [4, 12], // also Best Sellers
        'name' => 'Custom Name Engraved Gold Mirror Nikkah Pen in Velvet Box',
        'slug' => 'custom-name-engraved-gold-mirror-nikkah-pen-velvet-box',
        'description' => 'Heavy metal twist-action luxury gold ballpoint pen with custom laser-engraved bride and groom names, packed in a customized royal velvet keepsake box.',
        'long_description' => 'An elegant keepsake for signing your Nikkah contract and documents. Heavyweight metallic build with flawless 24K gold plating and smooth Japanese black ink refill. Custom laser engraved with couple names or "Qubool Hai".',
        'price' => 1850.00,
        'original_price' => 2400.00,
        'stock' => 45,
        'images' => [
            '/uploads/products/prod_14.jpg',
            '/uploads/products/prod_4.jpg',
            '/uploads/products/prod_2.jpg'
        ],
        'colors' => [
            ['name' => 'Shiny Gold', 'hex' => '#D4AF37'],
            ['name' => 'Rose Gold', 'hex' => '#B76E79'],
            ['name' => 'Matte Black & Gold', 'hex' => '#2B2B2B']
        ],
        'reviews' => [
            [
                'reviewer' => 'Naveed Akhtar',
                'email' => 'naveed@example.com',
                'rating' => 5,
                'review' => 'Engraving was sharp and clean. Looks very royal in the velvet box.'
            ]
        ]
    ],
    [
        'id' => 15,
        'category_id' => 6, // Islamic Car Hangings
        'category_ids' => [6, 9], // also Favors & Gifts
        'name' => 'Premium Safar Dua Double-Sided Islamic Mirror Car Charm',
        'slug' => 'premium-safar-dua-double-sided-islamic-mirror-car-charm',
        'description' => 'Double-sided hanging amulet for your vehicle with Arabic Safar Dua on the front and Ayatul Kursi on the back, finished with a crystal bead and silk tassel.',
        'long_description' => 'Give your vehicle a touch of serenity and divine protection. Heavy duty acrylic mirror encapsulated in scratch-resistant crystal resin. Designed to withstand extreme car interior temperatures without fading or warping.',
        'price' => 1350.00,
        'original_price' => 1750.00,
        'stock' => 55,
        'images' => [
            '/uploads/products/prod_15.jpg',
            '/uploads/products/prod_6.jpg',
            '/uploads/products/prod_12.jpg'
        ],
        'colors' => [
            ['name' => 'Mirror Gold', 'hex' => '#D4AF37'],
            ['name' => 'Mirror Silver', 'hex' => '#C0C0C0']
        ],
        'reviews' => [
            [
                'reviewer' => 'Bilal Riaz',
                'email' => 'bilal.r@example.com',
                'rating' => 5,
                'review' => 'High quality finish, looks classy in my car. Fast delivery.'
            ]
        ]
    ],
    [
        'id' => 16,
        'category_id' => 1, // Resin Trays & Platters
        'category_ids' => [1, 11], // also New Arrivals
        'name' => 'Emerald & Gold Leaf Agate Slice Resin Table Coasters (Set of 4)',
        'slug' => 'emerald-gold-leaf-agate-slice-resin-coasters-set-of-4',
        'description' => 'Set of 4 irregular organic agate slice resin coasters featuring deep emerald greens, white pearl waves, and hand-painted 24K metallic gold gilded edges.',
        'long_description' => 'Inspired by natural agate geode formations. Each coaster is unique with organic wave patterns and crystal center effects. Hand-painted with rich metallic gold leaf enamel along the scalloped edges. Perfect for hot and cold beverages.',
        'price' => 2400.00,
        'original_price' => 3200.00,
        'stock' => 25,
        'images' => [
            '/uploads/products/prod_16.jpg',
            '/uploads/products/prod_5.jpg',
            '/uploads/products/prod_11.jpg'
        ],
        'colors' => [
            ['name' => 'Emerald Green & Gold', 'hex' => '#097969'],
            ['name' => 'Sapphire Blue & Silver', 'hex' => '#0F52BA'],
            ['name' => 'Blush Quartz & Rose Gold', 'hex' => '#E0A899']
        ],
        'reviews' => [
            [
                'reviewer' => 'Zoya Qureshi',
                'email' => 'zoya.q@example.com',
                'rating' => 5,
                'review' => 'The gold trim is lustrous and the resin finish is very glossy. Perfect for tea times!'
            ]
        ]
    ]
];

$prodStmt = $db->prepare("
    INSERT INTO products (
        id, category_id, name, slug, description, long_description,
        price, original_price, stock, images, colors, is_active, is_sold_out
    ) VALUES (
        :id, :category_id, :name, :slug, :description, :long_description,
        :price, :original_price, :stock, :images, :colors, 1, 0
    )
");

$pcStmt = $db->prepare("
    INSERT INTO product_categories (product_id, category_id)
    VALUES (:product_id, :category_id)
    ON DUPLICATE KEY UPDATE product_id = product_id
");

$reviewStmt = $db->prepare("
    INSERT INTO product_reviews (product_id, reviewer, reviewer_email, review, rating, status)
    VALUES (:product_id, :reviewer, :reviewer_email, :review, :rating, 'approved')
");

foreach ($products as $p) {
    $prodStmt->execute([
        ':id' => $p['id'],
        ':category_id' => $p['category_id'],
        ':name' => $p['name'],
        ':slug' => $p['slug'],
        ':description' => $p['description'],
        ':long_description' => $p['long_description'],
        ':price' => $p['price'],
        ':original_price' => $p['original_price'],
        ':stock' => $p['stock'],
        ':images' => json_encode($p['images']),
        ':colors' => json_encode($p['colors'])
    ]);

    // Categories association
    $catIds = $p['category_ids'] ?? [$p['category_id']];
    foreach ($catIds as $cId) {
        $pcStmt->execute([
            ':product_id' => $p['id'],
            ':category_id' => $cId
        ]);
    }

    // Reviews
    if (!empty($p['reviews'])) {
        foreach ($p['reviews'] as $rev) {
            $reviewStmt->execute([
                ':product_id' => $p['id'],
                ':reviewer' => $rev['reviewer'],
                ':reviewer_email' => $rev['email'],
                ':review' => $rev['review'],
                ':rating' => $rev['rating']
            ]);
        }
    }
}

echo "Successfully seeded " . count($products) . " products with full categories, images, variants and reviews!\n";
