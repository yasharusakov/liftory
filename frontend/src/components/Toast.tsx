import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
    id: string;
    type: ToastType;
    message: string;
    closing?: boolean;
}

// eslint-disable-next-line react-refresh/only-export-components
export const toast = {
    show: (message: string, type: ToastType = 'info') => {
        window.dispatchEvent(new CustomEvent('app-toast', { detail: { id: Math.random().toString(36).substring(2), type, message } }));
    },
    error: (message: string) => toast.show(message, 'error'),
    success: (message: string) => toast.show(message, 'success'),
    info: (message: string) => toast.show(message, 'info'),
};

export const ToastContainer = () => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const closeToast = (id: string) => {
        setToasts(prev => prev.map(t => t.id === id ? { ...t, closing: true } : t));
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 300); // Matches CSS transition duration
    };

    useEffect(() => {
        const handleToast = (e: Event) => {
            const customEvent = e as CustomEvent<ToastMessage>;
            const newToast = customEvent.detail;

            setToasts(prev => [...prev, newToast]);

            setTimeout(() => {
                closeToast(newToast.id);
            }, 4000);
        };

        window.addEventListener('app-toast', handleToast);
        return () => window.removeEventListener('app-toast', handleToast);
    }, []);

    return (
        <div className="toast-container">
            {toasts.map(t => (
                <div key={t.id} className={`toast toast--${t.type} ${t.closing ? 'toast--closing' : ''}`}>
                    <div className="toast__icon">
                        {t.type === 'success' && <CheckCircle size={20} />}
                        {t.type === 'error' && <XCircle size={20} />}
                        {t.type === 'info' && <Info size={20} />}
                    </div>
                    <div className="toast__message">{t.message}</div>
                    <button className="toast__close" onClick={() => closeToast(t.id)}>
                        <X size={16} />
                    </button>
                </div>
            ))}
        </div>
    );
};
