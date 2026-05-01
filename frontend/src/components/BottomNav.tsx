import {NavLink} from 'react-router-dom'
import {History, Home, LineChart, Trophy} from 'lucide-react'

const tabs = [
    {to: '/', label: 'Home', icon: Home},
    {to: '/history', label: 'History', icon: History},
    {to: '/records', label: 'Records', icon: Trophy},
    {to: '/progress', label: 'Progress', icon: LineChart}
]

const BottomNav = () => {
    return (
        <nav className="bottom-nav" aria-label="Primary">
            {tabs.map((tab) => (
                <NavLink
                    key={tab.to}
                    to={tab.to}
                    end={tab.to === '/'}
                    className={({isActive}) =>
                        isActive ? 'bottom-nav__item is-active' : 'bottom-nav__item'
                    }
                >
                    <span className="bottom-nav__icon">
                        <tab.icon size={18} aria-hidden="true"/>
                    </span>
                    <span className="bottom-nav__label">{tab.label}</span>
                    <span className="bottom-nav__indicator" aria-hidden="true"/>
                </NavLink>
            ))}
        </nav>
    )
}

export default BottomNav
