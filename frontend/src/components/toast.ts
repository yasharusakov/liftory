import {createContext, useContext} from 'react'

export type ToastVariant = 'success' | 'error'

export interface ToastOptions {
    message: string
    variant?: ToastVariant
    duration?: number
}

export interface ToastState {
    id: number
    message: string
    variant: ToastVariant
    duration: number
    visible: boolean
}

export interface ToastContextValue {
    toast: ToastState | null
    showToast: (options: ToastOptions) => void
}

export const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export const useToast = () => {
    const ctx = useContext(ToastContext)
    if (!ctx) throw new Error('useToast must be used within ToastProvider')
    return ctx
}

