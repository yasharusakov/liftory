package main

import (
	"backend/config"
	"backend/internal/handler"
	"backend/internal/middleware"
	"backend/internal/repository"
	"backend/internal/service"
	"backend/pkg/httpserver"
	"backend/pkg/logger"
	"backend/pkg/postgres"
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

	db := postgres.Connect(config.GetPostgres())
	defer db.Close()

	repo := repository.New(db)
	svc := service.New(repo)
	h := handler.New(svc)

	mux := http.NewServeMux()
	h.RegisterRoutes(mux)

	rateLimiter := middleware.NewRateLimiter(rate.Every(time.Second), 10)

	chainedHandler := middleware.Cors(
		middleware.Auth(config.GetTelegram().BotToken)(
			rateLimiter.Middleware()(mux),
		),
	)

	srv := httpserver.New(chainedHandler, config.GetApp().Port)
	go srv.Start()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	rateLimiter.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	srv.Stop(ctx)
}
