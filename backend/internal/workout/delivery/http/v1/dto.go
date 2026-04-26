package v1

type SaveRequest struct {
	Exercise string  `json:"exercise"`
	Weight   float64 `json:"weight"`
	Reps     int64   `json:"reps"`
}

type GetSessionsRequest struct {
	Limit  int `json:"limit"`
	Offset int `json:"offset"`
}
