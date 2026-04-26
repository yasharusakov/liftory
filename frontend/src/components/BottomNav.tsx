import {NavLink} from 'react-router-dom'
import {ChartNoAxesColumn, Dumbbell, History, Trophy} from 'lucide-react'

const navItems = [
    {to: '/', label: 'Workout', className: 'nav-workout', Icon: Dumbbell},
    {to: '/history', label: 'History', className: 'nav-history', Icon: History},
    {to: '/records', label: 'Records', className: 'nav-records', Icon: Trophy},
    {to: '/progress', label: 'Progress', className: 'nav-progress', Icon: ChartNoAxesColumn}
]

const BottomNav = () => {
    return (
        <nav className="bottom-nav">
            <ul className="nav-items">
                {navItems.map(({to, label, className, Icon}) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({isActive}) => (isActive ? `nav-item ${className} active` : `nav-item ${className}`)}
                    >
                        <Icon size={24}/>
                        <span>{label}</span>
                    </NavLink>
                ))}
            </ul>
        </nav>
    )
}

export default BottomNav

