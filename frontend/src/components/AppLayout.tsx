import {useEffect} from 'react'
import {Outlet} from 'react-router-dom'
import BottomNav from './BottomNav'
import {ToastHost} from './ToastProvider'

const AppLayout = () => {
    const tg = window.Telegram?.WebApp

    useEffect(() => {
        tg?.ready()
        tg?.expand()
    }, [tg])

    return (
        <div className="app-shell">
            <ToastHost/>
            <main className="app-content">
                <Outlet/>
            </main>
            <BottomNav/>
        </div>
    )
}

export default AppLayout
