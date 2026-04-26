import {Calendar, Trophy} from 'lucide-react'
import {getRecords} from '../api/workouts.ts'
import {useQuery} from '@tanstack/react-query'
import {workoutQueryKeys} from '../api/queryKeys.ts'
import {EmptyState, ErrorState, LoadingSkeleton} from '../components/PageState'
import {formatRecordDateTime} from '../utils/formatters'

const Records = () => {
    const {data: records, isPending, error} = useQuery({
        queryKey: workoutQueryKeys.records,
        queryFn: getRecords,
        staleTime: 10 * 1000,
    })

    const recordsList = Array.isArray(records) ? records : []

    if (isPending) {
        return (
            <div className="page fade-in">
                <h1>Personal Records</h1>
                <LoadingSkeleton cards={2}/>
            </div>
        )
    }
    if (error) {
        return (
            <div className="page fade-in">
                <h1>Personal Records</h1>
                <ErrorState/>
            </div>
        )
    }

    return (
        <div className="page fade-in">
            <h1>Personal Records</h1>

            {recordsList.length === 0 ? (
                <EmptyState message="No records yet."/>
            ) : (
                <div className="records-list">
                    {recordsList.map((record) => (
                        <div key={record?.id} className="card record-card">
                            <div className="record-header">
                                <h3>{record?.exercise}</h3>
                                <Trophy size={20} className="text-accent"/>
                            </div>
                            <div className="record-stats">
                                <div className="stat">
                                    <span className="stat-value">{record?.weight} kg</span>
                                    <span className="stat-label">
										for {record?.reps} {record?.reps === 1 ? 'rep' : 'reps'}
									</span>
                                </div>
                                <div className="stat-date">
                                    <Calendar size={14}/>
                                    <span>{formatRecordDateTime(record?.logged_at)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Records
