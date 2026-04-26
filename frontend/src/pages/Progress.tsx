import {Construction} from 'lucide-react'

const Progress = () => {
    return (
        <div className="page fade-in">
            <h1>Progress</h1>
            <div className="card">
                <p className="empty-state">
                    <Construction size={16} style={{verticalAlign: 'text-bottom', marginRight: 6}}/>
                    This tab is in development.
                </p>
            </div>
        </div>
    )
}

export default Progress

