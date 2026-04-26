package httpserver

import (
	"backend/pkg/logger"
	"context"
	"net/http"
	"time"
)

type Server struct {
	server *http.Server
}

func New(handler http.Handler, port string) *Server {
	return &Server{
		server: &http.Server{
			Addr:         ":" + port,
			Handler:      handler,
			ReadTimeout:  10 * time.Second,
			WriteTimeout: 10 * time.Second,
			IdleTimeout:  30 * time.Second,
		},
	}
}

func (s *Server) Start() error {
	logger.Log.Info().Str("port", s.server.Addr).Msg("Starting http server")
	return s.server.ListenAndServe()
}

func (s *Server) Stop(ctx context.Context) error {
	logger.Log.Info().Str("port", s.server.Addr).Msg("Stopping http server")
	return s.server.Shutdown(ctx)
}
