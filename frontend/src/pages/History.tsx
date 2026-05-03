import {type InfiniteData, useInfiniteQuery} from '@tanstack/react-query'
import {useEffect, useRef} from 'react'
import {getSessions, type Session, type WorkoutSet} from '../api/workouts'

const PAGE_LIMIT = 5

interface ExerciseGroup {
    exercise: string
    sets: WorkoutSet[]
}

const groupByExercise = (workouts: WorkoutSet[]): ExerciseGroup[] => {
    const map = new Map<string, WorkoutSet[]>()
    workouts.forEach((item) => {
        const list = map.get(item.exercise) ?? []
        list.push(item)
        map.set(item.exercise, list)
    })
    return Array.from(map.entries()).map(([exercise, sets]) => ({exercise, sets}))
}

const formatDate = (value: string) =>
    new Date(value).toLocaleDateString([], {dateStyle: 'full'})

const formatTime = (value: string) =>
    new Date(value).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', hour12: false})

const History = () => {
    const {data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage} = useInfiniteQuery<
        Session[],
        Error,
        InfiniteData<Session[]>,
        string[],
        number
    >({
        queryKey: ['workout-history'],
        queryFn: ({pageParam}: { pageParam: number }) => getSessions(PAGE_LIMIT, pageParam),
        initialPageParam: 0,
        getNextPageParam: (lastPage: Session[], pages: Session[][]) =>
            lastPage.length < PAGE_LIMIT ? undefined : pages.length * PAGE_LIMIT,
        staleTime: 30_000,
        refetchOnWindowFocus: false
    })

    const canLoadMoreRef = useRef(false)
    useEffect(() => {
        canLoadMoreRef.current = !!hasNextPage && !isFetchingNextPage
    }, [hasNextPage, isFetchingNextPage])

    const sentinelRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const node = sentinelRef.current
        if (!node) return
        const observer = new IntersectionObserver(
            ([entry]: IntersectionObserverEntry[]) => {
                if (entry.isIntersecting && canLoadMoreRef.current) fetchNextPage()
            },
            {rootMargin: '120px'}
        )
        observer.observe(node)
        return () => observer.disconnect()
    }, [fetchNextPage])

    const sessions = data?.pages.flat() ?? []

    return (
        <div className="page">
            <h1>History</h1>

            {!isLoading && sessions.length === 0 && (
                <div className="card empty-state">Not found</div>
            )}

            <div className="stack">
                {sessions.map((session: Session) => {
                    const groups = groupByExercise(session.workoutSets)
                    return (
                        <div key={session.date} className="card">
                            <div className="card-title">{formatDate(session.date)}</div>
                            <div className="session-list">
                                {groups.map((group: ExerciseGroup) => (
                                    <div key={group.exercise} className="session-group">
                                        <div className="session-exercise">{group.exercise}</div>
                                        {group.sets.map((set: WorkoutSet, index: number) => (
                                            <div key={set.id} className="session-set">
                                                <span className="badge">{group.sets.length - index}</span>
                                                <span>
                                                    {set.weight > 0
                                                        ? `${set.weight} kg × ${set.reps}`
                                                        : `${set.reps} reps`}
                                                </span>
                                                <span className="muted">{formatTime(set.logged_at)}</span>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>

            <div ref={sentinelRef}/>

            {(isLoading || isFetchingNextPage) && (
                <div className="card muted">Loading...</div>
            )}
        </div>
    )
}

export default History