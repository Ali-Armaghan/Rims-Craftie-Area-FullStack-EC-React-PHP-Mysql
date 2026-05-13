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
 * API service for interacting with WordPress/WooCommerce.
 * 
 * Make sure to set the following environment variables in your .env file:
 * VITE_WC_API_URL
 * VITE_WC_CONSUMER_KEY
 * VITE_WC_CONSUMER_SECRET
 */

const API_URL = import.meta.env.VITE_WC_API_URL;
// Use the Vercel proxy route in production to avoid CORS and securely hide keys.
// The Serverless Function api/woocommerce.js handles appending the keys.
const PROXY_URL = '/api/woocommerce';
// In-memory caches removed in favor of React Query

/**
 * Basic fetcher for all WooCommerce REST API products
 */
export async function fetchProducts() {
    try {
        const url = new URL(PROXY_URL, window.location.origin);
        url.searchParams.append('endpoint', 'products');

        // Increase per_page if you need more catalog items locally or add searchParams
        url.searchParams.append('searchParams', new URLSearchParams({ per_page: '100' }).toString());

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`Error fetching products: ${response.statusText}`);
        }

        const data = await response.json();

        // Ensure we are dealing with an array of products
        const productsData = Array.isArray(data) ? data : [];

        // Map WooCommerce products to our local Product interface
        const mappedProducts: Product[] = productsData.map(mapWcProduct);

        return mappedProducts;
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
        const url = new URL(PROXY_URL, window.location.origin);
        url.searchParams.append('endpoint', `products/${id}`);

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`Error fetching product: ${response.statusText}`);
        }

        const data = await response.json();
        return mapWcProduct(data);
    } catch (error) {
        console.error(`Failed to fetch product ${id}:`, error);
        return null; // Return null to indicate not found or network error
    }
}

/**
 * Fetches 4 featured products from WooCommerce, requesting only necessary fields.
 */
export async function fetchFeaturedProducts() {
    try {
        // Step 1: Find the category ID for the slug "featured"
        const catUrl = new URL(PROXY_URL, window.location.origin);
        catUrl.searchParams.append('endpoint', 'products/categories');
        catUrl.searchParams.append('searchParams', new URLSearchParams({ slug: 'featured' }).toString());

        const catResponse = await fetch(catUrl.toString(), {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        let categoryId = null;
        if (catResponse.ok) {
            const catData = await catResponse.json();
            if (Array.isArray(catData) && catData.length > 0) {
                categoryId = catData[0].id;
            }
        }

        // Step 2: Fetch products using that category ID
        const url = new URL(PROXY_URL, window.location.origin);
        url.searchParams.append('endpoint', 'products');

        const extraParams = new URLSearchParams();
        if (categoryId) {
            extraParams.append('category', categoryId.toString());
        } else {
            // Fallback: If "featured" category doesn't exist, we fallback to the WooCommerce native 'featured' flag
            extraParams.append('featured', 'true');
        }

        extraParams.append('per_page', '4');
        extraParams.append('_fields', 'id,name,price,regular_price,sale_price,images,on_sale,categories,description,attributes,stock_status,stock_quantity,average_rating,rating_count,type');

        url.searchParams.append('searchParams', extraParams.toString());

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`Error fetching featured products: ${response.statusText}`);
        }

        const data = await response.json();

        // Debugging log so you can see exactly what the API returns in your browser console
        console.log("Featured Products API Response:", data);

        const productsData = Array.isArray(data) ? data : [];
        const mappedProducts: Product[] = productsData.map(mapWcProduct);

        return mappedProducts;
    } catch (error) {
        console.error("Failed to fetch featured products:", error);
        return [];
    }
}

// Helper to map WC format to local format
function mapWcProduct(wpProduct: any): Product {
    if (!wpProduct) return null as any;

    const image = wpProduct.images && wpProduct.images.length > 0
        ? wpProduct.images[0].src
        : "https://via.placeholder.com/400x500?text=No+Image";

    const images = wpProduct.images && wpProduct.images.length > 0
        ? wpProduct.images.map((img: any) => img.src)
        : [image];

    const category = wpProduct.categories && wpProduct.categories.length > 0
        ? wpProduct.categories[0].name
        : "Uncategorized";

    // WooCommerce returns `price` as the active price (sale or regular).
    // `regular_price` is the original price. `sale_price` is the discount price (if on sale).
    const activePrice = parseFloat(wpProduct.price || 0);
    const regularPrice = wpProduct.regular_price ? parseFloat(wpProduct.regular_price) : 0;
    const salePrice = wpProduct.sale_price ? parseFloat(wpProduct.sale_price) : 0;

    // Robustly determine original price
    // If it's on sale, active price is the sale price, and original is the regular price
    const originalPrice = (regularPrice && regularPrice > activePrice)
        ? regularPrice
        : undefined;

    const currPrice = activePrice;

    let variations: { id: number; name: string }[] | undefined = undefined;
    if (wpProduct.attributes && Array.isArray(wpProduct.attributes)) {
        // Find variations, usually an attribute named "Size" or similar. Just take the first attribute's options for now if it exists
        const variationAttr = wpProduct.attributes.find((attr: any) => attr.variation || attr.options.length > 0);
        if (variationAttr && variationAttr.options) {
            variations = variationAttr.options.map((opt: string, idx: number) => ({ id: idx, name: opt }));
        }
    }

    return {
        id: wpProduct.id.toString(),
        name: wpProduct.name || 'Unknown Product',
        price: currPrice,
        originalPrice,
        image,
        images,
        category,
        description: wpProduct.description ? wpProduct.description.replace(/<[^>]+>/g, '') : "No description available",
        shortDescription: wpProduct.short_description ? wpProduct.short_description.replace(/<[^>]+>/g, '') : undefined,
        details: wpProduct.attributes && Array.isArray(wpProduct.attributes) ? wpProduct.attributes.map((attr: any) => `${attr.name}: ${attr.options.join(', ')}`) : [],
        material: "Varies",
        inStock: wpProduct.stock_status === 'instock',
        badge: wpProduct.featured ? "Featured" : undefined,
        variations: variations,
        rating: wpProduct.average_rating || "0.00",
        reviewCount: wpProduct.rating_count || 0,
        stockQuantity: typeof wpProduct.stock_quantity === 'number' ? wpProduct.stock_quantity : undefined
    };
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

