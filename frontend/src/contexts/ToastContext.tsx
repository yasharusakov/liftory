import {createContext, type ReactNode, useCallback, useContext, useEffect, useRef, useState} from 'react'

type ToastType = 'success' | 'error' | 'info';

interface Toast {
    id: number;
    message: string;
    type: ToastType;
    isLeaving: boolean;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const ToastProvider = ({children}: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([])
    const timeoutIdsRef = useRef<number[]>([])

    useEffect(() => {
        return () => {
            timeoutIdsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId))
            timeoutIdsRef.current = []
        }
    }, [])

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Date.now()
        setToasts((prev) => [...prev, {id, message, type, isLeaving: false}])

        const startLeaveTimeoutId = window.setTimeout(() => {
            setToasts((prev) =>
                prev.map((toast) =>
                    toast.id === id ? {...toast, isLeaving: true} : toast
                )
            )
        }, 2500)
        timeoutIdsRef.current.push(startLeaveTimeoutId)

        const removeToastTimeoutId = window.setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id))
        }, 3000)
        timeoutIdsRef.current.push(removeToastTimeoutId)
    }, [])

    return (
        <ToastContext.Provider value={{showToast}}>
            {children}
            <div className="toast-container">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`toast toast-${toast.type} ${toast.isLeaving ? 'slide-up' : 'slide-down'}`}
                    >
                        {toast.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}

export const useToast = () => {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}
