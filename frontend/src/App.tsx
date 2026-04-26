import {useEffect, useRef, useState} from 'react'
import {Route, Routes, useLocation} from 'react-router-dom'
import Home from './pages/Home'
import History from './pages/History'
import Records from './pages/Records'
import Progress from './pages/Progress'
import BottomNav from './components/BottomNav'
import './App.css'

declare global {
    interface Window {
        Telegram?: {
            WebApp: any;
        };
    }
}

function App() {
    const tg = window.Telegram?.WebApp
    const location = useLocation()
    const tabOrder: Record<string, number> = {
        '/': 0,
        '/history': 1,
        '/records': 2,
        '/progress': 3
    }

    const [transitionClass, setTransitionClass] = useState('route-fade')
    const previousTabIndexRef = useRef(tabOrder[location.pathname] ?? 0)
    const contentAreaRef = useRef<HTMLElement | null>(null)

    useEffect(() => {
        if (tg) {
            tg.ready()
            tg.expand()
        }
    }, [tg])

    useEffect(() => {
        contentAreaRef.current?.scrollTo({top: 0, behavior: 'auto'})

        const currentIndex = tabOrder[location.pathname] ?? 0
        const previousIndex = previousTabIndexRef.current

        if (currentIndex > previousIndex) {
            setTransitionClass('route-slide-left')
        } else if (currentIndex < previousIndex) {
            setTransitionClass('route-slide-right')
        } else {
            setTransitionClass('route-fade')
        }

        previousTabIndexRef.current = currentIndex
    }, [location.pathname])

    return (
        <div className="app-container">
            <main className="content-area" ref={contentAreaRef}>
                <div key={location.pathname} className={`route-scene ${transitionClass}`}>
                    <Routes location={location}>
                        <Route path="/" element={<Home/>}/>
                        <Route path="/history" element={<History/>}/>
                        <Route path="/records" element={<Records/>}/>
                        <Route path="/progress" element={<Progress/>}/>
                    </Routes>
                </div>
            </main>
            <BottomNav/>
        </div>
    )
}

export default App
