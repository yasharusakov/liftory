package domain

import (
	"errors"
	"time"
)

type WorkoutSet struct {
	ID       int64     `json:"id"`
	UserID   int64     `json:"user_id"`
	Exercise string    `json:"exercise"`
	Weight   float64   `json:"weight"`
	Reps     int64     `json:"reps"`
	LoggedAt time.Time `json:"logged_at"`
}

type WorkoutLog struct {
	Date        time.Time    `json:"date"`
	WorkoutSets []WorkoutSet `json:"workout_sets"`
}

var (
	ErrInvalidExerciseName = errors.New("invalid exercise name")
	ErrInvalidWeight       = errors.New("weight must be greater than zero")
	ErrInvalidReps         = errors.New("reps must be greater than zero")
	ErrWorkoutNotFound     = errors.New("workout not found")
)

func NewWorkoutSet(userID int64, exercise string, weight float64, reps int64) (WorkoutSet, error) {
	if exercise == "" {
		return WorkoutSet{}, ErrInvalidExerciseName
	}
	if weight < 0.0 {
		return WorkoutSet{}, ErrInvalidWeight
	}
	if reps <= 0 {
		return WorkoutSet{}, ErrInvalidReps
	}

	return WorkoutSet{
		UserID:   userID,
		Exercise: exercise,
		Weight:   weight,
		Reps:     reps,
		LoggedAt: time.Now().UTC(),
	}, nil
}
