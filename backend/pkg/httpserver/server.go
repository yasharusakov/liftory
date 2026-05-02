package httpserver

import (
	"backend/pkg/logger"
	"context"
	"net/http"
	"time"
)

type server struct {
	server *http.Server
}

func New(handler http.Handler, port string) *server {
	return &server{
		server: &http.Server{
			Addr:         ":" + port,
			Handler:      handler,
			ReadTimeout:  10 * time.Second,
			WriteTimeout: 10 * time.Second,
			IdleTimeout:  30 * time.Second,
		},
	}
}

func (s *server) Start() error {
	logger.Log.Info().Str("port", s.server.Addr).Msg("Starting http server")
	return s.server.ListenAndServe()
}

func (s *server) Stop(ctx context.Context) error {
	logger.Log.Info().Str("port", s.server.Addr).Msg("Stopping http server")
	return s.server.Shutdown(ctx)
}
