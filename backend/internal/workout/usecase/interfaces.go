package usecase

import (
	"backend/internal/domain"
	"context"
)

type WorkoutRepository interface {
	Save(ctx context.Context, workout domain.Workout) error
	GetSessions(ctx context.Context, userID int64, limit, offset int) ([]domain.WorkoutSession, error)
	GetRecords(ctx context.Context, userID int64) ([]domain.Workout, error)
}
