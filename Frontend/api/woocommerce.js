export default async function handler(req, res) {
    // CORS Headers for Vercel
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Origin', '*') // Or specifically restrict to your domain
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    )

    // Handle OPTIONS preflight request
    if (req.method === 'OPTIONS') {
        res.status(200).end()
        return
    }

    try {
        const API_URL = process.env.VITE_WC_API_URL || 'https://benzastore.pk/wp-json/wc/v3';
        const CONSUMER_KEY = process.env.VITE_WC_CONSUMER_KEY;
        const CONSUMER_SECRET = process.env.VITE_WC_CONSUMER_SECRET;

        if (!CONSUMER_KEY || !CONSUMER_SECRET) {
            return res.status(500).json({ error: 'Server configuration missing WooCommerce keys.' });
        }

        // Determine the endpoint from the query or body
        let { endpoint, searchParams } = req.query;
        if (!endpoint && req.body && req.body.endpoint) {
            endpoint = req.body.endpoint;
        }

        if (!endpoint) {
            return res.status(400).json({ error: 'Endpoint is required.' });
        }

        // Ensure we are only fetching from the specified API_URL base
        // This assumes endpoint looks like "products" or "orders"
        const url = new URL(`${API_URL}/${endpoint}`);

        // Add WooCommerce authentication params
        url.searchParams.append('consumer_key', CONSUMER_KEY);
        url.searchParams.append('consumer_secret', CONSUMER_SECRET);

        // Forward any extra search params the client might have sent (e.g. category, per_page)
        if (searchParams) {
            const extraParams = new URLSearchParams(searchParams);
            extraParams.forEach((value, key) => {
                url.searchParams.append(key, value);
            });
        }

        // Reconstruct the request for WooCommerce
        const fetchOptions = {
            method: req.method,
            headers: {
                'Accept': 'application/json'
            }
        };

        // Forward the body if it's a POST/PUT request
        if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
            // Strip out any custom parameters we added for our proxy logic
            const bodyCopy = { ...req.body };
            delete bodyCopy.endpoint;

            fetchOptions.headers['Content-Type'] = 'application/json';
            fetchOptions.body = JSON.stringify(bodyCopy);
        }

        const wcResponse = await fetch(url.toString(), fetchOptions);
        const wcData = await wcResponse.json();

        res.status(wcResponse.status).json(wcData);
    } catch (error) {
        console.error('Error forwarding request to WooCommerce:', error);
        res.status(500).json({ error: 'Failed to proxy request.' });
    }
}
