package middleware

import (
	"backend/pkg/helpers"
	"backend/pkg/logger"
	"net/http"
	"sync"
	"time"

	"golang.org/x/time/rate"
)

type RateLimiter struct {
	mu       sync.RWMutex
	visitors map[int64]*rate.Limiter
	rate     rate.Limit
	burst    int
}

func NewRateLimiter(r rate.Limit, burst int) *RateLimiter {
	rl := &RateLimiter{
		rate:     r,
		burst:    burst,
		visitors: make(map[int64]*rate.Limiter),
	}

	go rl.cleanup()

	return rl
}

func (rl *RateLimiter) cleanup() {
	for {
		time.Sleep(time.Minute)
		rl.mu.Lock()

		cleaned := 0

		for id, limiter := range rl.visitors {
			if limiter.Tokens() == float64(rl.burst) {
				delete(rl.visitors, id)
				cleaned++
			}
		}
		rl.mu.Unlock()

		if cleaned > 0 {
			logger.Log.Debug().
				Int("cleaned", cleaned).
				Msg("rate limiter cleanup")
		}
	}
}

func (rl *RateLimiter) getLimiter(userID int64) *rate.Limiter {
	rl.mu.RLock()

	if limiter, ok := rl.visitors[userID]; ok {
		rl.mu.RUnlock()
		return limiter
	}
	rl.mu.RUnlock()

	rl.mu.Lock()
	defer rl.mu.Unlock()
	limiter := rate.NewLimiter(rl.rate, rl.burst)
	rl.visitors[userID] = limiter
	return limiter
}

func (rl *RateLimiter) Middleware() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			userID, ok := r.Context().Value(UserIDKey).(int64)
			if !ok {
				helpers.WriteError(w, "unauthorized", http.StatusUnauthorized)
				return
			}

			if !rl.getLimiter(userID).Allow() {
				logger.Log.Warn().
					Int64("user_id", userID).
					Str("path", r.URL.Path).
					Msg("rate limit exceeded")
				helpers.WriteError(w, "too many requests", http.StatusTooManyRequests)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
