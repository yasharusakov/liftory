import {apiClient} from './client'

const getApiErrorMessage = (error: unknown, fallbackMessage: string): string => {
    if (error && typeof error === 'object' && 'response' in error) {
        const maybeResponse = (error as { response?: { data?: { error?: string } } }).response
        if (maybeResponse?.data?.error) {
            return maybeResponse.data.error
        }
    }

    if (error && typeof error === 'object' && 'message' in error) {
        return String((error as { message?: string }).message || fallbackMessage)
    }

    return fallbackMessage
}

export interface WorkoutExercise {
    id: number;
    exercise: string;
    weight: number;
    reps: number;
    logged_at: string;
}

export interface Session {
    date: string;
    workouts: WorkoutExercise[];
}

export interface WorkoutRecord {
    id: number;
    exercise: string;
    weight: number;
    reps: number;
    logged_at: string;
}

export interface CreateWorkoutPayload {
    user_id: number;
    exercise: string;
    weight: number;
    reps: number;
}

export async function createWorkout(payload: CreateWorkoutPayload): Promise<void> {
    try {
        await apiClient.post('/v1/workouts', payload)
    } catch (error: unknown) {
        const errorMsg = getApiErrorMessage(error, 'Failed to save workout')
        throw new Error(errorMsg)
    }
}

const normalizeArrayPayload = <T>(
    payload: unknown,
    fallbackMessage: string,
    possibleKeys: string[]
): T[] => {
    if (Array.isArray(payload)) {
        return payload as T[]
    }

    if (payload && typeof payload === 'object') {
        for (const key of possibleKeys) {
            const value = (payload as Record<string, unknown>)[key]
            if (Array.isArray(value)) {
                return value as T[]
            }
        }
    }

    throw new Error(fallbackMessage)
}

export async function getRecords(): Promise<WorkoutRecord[]> {
    try {
        const response = await apiClient.get('/v1/workouts/records')
        return normalizeArrayPayload<WorkoutRecord>(
            response.data,
            'Unexpected records response format',
            ['records', 'data', 'items']
        )
    } catch (error: unknown) {
        const errorMsg = getApiErrorMessage(error, 'Failed to fetch records')
        throw new Error(errorMsg)
    }
}

export async function getSessions(limit: number, offset: number): Promise<Session[]> {
    try {
        const response = await apiClient.get(`/v1/workouts/sessions?limit=${limit}&offset=${offset}`)
        return normalizeArrayPayload<Session>(
            response.data,
            'Unexpected history response format',
            ['sessions', 'data', 'items']
        )
    } catch (error: unknown) {
        const errorMsg = getApiErrorMessage(error, 'Failed to fetch history')
        throw new Error(errorMsg)
    }
}