import axios from 'axios'

const baseURL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ??
  'http://localhost/ateeqo/backend/api'

const apiClient = axios.create({
  baseURL: `${baseURL}/index.php`,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  if (!config.url || /^https?:\/\//i.test(config.url)) {
    return config
  }

  if (config.data instanceof FormData) {
    config.headers.delete('Content-Type')
  }

  const [path, queryString] = config.url.replace(/^\/+/, '').split('?')
  const queryParams = Object.fromEntries(new URLSearchParams(queryString))

  config.url = ''
  config.params = {
    ...queryParams,
    ...(config.params ?? {}),
    path,
  }

  return config
})

export default apiClient
