package main

import (
	"backend/config"
	"backend/internal/middleware"
	httpv1 "backend/internal/workout/delivery/http/v1"
	"backend/internal/workout/repository/postgres"
	"backend/internal/workout/usecase"
	"backend/pkg/httpserver"
	"backend/pkg/logger"
	pkgPostgres "backend/pkg/postgres"
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"golang.org/x/time/rate"
)

func main() {
	config.InitConfig()
	logger.InitLogger()

	db := pkgPostgres.Connect(config.GetPostgres())
	defer db.Close()

	workoutRepo := postgres.NewWorkoutStorage(db)
	workoutUseCase := usecase.NewWorkoutUseCase(workoutRepo)
	workoutHandler := httpv1.NewWorkoutHandler(workoutUseCase)

	mux := http.NewServeMux()
	workoutHandler.RegisterRoutes(mux)

	rateLimiter := middleware.NewRateLimiter(rate.Every(time.Second), 10)

	h := middleware.Cors(
		middleware.Auth(
			config.GetTelegram().BotToken,
		)(
			rateLimiter.Middleware()(mux),
		),
	)

	srv := httpserver.New(h, config.GetApp().Port)
	go srv.Start()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	srv.Stop(ctx)
}
