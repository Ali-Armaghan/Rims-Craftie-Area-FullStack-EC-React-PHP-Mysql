import { Product, ProductReview } from '@/data/products';

export interface OrderPayload {
    payment_method: string;
    payment_method_title: string;
    set_paid: boolean;
    billing: {
        first_name: string;
        last_name: string;
        address_1: string;
        city: string;
        state: string;
        postcode: string;
        country: string;
        email: string;
        phone?: string;
    };
    shipping: {
        first_name: string;
        last_name: string;
        address_1: string;
        city: string;
        state: string;
        postcode: string;
        country: string;
    };
    line_items: {
        product_id: number;
        quantity: number;
    }[];
}


/**
 * Product API service for the custom PHP backend.
 *
 * Set this in Frontend/.env:
 * VITE_API_BASE_URL=http://localhost/ateeqo/backend/api
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');

// Legacy WooCommerce proxy retained only for reviews/orders until those backend
// endpoints are migrated.
const PROXY_URL = '/api/woocommerce';

type BackendProduct = {
    id: number | string;
    name: string;
    slug: string;
    category_id?: number | string | null;
    category_name?: string | null;
    description?: string | null;
    price: number | string;
    stock?: number | string | null;
    images?: string[] | string | null;
    is_active?: number | string | boolean;
    created_at?: string;
};

function getBackendUrl(path: string, params: Record<string, string | number | undefined> = {}) {
    if (!API_BASE_URL) {
        throw new Error('Missing VITE_API_BASE_URL in Frontend/.env');
    }

    const url = new URL(`${API_BASE_URL}/index.php`);
    url.searchParams.set('path', path);

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
            url.searchParams.set(key, String(value));
        }
    });

    return url;
}

function parseImages(images: BackendProduct['images']) {
    if (Array.isArray(images)) {
        return images;
    }

    if (typeof images === 'string' && images.trim()) {
        try {
            const parsed = JSON.parse(images);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [images];
        }
    }

    return [];
}

function resolveImageUrl(image: string) {
    if (/^(https?:)?\/\//i.test(image) || image.startsWith('data:')) {
        return image;
    }

    if (!API_BASE_URL) {
        return image;
    }

    const backendOrigin = new URL(API_BASE_URL).origin;
    return image.startsWith('/') ? `${backendOrigin}${image}` : `${backendOrigin}/${image}`;
}

function mapBackendProduct(product: BackendProduct): Product {
    const parsedImages = parseImages(product.images).filter(Boolean).map(resolveImageUrl);
    const image = parsedImages[0] ?? 'https://placehold.co/600x600?text=No+Image';
    const stockQuantity = Number(product.stock ?? 0);

    return {
        id: String(product.id),
        name: product.name || 'Unknown Product',
        price: Number(product.price ?? 0),
        image,
        images: parsedImages.length ? parsedImages : [image],
        category: product.category_name || 'Uncategorized',
        description: product.description || 'No description available',
        shortDescription: product.description || undefined,
        details: [],
        material: 'Premium Quality',
        inStock: stockQuantity > 0 && Number(product.is_active ?? 1) === 1,
        stockQuantity,
        rating: '0.00',
        reviewCount: 0,
    };
}

/**
 * Basic fetcher for all custom backend products.
 */
export async function fetchProducts() {
    try {
        const response = await fetch(getBackendUrl('products').toString(), {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`Error fetching products: ${response.statusText}`);
        }

        const data = await response.json();
        const productsData = Array.isArray(data) ? data : [];
        return productsData.map(mapBackendProduct);
    } catch (error) {
        console.error("Failed to fetch products:", error);
        return [];
    }
}

/**
 * Fetches a single product by ID to optimize payload size.
 */
export async function fetchProduct(id: string): Promise<Product | null> {
    try {
        const response = await fetch(getBackendUrl('products', { id }).toString(), {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`Error fetching product: ${response.statusText}`);
        }

        const data = await response.json();
        return mapBackendProduct(data);
    } catch (error) {
        console.error(`Failed to fetch product ${id}:`, error);
        return null; // Return null to indicate not found or network error
    }
}

export async function fetchFeaturedProducts() {
    try {
        const products = await fetchProducts();
        return products.slice(0, 4);
    } catch (error) {
        console.error("Failed to fetch featured products:", error);
        return [];
    }
}

/**
 * Creates an order in WooCommerce
 */
export async function createOrder(orderData: OrderPayload) {
    try {
        const url = new URL(PROXY_URL, window.location.origin);
        url.searchParams.append('endpoint', 'orders');

        const response = await fetch(url.toString(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error creating order: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to create order:", error);
        throw error;
    }
}

/**
 * Fetches reviews for a specific product
 */
export async function fetchProductReviews(productId: string): Promise<ProductReview[]> {
    try {
        const url = new URL(PROXY_URL, window.location.origin);
        url.searchParams.append('endpoint', 'products/reviews');
        url.searchParams.append('searchParams', new URLSearchParams({ product: productId }).toString());

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`Error fetching reviews: ${response.statusText}`);
        }

        const data = await response.json();
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Failed to fetch product reviews:", error);
        return [];
    }
}

/**
 * Submits a new review for a product
 */
export async function submitProductReview(reviewData: { product_id: number; review: string; reviewer: string; reviewer_email: string; rating: number }) {
    try {
        const url = new URL(PROXY_URL, window.location.origin);
        url.searchParams.append('endpoint', 'products/reviews');

        const response = await fetch(url.toString(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(reviewData)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Error submitting review: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Failed to submit review:", error);
        throw error;
    }
}

