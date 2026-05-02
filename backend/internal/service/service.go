package service

import (
	"backend/internal/model"
	"backend/pkg/logger"
	"context"
)

type Repository interface {
	Save(ctx context.Context, workout model.Workout) error
	GetSessions(ctx context.Context, userID int64, limit, offset int) ([]model.WorkoutSession, error)
	GetRecords(ctx context.Context, userID int64) ([]model.Workout, error)
}

type service struct {
	repo Repository
}

func New(repo Repository) *service {
	return &service{
		repo: repo,
	}
}

func (s *service) Save(ctx context.Context, userID int64, exercise string, weight float64, reps int64) error {
	workout, err := model.NewWorkout(userID, exercise, weight, reps)
	if err != nil {
		return err
	}

	err = s.repo.Save(ctx, workout)
	if err != nil {
		logger.Log.Error().
			Err(err).
			Int64("user_id", userID).
			Str("exercise", exercise).
			Msg("failed to save workout")
		return err
	}

	logger.Log.Info().
		Int64("user_id", userID).
		Str("exercise", exercise).
		Float64("weight", weight).
		Int64("reps", reps).
		Msg("workout saved")

	return nil
}

func (s *service) GetSessions(ctx context.Context, userID int64, limit, offset int) ([]model.WorkoutSession, error) {
	sessions, err := s.repo.GetSessions(ctx, userID, limit, offset)
	if err != nil {
		logger.Log.Error().
			Err(err).
			Int64("user_id", userID).
			Int("limit", limit).
			Int("offset", offset).
			Msg("failed to get sessions")
		return nil, err
	}

	logger.Log.Debug().
		Int64("user_id", userID).
		Int("count", len(sessions)).
		Msg("sessions fetched")

	return sessions, nil
}

func (s *service) GetRecords(ctx context.Context, userID int64) ([]model.Workout, error) {
	records, err := s.repo.GetRecords(ctx, userID)
	if err != nil {
		logger.Log.Error().
			Err(err).
			Int64("user_id", userID).
			Msg("failed to get records")
		return nil, err
	}

	logger.Log.Debug().
		Int64("user_id", userID).
		Int("count", len(records)).
		Msg("records fetched")

	return records, nil
}
