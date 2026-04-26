import {useMemo, useState} from 'react'
import {useQuery} from '@tanstack/react-query'
import {createWorkout, getRecords} from '../api/workouts.ts'
import {workoutQueryKeys} from '../api/queryKeys.ts'
import {useToast} from '../contexts/ToastContext'
import {normalizeExerciseInput, resolveCanonicalExerciseName} from '../utils/exerciseName'

const Home = () => {
    const [exercise, setExercise] = useState('')
    const [weight, setWeight] = useState('')
    const [reps, setReps] = useState('')
    const [loading, setLoading] = useState(false)
    const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false)

    const {showToast} = useToast()
    const {data: records} = useQuery({
        queryKey: workoutQueryKeys.records,
        queryFn: getRecords,
        staleTime: 15 * 1000
    })

    const recordsList = Array.isArray(records) ? records : []

    const tg = window.Telegram?.WebApp
    const normalizedExercise = normalizeExerciseInput(exercise)

    const knownNamesByNormalized = useMemo(() => {
        const dictionary = new Map<string, string>()

        recordsList.forEach((record) => {
            const normalizedName = normalizeExerciseInput(record.exercise)
            if (normalizedName && !dictionary.has(normalizedName)) {
                dictionary.set(normalizedName, record.exercise)
            }
        })

        return dictionary
    }, [recordsList])

    const suggestions = useMemo(() => {
        if (!normalizedExercise) {
            return []
        }

        const entries = Array.from(knownNamesByNormalized.entries())

        return entries
            .filter(([normalizedName]) => normalizedName.includes(normalizedExercise))
            .sort(([left], [right]) => {
                const leftStartsWith = left.startsWith(normalizedExercise) ? 0 : 1
                const rightStartsWith = right.startsWith(normalizedExercise) ? 0 : 1
                if (leftStartsWith !== rightStartsWith) {
                    return leftStartsWith - rightStartsWith
                }
                return left.localeCompare(right)
            })
            .slice(0, 6)
            .map(([, displayName]) => displayName)
    }, [knownNamesByNormalized, normalizedExercise])

    const applyCanonicalExerciseName = () => {
        const canonicalName = resolveCanonicalExerciseName(exercise, knownNamesByNormalized)
        setExercise(canonicalName)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const userId = tg?.initDataUnsafe?.user?.id || 123456789 // Заглушка для ПК
        const canonicalExercise = resolveCanonicalExerciseName(exercise, knownNamesByNormalized)

        if (!canonicalExercise) {
            setLoading(false)
            showToast('Please enter an exercise name', 'error')
            return
        }

        try {
            await createWorkout({
                user_id: userId,
                exercise: canonicalExercise,
                weight: parseFloat(weight) || 0,
                reps: parseInt(reps, 10) || 0
            })

            showToast('Workout saved successfully!', 'success')
            setExercise('')
            setWeight('')
            setReps('')

            tg?.HapticFeedback?.notificationOccurred('success')
        } catch (error: any) {
            const serverError = error.response?.data?.error
            const errorMessage = serverError || error.message || 'Failed to save workout.'

            showToast(errorMessage, 'error')
            tg?.HapticFeedback?.notificationOccurred('error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="page fade-in">
            <h1>New Workout</h1>
            <div className="card">
                <form className="workout-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Exercise</label>
                        <input
                            type="text"
                            placeholder="e.g., Bench Press"
                            value={exercise}
                            onChange={(e) => {
                                setExercise(e.target.value)
                                setIsAutocompleteOpen(true)
                            }}
                            onFocus={() => setIsAutocompleteOpen(true)}
                            onBlur={() => {
                                setTimeout(() => {
                                    applyCanonicalExerciseName()
                                    setIsAutocompleteOpen(false)
                                }, 120)
                            }}
                            required
                        />
                        {isAutocompleteOpen && suggestions.length > 0 && (
                            <div className="autocomplete-list" role="listbox" aria-label="Exercise suggestions">
                                {suggestions.map((suggestion) => {
                                    const highlightIndex = suggestion.toLowerCase().indexOf(normalizedExercise)
                                    const hasHighlight = highlightIndex >= 0 && normalizedExercise.length > 0

                                    return (
                                        <button
                                            key={suggestion}
                                            type="button"
                                            className="autocomplete-item"
                                            onMouseDown={(event) => {
                                                event.preventDefault()
                                                setExercise(suggestion)
                                                setIsAutocompleteOpen(false)
                                            }}
                                        >
                                            {hasHighlight ? (
                                                <>
                                                    {suggestion.slice(0, highlightIndex)}
                                                    <span className="autocomplete-highlight">
                                                        {suggestion.slice(highlightIndex, highlightIndex + normalizedExercise.length)}
                                                    </span>
                                                    {suggestion.slice(highlightIndex + normalizedExercise.length)}
                                                </>
                                            ) : (
                                                suggestion
                                            )}
                                        </button>
                                    )
                                })}
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
                                onChange={(e) => setWeight(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label>Reps</label>
                            <input
                                type="number"
                                placeholder="0"
                                value={reps}
                                onChange={(e) => setReps(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="primary-btn"
                        disabled={loading || !normalizedExercise || !weight || !reps}
                    >
                        {loading ? 'Saving...' : 'Save Set'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Home
