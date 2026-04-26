package postgres

import (
	"context"
	"embed"
	"fmt"

	"backend/config"
	"backend/pkg/logger"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres" // Драйвер для Postgres
	"github.com/golang-migrate/migrate/v4/source/iofs"
	"github.com/jackc/pgx/v5/pgxpool"
)

//go:embed migrations/*.sql
var migrationsFS embed.FS

func Connect(cfg config.Postgres) *pgxpool.Pool {
	connString := fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=%s",
		cfg.User, cfg.Password, cfg.Host, cfg.Port, cfg.DB, cfg.SSLMode,
	)

	runMigrations(connString)

	pool, err := pgxpool.New(context.Background(), connString)
	if err != nil {
		logger.Log.Fatal().Err(err).Msg("Failed to connect to database")
	}

	if err := pool.Ping(context.Background()); err != nil {
		logger.Log.Fatal().Err(err).Msg("Failed to ping database")
	}

	logger.Log.Info().Msg("Database connected and migrations applied")
	return pool
}

func runMigrations(dbURL string) {
	d, err := iofs.New(migrationsFS, "migrations")
	if err != nil {
		logger.Log.Fatal().Err(err).Msg("Failed to create migration source")
	}

	m, err := migrate.NewWithSourceInstance("iofs", d, dbURL)
	if err != nil {
		logger.Log.Fatal().Err(err).Msg("Failed to create migrate instance")
	}

	if err := m.Up(); err != nil && err.Error() != "no change" {
		logger.Log.Fatal().Err(err).Msg("Failed to run migrations")
	}

	logger.Log.Info().Msg("Migrations applied successfully")

	m.Close()
}
