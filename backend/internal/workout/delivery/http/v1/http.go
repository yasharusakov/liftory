package v1

import (
	"backend/internal/apperror"
	"backend/internal/middleware"
	"backend/internal/workout/usecase"
	"backend/pkg/helpers"
	"context"
	"encoding/json"
	"net/http"
	"strconv"
)

type WorkoutHandler struct {
	workoutUseCase *usecase.WorkoutUseCase
}

func (h *WorkoutHandler) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("POST /v1/workouts", h.Save)
	mux.HandleFunc("GET /v1/workouts/sessions", h.GetSessions)
	mux.HandleFunc("GET /v1/workouts/records", h.GetRecords)
}

func (h *WorkoutHandler) handleUserID(ctx context.Context, w http.ResponseWriter) (int64, bool) {
	userID, ok := ctx.Value(middleware.UserIDKey).(int64)
	if !ok {
		helpers.WriteError(w, "user ID not found in context", http.StatusUnauthorized)
		return 0, false
	}
	return userID, true
}

func (h *WorkoutHandler) Save(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID, ok := h.handleUserID(ctx, w)
	if !ok {
		return
	}

	var req SaveRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		helpers.WriteError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	err := h.workoutUseCase.Save(ctx, userID, req.Exercise, req.Weight, req.Reps)
	if err != nil {
		apperror.Handle(w, err)
		return
	}

	helpers.WriteJson(w, map[string]string{"message": "workout logged successfully"}, http.StatusCreated)
}

func (h *WorkoutHandler) GetSessions(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID, ok := h.handleUserID(ctx, w)
	if !ok {
		return
	}

	query := r.URL.Query()
	limit, _ := strconv.Atoi(query.Get("limit"))
	offset, _ := strconv.Atoi(query.Get("offset"))
	if limit == 0 {
		limit = 5
	}

	sessions, err := h.workoutUseCase.GetSessions(ctx, userID, limit, offset)
	if err != nil {
		apperror.Handle(w, err)
		return
	}

	helpers.WriteJson(w, sessions, http.StatusOK)
}

func (h *WorkoutHandler) GetRecords(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID, ok := h.handleUserID(ctx, w)
	if !ok {
		return
	}

	records, err := h.workoutUseCase.GetRecords(ctx, userID)
	if err != nil {
		apperror.Handle(w, err)
		return
	}

	helpers.WriteJson(w, records, http.StatusOK)
}

func NewWorkoutHandler(workoutUseCase *usecase.WorkoutUseCase) *WorkoutHandler {
	return &WorkoutHandler{
		workoutUseCase: workoutUseCase,
	}
}
