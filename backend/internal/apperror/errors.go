package apperror

import (
	"backend/internal/model"
	"backend/pkg/helpers"
	"backend/pkg/logger"
	"errors"
	"net/http"
)

func Handle(w http.ResponseWriter, err error) {
	switch {
	case errors.Is(err, model.ErrWorkoutNotFound):
		helpers.WriteError(w, "workout not found", http.StatusNotFound)
	case errors.Is(err, model.ErrInvalidExerciseName):
		helpers.WriteError(w, "exercise name cannot be empty", http.StatusBadRequest)
	case errors.Is(err, model.ErrInvalidWeight):
		helpers.WriteError(w, "weight cannot be less than 0", http.StatusBadRequest)
	case errors.Is(err, model.ErrInvalidReps):
		helpers.WriteError(w, "reps must be greater than zero", http.StatusBadRequest)
	default:
		logger.Log.Error().Err(err).Msg("unhandled error")
		helpers.WriteError(w, "internal server error", http.StatusInternalServerError)
	}
}
