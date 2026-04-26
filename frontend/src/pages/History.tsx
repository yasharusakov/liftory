import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {Calendar, Dumbbell} from 'lucide-react'
import {getSessions, type Session, type WorkoutExercise} from '../api/workouts.ts'
import {EmptyState, LoadingSkeleton} from '../components/PageState'
import {formatLocalTime, formatSessionDate} from '../utils/formatters'

interface ExerciseGroup {
    exercise: string;
    sets: WorkoutExercise[];
}

const PAGE_LIMIT = 5

const groupWorkoutsByExercise = (workouts: WorkoutExercise[]): ExerciseGroup[] => {
    const map = new Map<string, WorkoutExercise[]>()
    for (const item of workouts) {
        const exerciseName = typeof item.exercise === 'string' ? item.exercise : 'Unknown exercise'
        const current = map.get(exerciseName)
        if (current) current.push(item)
        else map.set(exerciseName, [item])
    }
    return Array.from(map.entries()).map(([exercise, sets]) => ({exercise, sets}))
}

const History = () => {
    const [sessions, setSessions] = useState<Session[]>([])
    const [loading, setLoading] = useState(false)
    const [hasMore, setHasMore] = useState(true)

    const offsetRef = useRef(0)
    const isFetching = useRef(false)
    const observer = useRef<IntersectionObserver | null>(null)
    const releaseFetchTimeoutRef = useRef<number | null>(null)

    const loadMore = useCallback(async () => {
        if (isFetching.current || !hasMore) return

        isFetching.current = true
        setLoading(true)

        try {
            const currentOffset = offsetRef.current
            const fetchedSessions = await getSessions(PAGE_LIMIT, currentOffset)
            const newSessions = Array.isArray(fetchedSessions) ? fetchedSessions : []

            if (newSessions.length === 0) {
                setHasMore(false)
                return
            }

            setSessions((prev) => {
                const existingDates = new Set(prev.map(s => s.date))
                const uniqueNew = newSessions.filter(s => !existingDates.has(s.date))
                return [...prev, ...uniqueNew]
            })

            offsetRef.current += PAGE_LIMIT

            if (newSessions.length < PAGE_LIMIT) {
                setHasMore(false)
            }
        } catch (err) {
            console.error('Failed to load history:', err)
        } finally {
            setLoading(false)
            if (releaseFetchTimeoutRef.current) {
                window.clearTimeout(releaseFetchTimeoutRef.current)
            }
            releaseFetchTimeoutRef.current = window.setTimeout(() => {
                isFetching.current = false
            }, 200)
        }
    }, [hasMore])

    useEffect(() => {
        loadMore()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        return () => {
            if (observer.current) {
                observer.current.disconnect()
            }
            if (releaseFetchTimeoutRef.current) {
                window.clearTimeout(releaseFetchTimeoutRef.current)
            }
        }
    }, [])

    const lastElementRef = useCallback((node: HTMLDivElement) => {
        if (loading) return
        if (observer.current) observer.current.disconnect()

        observer.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore && !isFetching.current) {
                loadMore()
            }
        }, {threshold: 0.1})

        if (node) observer.current.observe(node)
    }, [loading, hasMore, loadMore])

    const sessionsWithGroups = useMemo(() => {
        return sessions.map((session) => {
            const safeWorkouts = Array.isArray(session.workouts) ? session.workouts : []
            return {
                ...session,
                exerciseGroups: groupWorkoutsByExercise(safeWorkouts)
            }
        })
    }, [sessions])

    return (
        <div className="page fade-in">
            <h1>Workout History</h1>

            {sessions.length === 0 && loading && (
                <LoadingSkeleton cards={2}/>
            )}

            {sessions.length === 0 && !loading ? (
                <EmptyState message="No workouts recorded yet. Start training! 🏋️‍♂️"/>
            ) : sessionsWithGroups.length > 0 ? (
                <div className="history-list">
                    {sessionsWithGroups.map((session, index) => {
                        const isLast = index === sessionsWithGroups.length - 1

                        return (
                            <div
                                key={session.date}
                                className="card session-card"
                                ref={isLast ? lastElementRef : null}
                            >
                                <div className="session-header">
                                    <Calendar size={18} className="text-accent"/>
                                    <h3>{formatSessionDate(session.date)}</h3>
                                </div>

                                <div className="session-body">
                                    {session.exerciseGroups.map((group) => (
                                        <div key={group.exercise} className="exercise-group">
                                            <div className="exercise-name">
                                                <Dumbbell size={16}/> {group.exercise}
                                            </div>

                                            <div className="sets-list">
                                                {group.sets.map((set, setIdx) => (
                                                    <div key={set.id} className="set-row">
                                                        <span className="set-number">{setIdx + 1}</span>
                                                        <span className="set-details">
                                                            {set.weight} kg × {set.reps}
                                                        </span>
                                                        <span
                                                            className="set-time">{formatLocalTime(set.logged_at)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : null}

            {loading && <div className="loading-spinner">Loading more history... ⏳</div>}
            {!hasMore && sessions.length > 0 && (
                <div className="end-of-list">That's all your hard work! ✅</div>
            )}
        </div>
    )
}

export default History