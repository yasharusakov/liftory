import {apiClient} from './client'

export interface Workout {
    id: number
    user_id: number
    exercise: string
    weight: number
    reps: string
    logged_at: string
}

export interface CreateWorkoutPayload {
    exercise: string
    weight: number
    reps: number
}

export interface Session {
    date: string
    workouts: Workout[]
}

export type GetRecordsResponse = Workout[]
export type GetSessionsResponse = Session[]

export async function createWorkout(payload: CreateWorkoutPayload): Promise<boolean> {
    try {
        await apiClient.post('/workouts', payload)
        return true
    } catch (error) {
        console.error(error)
        return false
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