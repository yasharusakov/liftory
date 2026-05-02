package model

import (
	"errors"
	"time"
)

type Workout struct {
	ID       int64     `json:"id"`
	UserID   int64     `json:"user_id"`
	Exercise string    `json:"exercise"`
	Weight   float64   `json:"weight"`
	Reps     int64     `json:"reps"`
	LoggedAt time.Time `json:"logged_at"`
}

type WorkoutSession struct {
	Date     time.Time `json:"date"`
	Workouts []Workout `json:"workouts"`
}

var (
	ErrInvalidExerciseName = errors.New("invalid exercise name")
	ErrInvalidWeight       = errors.New("weight must be greater than zero")
	ErrInvalidReps         = errors.New("reps must be greater than zero")
	ErrWorkoutNotFound     = errors.New("workout not found")
)

func NewWorkout(userID int64, exercise string, weight float64, reps int64) (Workout, error) {
	if exercise == "" {
		return Workout{}, ErrInvalidExerciseName
	}
	if weight < 0.0 {
		return Workout{}, ErrInvalidWeight
	}
	if reps <= 0 {
		return Workout{}, ErrInvalidReps
	}

	return Workout{
		UserID:   userID,
		Exercise: exercise,
		Weight:   weight,
		Reps:     reps,
		LoggedAt: time.Now().UTC(),
	}, nil
}
