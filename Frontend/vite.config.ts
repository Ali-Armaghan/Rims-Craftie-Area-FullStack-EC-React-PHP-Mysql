import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// A custom Vite plugin to simulate the Vercel /api/woocommerce serverless function locally.
function woocommerceLocalProxy() {
  return {
    name: 'woocommerce-local-proxy',
    configureServer(server: any) {
      server.middlewares.use('/api/woocommerce', async (req: any, res: any, next: any) => {
        try {
          // Load environment variables dynamically based on process.cwd
          const env = loadEnv(server.config.mode, process.cwd(), '');

          const API_URL = env.VITE_WC_API_URL || 'https://benzastore.pk/wp-json/wc/v3';
          const CONSUMER_KEY = env.VITE_WC_CONSUMER_KEY;
          const CONSUMER_SECRET = env.VITE_WC_CONSUMER_SECRET;

          if (!CONSUMER_KEY || !CONSUMER_SECRET) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: 'Server configuration missing WooCommerce keys.' }));
          }

          // Parse intended WooCommerce endpoint and search params
          const parsedUrl = new URL(req.url || '/', `http://${req.headers.host}`);
          let endpoint = parsedUrl.searchParams.get('endpoint');

          // Read body for POST/PUT requests
          // We need to buffer the incoming request stream since `req.body` doesn't exist natively.
          let bodyData = '';
          if (req.method !== 'GET' && req.method !== 'HEAD') {
            for await (const chunk of req) {
              bodyData += chunk;
            }
          }

          let parsedBody: any = {};
          if (bodyData) {
            try {
              parsedBody = JSON.parse(bodyData);
            } catch (e) {
              // Not JSON
            }
          }

          if (!endpoint && parsedBody && parsedBody.endpoint) {
            endpoint = parsedBody.endpoint;
          }

          if (!endpoint) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: 'Endpoint is required.' }));
          }

          // Construct the WooCommerce API URL
          const wcUrl = new URL(`${API_URL}/${endpoint}`);
          wcUrl.searchParams.append('consumer_key', CONSUMER_KEY);
          wcUrl.searchParams.append('consumer_secret', CONSUMER_SECRET);

          // Forward any passed searchParams specifically stringified in the 'searchParams' query arg
          const passedSearchParamsStr = parsedUrl.searchParams.get('searchParams');
          if (passedSearchParamsStr) {
            const extraParams = new URLSearchParams(passedSearchParamsStr);
            extraParams.forEach((value, key) => {
              wcUrl.searchParams.append(key, value);
            });
          }

          const fetchOptions: RequestInit = {
            method: req.method,
            headers: {
              'Accept': 'application/json'
            }
          };

          if (req.method !== 'GET' && req.method !== 'HEAD' && bodyData) {
            const bodyCopy = { ...parsedBody };
            delete bodyCopy.endpoint;

            fetchOptions.headers = {
              ...fetchOptions.headers,
              'Content-Type': 'application/json'
            };

            fetchOptions.body = JSON.stringify(bodyCopy);
          }

          const wcResponse = await fetch(wcUrl.toString(), fetchOptions);
          let wcData;
          try {
            wcData = await wcResponse.json();
          } catch (e) {
            const text = await wcResponse.text();
            console.error("Failed to parse WC JSON", text);
            wcData = { error: "Failed to parse Response from WooCommerce" };
          }

          res.statusCode = wcResponse.status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(wcData));

        } catch (error) {
          console.error('Error in local woocommerce proxy:', error);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Failed to proxy request locally.' }));
        }
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), woocommerceLocalProxy()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
