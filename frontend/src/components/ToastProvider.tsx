import {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react'
import {ToastContext, type ToastOptions, type ToastState} from './toast'

export const ToastProvider = ({children}: { children: React.ReactNode }) => {
    const [toast, setToast] = useState<ToastState | null>(null)
    const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const showFrameRef = useRef<number | null>(null)

    const showToast = useCallback((options: ToastOptions) => {
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
        if (clearTimerRef.current) clearTimeout(clearTimerRef.current)
        if (showFrameRef.current) cancelAnimationFrame(showFrameRef.current)

        setToast({
            id: Date.now(),
            message: options.message,
            variant: options.variant ?? 'success',
            duration: options.duration ?? 2600,
            visible: false
        })

        showFrameRef.current = requestAnimationFrame(() => {
            setToast((current) => (current ? {...current, visible: true} : current))
        })
    }, [])

    useEffect(() => {
        if (!toast) return

        hideTimerRef.current = setTimeout(() => {
            setToast((current) => (current ? {...current, visible: false} : current))
        }, toast.duration)

        clearTimerRef.current = setTimeout(() => {
            setToast(null)
        }, toast.duration + 420)

        return () => {
            if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
            if (clearTimerRef.current) clearTimeout(clearTimerRef.current)
            if (showFrameRef.current) cancelAnimationFrame(showFrameRef.current)
        }
    }, [toast])

    const value = useMemo(() => ({toast, showToast}), [toast, showToast])

    return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export const ToastHost = () => {
    const ctx = useContext(ToastContext)
    if (!ctx || !ctx.toast) return null

    const {toast} = ctx

    return (
        <div className="toast-host" role="status" aria-live="polite">
            <div
                key={toast.id}
                className={`toast toast--${toast.variant} ${toast.visible ? 'toast--visible' : ''}`}
            >
                {toast.message}
            </div>
        </div>
    )
}
