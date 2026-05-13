import { Product, ProductReview } from '@/data/products';

export interface OrderPayload {
    user_id: number;
    subtotal: number;
    total: number;
    referred_by_code?: string;
    shipping_address: {
        full_name: string;
        phone: string;
        email?: string;
        address: string;
        city: string;
        state: string;
        zip?: string;
        country: string;
    };
    items: {
        product_id: number;
        name: string;
        price: number;
        quantity: number;
    }[];
}

export type CustomerOrder = {
    id: number;
    order_number: string;
    status: string;
    subtotal: string | number;
    total: string | number;
    referred_by_code?: string | null;
    commission_earned?: string | number;
    resale_credited?: number;
    created_at: string;
};

export type CustomerOrderItem = {
    id: number;
    product_id: number;
    product_name: string;
    name?: string;
    price: string | number;
    quantity: number;
    subtotal: string | number;
};

export type CustomerOrderDetail = CustomerOrder & {
    shipping_address: string;
    items: CustomerOrderItem[];
};

export type CustomerResaleSummary = {
    id: number;
    name: string;
    email: string;
    resale_code: string;
    resale_balance: string | number;
    total_referrals: string | number;
    total_commissions: string | number;
    referral_sales: string | number;
};

export type CustomerResaleLedgerEntry = {
    id: number;
    user_id: number;
    order_id?: number | null;
    type: 'credit' | 'debit';
    amount: string | number;
    description?: string;
    created_at: string;
};

export type AuthUser = {
    id: number | string;
    name: string;
    email: string;
    resale_code?: string;
    resale_balance?: string | number;
};

export type LoginPayload = {
    email: string;
    password: string;
};

export type SignupPayload = {
    name: string;
    email: string;
    phone?: string;
    password: string;
    referred_by_code?: string;
};


/**
 * Product API service for the custom PHP backend.
 *
 * Set this in Frontend/.env:
 * VITE_API_BASE_URL=http://localhost/ateeqo/backend/api
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '');

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

export async function loginCustomer(payload: LoginPayload): Promise<AuthUser> {
    const response = await fetch(getBackendUrl('auth/login').toString(), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.user) {
        throw new Error(data.message || 'Invalid email or password');
    }

    return data.user;
}

export async function signupCustomer(payload: SignupPayload) {
    const response = await fetch(getBackendUrl('auth/register').toString(), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.message || 'Unable to create account');
    }

    return data;
}

export async function createOrder(orderData: OrderPayload) {
    try {
        const response = await fetch(getBackendUrl('orders').toString(), {
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

export async function fetchCustomerOrders(userId: string | number): Promise<CustomerOrder[]> {
    const response = await fetch(getBackendUrl('orders', { user_id: userId }).toString(), {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
        throw new Error(`Error fetching orders: ${response.statusText}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
}

export async function fetchCustomerOrder(orderId: string | number, userId: string | number): Promise<CustomerOrderDetail | null> {
    const response = await fetch(
        getBackendUrl('orders', { id: orderId, user_id: userId }).toString(),
        {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
        }
    );

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        throw new Error(`Error fetching order: ${response.statusText}`);
    }

    return response.json();
}

export async function fetchCustomerResale(userId: string | number): Promise<CustomerResaleSummary> {
    const response = await fetch(getBackendUrl('resale', { user_id: userId }).toString(), {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
    });

    if (!response.ok) {
        throw new Error(`Error fetching resale data: ${response.statusText}`);
    }

    return response.json();
}

export async function fetchCustomerResaleLedger(userId: string | number): Promise<CustomerResaleLedgerEntry[]> {
    const response = await fetch(
        getBackendUrl('resale/ledger', { user_id: userId }).toString(),
        {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
        }
    );

    if (!response.ok) {
        throw new Error(`Error fetching resale ledger: ${response.statusText}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
}

/**
 * Fetches reviews for a specific product
 */
export async function fetchProductReviews(productId: string): Promise<ProductReview[]> {
    try {
        const response = await fetch(
            getBackendUrl('reviews', { product_id: productId }).toString(),
            {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
            }
        );

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
        const response = await fetch(getBackendUrl('reviews').toString(), {
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

