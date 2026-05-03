import {useQuery} from '@tanstack/react-query'
import {getRecords, type WorkoutSet} from '../api/workouts'

const formatDateTime = (value: string) => new Date(value).toLocaleString(undefined, {
    dateStyle: 'long',
    timeStyle: 'short',
    hour12: false
})

const Records = () => {
    const {data: records = [], isLoading} = useQuery<WorkoutSet[]>({
        queryKey: ['workout-records'],
        queryFn: getRecords,
        staleTime: 15_000
    })

    return (
        <div className="page">
            <h1>Records</h1>

            {isLoading && <div className="card muted">Loading...</div>}

            {!isLoading && records.length === 0 && (
                <div className="card empty-state">No records yet</div>
            )}

            <div className="stack">
                {records.map((record) => (
                    <div key={record.id} className="card record">
                        <div className="record-header">
                            <div className="record-title">{record.exercise}</div>
                            <div className="badge badge--accent">PR</div>
                        </div>
                        <div className="record-body">
                            <div className="record-value">
                                {record.weight > 0
                                    ? `${record.weight} kg × ${record.reps}`
                                    : `${record.reps} reps`}
                            </div>
                            <div className="muted">{formatDateTime(record.logged_at)}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Records
