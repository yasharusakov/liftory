package middleware

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"golang.org/x/time/rate"
)

func TestNewRateLimiter(t *testing.T) {
	rl := NewRateLimiter(rate.Every(time.Second), 10)

	assert.NotNil(t, rl)
	assert.Equal(t, rate.Every(time.Second), rl.rate)
	assert.Equal(t, 10, rl.burst)
	assert.NotNil(t, rl.visitors)
}

func TestGetLimiterReturnsSameInstanceForSameUser(t *testing.T) {
	rl := NewRateLimiter(rate.Every(time.Second), 2)

	l1 := rl.getLimiter(42)
	l2 := rl.getLimiter(42)

	assert.NotNil(t, l1)
	assert.NotNil(t, l2)
	assert.Same(t, l1, l2)
}

func TestMiddlewareRateLimitExceeded(t *testing.T) {
	rl := NewRateLimiter(rate.Every(time.Second), 10)

	for i := 0; i < 10; i++ {
		assert.True(t, rl.getLimiter(42).Allow())
	}

	assert.False(t, rl.getLimiter(42).Allow(), "Exceeded rate limit")
}

func TestMiddlewareAllowsWithinBurst(t *testing.T) {
	rl := NewRateLimiter(rate.Every(time.Second), 3)

	assert.True(t, rl.getLimiter(42).Allow())
	assert.True(t, rl.getLimiter(42).Allow())
	assert.True(t, rl.getLimiter(42).Allow())
}

func TestMiddlewareDifferentUsersHaveIndependentLimits(t *testing.T) {
	rl := NewRateLimiter(rate.Every(time.Second), 1)

	assert.True(t, rl.getLimiter(1).Allow())
	assert.False(t, rl.getLimiter(1).Allow())

	assert.True(t, rl.getLimiter(2).Allow())
	assert.False(t, rl.getLimiter(2).Allow())
}

func TestMiddlewareLimiterRefillsAfterInterval(t *testing.T) {
	rl := NewRateLimiter(rate.Every(50*time.Millisecond), 1)

	assert.True(t, rl.getLimiter(42).Allow())
	assert.False(t, rl.getLimiter(42).Allow())

	time.Sleep(70 * time.Millisecond)

	assert.True(t, rl.getLimiter(42).Allow(), "token should refill after interval")
}
