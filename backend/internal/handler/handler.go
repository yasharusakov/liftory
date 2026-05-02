package handler

import (
	"backend/internal/apperror"
	"backend/internal/middleware"
	"backend/internal/model"
	"backend/pkg/helpers"
	"context"
	"encoding/json"
	"net/http"
	"strconv"
)

type Service interface {
	Save(ctx context.Context, userID int64, exercise string, weight float64, reps int64) error
	GetSessions(ctx context.Context, userID int64, limit, offset int) ([]model.WorkoutSession, error)
	GetRecords(ctx context.Context, userID int64) ([]model.Workout, error)
}

type handler struct {
	service Service
}

func New(service Service) *handler {
	return &handler{service: service}
}

func (h *handler) getUserIDFromContext(r *http.Request) int64 {
	return r.Context().Value(middleware.UserIDKey).(int64)
}

func (h *handler) Save(w http.ResponseWriter, r *http.Request) {
	userID := h.getUserIDFromContext(r)

	var input struct {
		Exercise string  `json:"exercise"`
		Weight   float64 `json:"weight"`
		Reps     int64   `json:"reps"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		helpers.WriteError(w, "invalid request body", http.StatusBadRequest)
		return
	}

	err := h.service.Save(r.Context(), userID, input.Exercise, input.Weight, input.Reps)
	if err != nil {
		apperror.Handle(w, err)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func (h *handler) GetSessions(w http.ResponseWriter, r *http.Request) {
	userID := h.getUserIDFromContext(r)

	query := r.URL.Query()
	limit, _ := strconv.Atoi(query.Get("limit"))
	offset, _ := strconv.Atoi(query.Get("offset"))
	if limit == 0 {
		limit = 5
	}

	sessions, err := h.service.GetSessions(r.Context(), userID, limit, offset)
	if err != nil {
		apperror.Handle(w, err)
		return
	}

	helpers.WriteJson(w, sessions, http.StatusOK)
}

func (h *handler) GetRecords(w http.ResponseWriter, r *http.Request) {
	userID := h.getUserIDFromContext(r)

	records, err := h.service.GetRecords(r.Context(), userID)
	if err != nil {
		apperror.Handle(w, err)
		return
	}

	helpers.WriteJson(w, records, http.StatusOK)
}
