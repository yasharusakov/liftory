package repository

import (
	"backend/internal/domain"
	"context"
	"encoding/json"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type repo struct {
	pool *pgxpool.Pool
}

func New(pool *pgxpool.Pool) *repo {
	return &repo{pool: pool}
}

func (s *repo) Save(ctx context.Context, workout domain.WorkoutSet) error {
	_, err := s.pool.Exec(ctx, `
        INSERT INTO workout_logs (user_id, exercise, weight, reps, logged_at)
        VALUES ($1, $2, $3, $4, $5)
    `, workout.UserID, workout.Exercise, workout.Weight, workout.Reps, workout.LoggedAt)
	if err != nil {
		return fmt.Errorf("postgres save workout: %w", err)
	}
	return nil
}

func (s *repo) GetRecords(ctx context.Context, userID int64) ([]domain.WorkoutSet, error) {
	rows, err := s.pool.Query(ctx, `
       SELECT id, exercise, weight, reps, logged_at
       FROM (
           SELECT DISTINCT ON (exercise) id, exercise, weight, reps, logged_at
           FROM workout_logs
           WHERE user_id = $1
           ORDER BY exercise, weight DESC, reps DESC, logged_at DESC
       ) AS subquery
       ORDER BY logged_at DESC
    `, userID)
	if err != nil {
		return nil, fmt.Errorf("postgres get records: %w", err)
	}
	defer rows.Close()

	records := make([]domain.WorkoutSet, 0)
	for rows.Next() {
		var w domain.WorkoutSet
		if err := rows.Scan(&w.ID, &w.Exercise, &w.Weight, &w.Reps, &w.LoggedAt); err != nil {
			return nil, fmt.Errorf("postgres scan record: %w", err)
		}
		records = append(records, w)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("postgres rows error: %w", err)
	}
	return records, nil
}

func (s *repo) GetSessions(ctx context.Context, userID int64, limit, offset int) ([]domain.WorkoutLog, error) {
	rows, err := s.pool.Query(ctx, `
        SELECT (logged_at AT TIME ZONE 'UTC')::date as day,
             json_agg(json_build_object(
                         'id', id,
                         'exercise', exercise,
                         'weight', weight,
                         'reps', reps,
                         'logged_at', logged_at
                   ) ORDER BY logged_at DESC) as workouts
       FROM workout_logs
       WHERE user_id = $1
       GROUP BY day
       ORDER BY day DESC
       LIMIT $2 OFFSET $3;
    `, userID, limit, offset)

	if err != nil {
		return nil, fmt.Errorf("postgres get sessions: %w", err)
	}
	defer rows.Close()

	sessions := make([]domain.WorkoutLog, 0, limit)
	for rows.Next() {
		var sess domain.WorkoutLog
		var workoutsRaw []byte

		if err := rows.Scan(&sess.Date, &workoutsRaw); err != nil {
			return nil, fmt.Errorf("postgres scan session: %w", err)
		}
		if err := json.Unmarshal(workoutsRaw, &sess.WorkoutSets); err != nil {
			return nil, fmt.Errorf("postgres unmarshal session: %w", err)
		}

		sessions = append(sessions, sess)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("postgres rows error: %w", err)
	}
	return sessions, nil
}
