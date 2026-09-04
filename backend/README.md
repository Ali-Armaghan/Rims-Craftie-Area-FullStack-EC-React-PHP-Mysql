# Craftie._.Area Backend (PHP + MySQL)

## Setup Instructions

1.  **Database**:
    *   Create a MySQL database (e.g., `craftie_area` or `ateeqo`).
    *   Import the `db.sql` file located in the root of this folder.

2.  **Configuration**:
    *   Open `config/database.php` and update the database credentials (host, username, password, dbname).

3.  **Web Server**:
    *   Point your web server (Apache/Nginx) to the `backend/` folder.
    *   Ensure `mod_rewrite` is enabled in Apache for the `.htaccess` files to work.

4.  **API Endpoints**:
    *   Base URL: `http://your-domain/api/`
    *   **Auth**: `POST /api/auth/register`, `POST /api/auth/login`
    *   **Products**: `GET /api/products`, `GET /api/products/{slug}`
    *   **Tracking**: `POST /api/tracking/init`, `POST /api/tracking/pageview`, `POST /api/tracking/ping`
    *   **Orders**: `POST /api/orders/create`
    *   **Admin**: `GET /api/admin/stats`, `GET /api/admin/live-traffic`, `GET /api/admin/users`

## Key Features

*   **E-Commerce Storefront**: Products, categories, reviews, customer loyalty discounts, checkout, order management.
*   **Visitor Tracking**: Tracks both anonymous and logged-in users. Logs every page view and provides real-time "Live Now" statistics.
*   **Admin Management**: Full control over products, orders, categories, customer analytics, and live site traffic.

## Note on Security
This is a baseline implementation. For production use:
1.  Implement JWT (JSON Web Tokens) for API authentication.
2.  Add more robust validation for input data.
3.  Secure the `api/admin/` endpoints with middleware.
