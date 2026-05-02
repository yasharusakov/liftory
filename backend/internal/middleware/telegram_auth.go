package middleware

import (
	"backend/pkg/logger"
	"context"
	"net/http"
	"strings"
	"time"

	"backend/pkg/helpers"

	initdata "github.com/telegram-mini-apps/init-data-golang"
)

type contextKey string

const UserIDKey contextKey = "user_id"

func Auth(botToken string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			rawAuth := r.Header.Get("Authorization")

			if rawAuth == "" || !strings.HasPrefix(rawAuth, "tma ") {
				logger.Log.Warn().
					Str("path", r.URL.Path).
					Msg("missing or invalid authorization header")
				helpers.WriteError(w, "missing or invalid authorization header", http.StatusUnauthorized)
				return
			}

			raw := strings.TrimPrefix(rawAuth, "tma ")

			if err := initdata.Validate(raw, botToken, 24*time.Hour); err != nil {
				logger.Log.Warn().
					Err(err).
					Str("path", r.URL.Path).
					Msg("invalid telegram init data")
				helpers.WriteError(w, "unauthorized", http.StatusUnauthorized)
				return
			}

			data, err := initdata.Parse(raw)
			if err != nil {
				logger.Log.Error().
					Err(err).
					Msg("failed to parse init data after validation")
				helpers.WriteError(w, "failed to parse init data", http.StatusBadRequest)
				return
			}

			if data.User.ID == 0 || data.User == (initdata.User{}) {
				logger.Log.Warn().
					Str("path", r.URL.Path).
					Msg("user data missing in init data")
				helpers.WriteError(w, "user data missing", http.StatusUnauthorized)
				return
			}

			logger.Log.Debug().
				Int64("user_id", data.User.ID).
				Str("path", r.URL.Path).
				Msg("user authorized")

			ctx := context.WithValue(r.Context(), UserIDKey, data.User.ID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
