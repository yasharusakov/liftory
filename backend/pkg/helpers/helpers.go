package helpers

import (
	"backend/pkg/logger"
	"encoding/json"
	"net/http"
)

func WriteJson(w http.ResponseWriter, data any, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(data); err != nil {
		logger.Log.Error().Err(err).Msg("failed to encode response")
	}
}

func WriteError(w http.ResponseWriter, msg string, status int) {
	WriteJson(w, map[string]string{"error": msg}, status)
}
