import {useState} from 'react'
import {useQuery, useQueryClient} from '@tanstack/react-query'
import {createWorkout, getRecords, type WorkoutSet} from '../api/workouts'
import {toast} from '../components/Toast'

const Home = () => {
    const queryClient = useQueryClient()
    const {data: records = []} = useQuery<WorkoutSet[]>({
        queryKey: ['workout-records'],
        queryFn: getRecords,
        staleTime: 15_000
    })
    const [exercise, setExercise] = useState('')
    const [weight, setWeight] = useState('')
    const [reps, setReps] = useState('')
    const [loading, setLoading] = useState(false)
    const [selected, setSelected] = useState(false)

    const normalizedQuery = exercise.trim().toLowerCase()
    const suggestionPool = Array.from(new Set(records.map((r) => r.exercise)))
    const suggestions = !selected && normalizedQuery
        ? suggestionPool.filter((name) => name.toLowerCase().includes(normalizedQuery)).slice(0, 6)
        : []

    const renderSuggestion = (name: string) => {
        const lower = name.toLowerCase()
        const matchIndex = lower.indexOf(normalizedQuery)
        if (matchIndex === -1) return name

        const before = name.slice(0, matchIndex)
        const match = name.slice(matchIndex, matchIndex + normalizedQuery.length)
        const after = name.slice(matchIndex + normalizedQuery.length)

        return (
            <>
                {before}
                <span className="autocomplete__match">{match}</span>
                {after}
            </>
        )
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        if (!exercise.trim()) {
            return
        }

        setLoading(true)

        try {
            const error = await createWorkout({
                exercise: exercise.trim(),
                weight: Number(weight) || 0,
                reps: Number(reps) || 0
            })

            if (!error) {
                toast.success('Workout added!')
                setExercise('')
                setWeight('')
                setReps('')
                setSelected(false)
                void queryClient.resetQueries({queryKey: ['workout-history']})
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="page">
            <h1>Workout</h1>
            <div className="card">
                <form className="form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Exercise</label>
                        <input
                            type="text"
                            placeholder="Example: Bench Press"
                            value={exercise}
                            onChange={(event) => {
                                setExercise(event.target.value)
                                setSelected(false)
                            }}
                            required
                        />
                        {suggestions.length > 0 && (
                            <div className="autocomplete" role="listbox">
                                {suggestions.map((name) => (
                                    <button
                                        key={name}
                                        type="button"
                                        className="autocomplete__item"
                                        onClick={() => {
                                            setExercise(name)
                                            setSelected(true)
                                        }}
                                    >
                                        {renderSuggestion(name)}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="row">
                        <div className="input-group">
                            <label>Weight (kg)</label>
                            <input
                                type="number"
                                step="0.5"
                                placeholder="0"
                                value={weight}
                                onChange={(event) => setWeight(event.target.value)}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label>Reps</label>
                            <input
                                type="number"
                                placeholder="0"
                                value={reps}
                                onChange={(event) => setReps(event.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <button className="primary-btn" type="submit" disabled={loading}>
                        {loading ? 'Saving...' : 'Save'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Home