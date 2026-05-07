import axios from 'axios'
import {apiClient} from './client'

export interface WorkoutSet {
    id: number
    user_id: number
    exercise: string
    weight: number
    reps: number
    logged_at: string
}

export interface CreateWorkoutSetPayload {
    exercise: string
    weight: number
    reps: number
}

export interface Session {
    date: string
    workout_sets: WorkoutSet[]
}

export type GetRecordsResponse = WorkoutSet[]
export type GetSessionsResponse = Session[]

export async function createWorkout(payload: CreateWorkoutSetPayload): Promise<string | null> {
    try {
        await apiClient.post('/workouts', payload)
        return null
    } catch (error) {
        if (axios.isAxiosError(error)) {
            const message = typeof error.response?.data?.error === 'string'
                ? error.response?.data?.error
                : error.message
            return message
        }

        return 'Unexpected error'
    }
}

export async function getRecords(): Promise<GetRecordsResponse> {
    try {
        const response = await apiClient.get<GetRecordsResponse>('/workouts/records')
        return response.data
    } catch (error) {
        console.error(error)
        return []
    }
}

export async function getSessions(limit: number, offset: number): Promise<GetSessionsResponse> {
    try {
        const response = await apiClient.get<GetSessionsResponse>('/workouts/sessions', {params: {limit, offset}})
        return response.data
    } catch (error) {
        console.error(error)
        return []
    }
}