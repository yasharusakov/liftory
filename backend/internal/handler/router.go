package handler

import "net/http"

func (h *handler) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("POST /workouts", h.Save)
	mux.HandleFunc("GET /workouts/sessions", h.GetSessions)
	mux.HandleFunc("GET /workouts/records", h.GetRecords)
}
