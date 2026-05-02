package handler

import "net/http"

// Для тестов или если будет больше одного домена, щас это будет избыточно
//type WorkoutHandler interface {
//	Save(w http.ResponseWriter, r *http.Request)
//	GetSessions(w http.ResponseWriter, r *http.Request)
//	GetRecords(w http.ResponseWriter, r *http.Request)
//}

func (h *handler) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("POST /workouts", h.Save)
	mux.HandleFunc("GET /workouts/sessions", h.GetSessions)
	mux.HandleFunc("GET /workouts/records", h.GetRecords)
}
