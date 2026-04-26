package domain

import "testing"

import (
	"errors"
	"time"
)

func TestNewWorkout(t *testing.T) {
	t.Run("returns error for empty exercise", func(t *testing.T) {
		_, err := NewWorkout(1, "", 10, 5)
		if !errors.Is(err, ErrInvalidExerciseName) {
			t.Fatalf("expected ErrInvalidExerciseName, got %v", err)
		}
	})

	t.Run("returns error for negative weight", func(t *testing.T) {
		_, err := NewWorkout(1, "bench press", -10, 5)
		if !errors.Is(err, ErrInvalidWeight) {
			t.Fatalf("expected ErrInvalidWeight, got %v", err)
		}
	})

	t.Run("returns error for non-positive reps", func(t *testing.T) {
		_, err := NewWorkout(1, "bench press", 10, 0)
		if !errors.Is(err, ErrInvalidReps) {
			t.Fatalf("expected ErrInvalidReps, got %v", err)
		}
	})

	t.Run("creates workout for valid input", func(t *testing.T) {
		got, err := NewWorkout(42, "squat", 100, 5)
		if err != nil {
			t.Fatalf("expected nil error, got %v", err)
		}

		if got.UserID != 42 {
			t.Fatalf("expected UserID=42, got %d", got.UserID)
		}
		if got.Exercise != "squat" {
			t.Fatalf("expected Exercise=squat, got %s", got.Exercise)
		}
		if got.Weight != 100 {
			t.Fatalf("expected Weight=100, got %v", got.Weight)
		}
		if got.Reps != 5 {
			t.Fatalf("expected Reps=5, got %d", got.Reps)
		}
		if got.LoggedAt.IsZero() {
			t.Fatal("expected non-zero LoggedAt")
		}
		if got.LoggedAt.Location() != time.UTC {
			t.Fatalf("expected LoggedAt in UTC, got %v", got.LoggedAt.Location())
		}
	})
}
