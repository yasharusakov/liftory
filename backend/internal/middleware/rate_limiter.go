package middleware

import (
	"backend/pkg/helpers"
	"backend/pkg/logger"
	"net/http"
	"sync"
	"time"

	"golang.org/x/time/rate"
)

type Visitor struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

type RateLimiter struct {
	mu       sync.Mutex
	visitors map[int64]*Visitor
	rate     rate.Limit
	burst    int
	done     chan struct{}
}

func NewRateLimiter(r rate.Limit, burst int) *RateLimiter {
	rl := &RateLimiter{
		rate:     r,
		burst:    burst,
		visitors: make(map[int64]*Visitor),
		done:     make(chan struct{}),
	}

	go rl.cleanup()

	return rl
}

func (rl *RateLimiter) Close() {
	close(rl.done)
}

func (rl *RateLimiter) cleanup() {
	ticker := time.NewTicker(time.Minute)
	defer ticker.Stop()

	for {
		select {
		case <-ticker.C:
			rl.mu.Lock()
			cleaned := 0

			for id, visitor := range rl.visitors {
				if time.Since(visitor.lastSeen) > 10*time.Minute {
					delete(rl.visitors, id)
					cleaned++
				}
			}
			rl.mu.Unlock()

			if cleaned > 0 {
				logger.Log.Debug().Int("visitors_cleaned", cleaned).Msg("rate limiter cleanup")
			}
		case <-rl.done:
			return
		}
	}
}

func (rl *RateLimiter) getLimiter(userID int64) *rate.Limiter {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	if visitor, ok := rl.visitors[userID]; ok {
		visitor.lastSeen = time.Now()
		return visitor.limiter
	}

	limiter := rate.NewLimiter(rl.rate, rl.burst)
	rl.visitors[userID] = &Visitor{
		limiter:  limiter,
		lastSeen: time.Now(),
	}
	return limiter
}

func (rl *RateLimiter) Allow(userID int64) bool {
	return rl.getLimiter(userID).Allow()
}

func (rl *RateLimiter) Middleware() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			userID, ok := r.Context().Value(UserIDKey).(int64)
			if !ok {
				helpers.WriteError(w, "unauthorized", http.StatusUnauthorized)
				return
			}

			if !rl.Allow(userID) {
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
