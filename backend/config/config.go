package config

import (
	"log"
	"os"
	"strings"
	"sync"

	"github.com/joho/godotenv"
)

var (
	cfg  Config
	once sync.Once
)

type Telegram struct {
	BotToken string
}

type Postgres struct {
	User     string
	Password string
	Host     string
	Port     string
	DB       string
	SSLMode  string
}

type App struct {
	Port           string
	Env            string
	AllowedOrigins []string
}

type Config struct {
	App      App
	Telegram Telegram
	Postgres Postgres
}

func getEnv(key string) string {
	value := os.Getenv(key)
	if value == "" {
		log.Fatalf("Environment variable %s not set", key)
	}
	return value
}

func loadConfigFromEnv() Config {
	env := os.Getenv("APP_ENV")

	if env == "" {
		env = "development"
	}

	if env == "development" {
		_ = godotenv.Load(".env.development")
		_ = godotenv.Load(".env")
	}

	allowedOrigins := getEnv("APP_ALLOWED_ORIGINS")
	allowedOriginsList := strings.Split(allowedOrigins, ";")
	if len(allowedOriginsList) == 0 {
		log.Fatalf("No allowed ORIGINS found in .env file")
	}

	return Config{
		App: App{
			Port:           getEnv("PORT"),
			Env:            env,
			AllowedOrigins: allowedOriginsList,
		},
		Telegram: Telegram{
			BotToken: getEnv("TELEGRAM_BOT_TOKEN"),
		},
		Postgres: Postgres{
			User:     getEnv("POSTGRES_USER"),
			Password: getEnv("POSTGRES_PASSWORD"),
			Host:     getEnv("POSTGRES_HOST"),
			Port:     getEnv("POSTGRES_PORT"),
			DB:       getEnv("POSTGRES_DB"),
			SSLMode:  getEnv("POSTGRES_SSLMODE"),
		},
	}
}

func InitConfig() {
	once.Do(func() {
		cfg = loadConfigFromEnv()
	})
}

func GetApp() App {
	return cfg.App
}

func GetPostgres() Postgres {
	return cfg.Postgres
}

func GetTelegram() Telegram {
	return cfg.Telegram
}
