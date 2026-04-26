package middleware

import (
	"backend/config"
	"net/http"

	"github.com/rs/cors"
)

func Cors(next http.Handler) http.Handler {
	app := config.GetApp()

	headers := []string{
		"Authorization",
		"Content-Type",
	}

	additionalHeaders := []string{
		"Bypass-Tunnel-Reminder",
		"ngrok-skip-browser-warning",
	}

	if app.Env == "development" {
		headers = append(headers, additionalHeaders...)
	}

	c := cors.New(cors.Options{
		AllowedOrigins:   app.AllowedOrigins,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   headers,
		AllowCredentials: true,
	})

	return c.Handler(next)
}
