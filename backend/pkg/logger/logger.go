package logger

import (
	"os"
	"time"

	"github.com/rs/zerolog"
)

var Log zerolog.Logger

func InitLogger() {
	level := zerolog.InfoLevel

	if os.Getenv("APP_ENV") == "development" {
		level = zerolog.DebugLevel
	}

	zerolog.SetGlobalLevel(level)

	Log = zerolog.New(zerolog.ConsoleWriter{
		Out:        os.Stdout,
		TimeFormat: time.DateTime,
	}).With().Timestamp().Caller().Logger()
}
