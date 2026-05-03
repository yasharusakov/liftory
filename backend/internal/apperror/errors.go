package apperror

import (
	"backend/internal/domain"
	"backend/pkg/helpers"
	"backend/pkg/logger"
	"errors"
	"net/http"
)

func Handle(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, domain.ErrWorkoutNotFound):
		helpers.WriteError(w, "workout not found", http.StatusNotFound)
	case errors.Is(err, domain.ErrInvalidExerciseName):
		helpers.WriteError(w, "exercise name cannot be empty", http.StatusBadRequest)
	case errors.Is(err, domain.ErrInvalidWeight):
		helpers.WriteError(w, "weight cannot be less than 0", http.StatusBadRequest)
	case errors.Is(err, domain.ErrInvalidReps):
		helpers.WriteError(w, "reps must be greater than zero", http.StatusBadRequest)
	default:
		logger.Log.Error().Err(err).Msg("unhandled error")
		helpers.WriteError(w, "internal server error", http.StatusInternalServerError)
	}
}
