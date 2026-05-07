import axios from 'axios'
import { toast } from '../components/Toast'

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 10000
})

apiClient.interceptors.request.use(
    (config) => {
        try {
            const initData = window.Telegram?.WebApp?.initData

            if (initData) {
                config.headers['Content-Type'] = 'application/json'
                config.headers.Authorization = `tma ${initData}`
                if (import.meta.env.VITE_ENV === 'development') {
                    config.headers['Bypass-Tunnel-Reminder'] = 'true'
                    config.headers['ngrok-skip-browser-warning'] = '69420'
                }
            }
        } catch (error) {
            console.warn('Running outside Telegram or error getting initData.', error)
        }

        return config
    }
)

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || error.response?.data?.error || error.message || 'An unexpected error occurred';
        toast.error(message);
        return Promise.reject(error);
    }
)
