import axios from 'axios'

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 10000
})

apiClient.interceptors.request.use(
    (config) => {
        try {
            const tg = (window as any).Telegram?.WebApp
            const initDataRaw = tg?.initData

            if (initDataRaw) {
                config.headers['Content-Type'] = 'application/json'
                config.headers.Authorization = `tma ${initDataRaw}`
                if (import.meta.env.VITE_ENV === 'development') {
                    config.headers['Bypass-Tunnel-Reminder'] = 'true'
                    config.headers['ngrok-skip-browser-warning'] = '69420'
                }
            }
        } catch (error) {
            console.warn('Running outside Telegram or error getting initData.')
        }

        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)