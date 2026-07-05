from prometheus_client import Counter, Gauge, Histogram

prediction_requests_total = Counter(
    "prediction_requests_total",
    "Total number of prediction requests received",
)

prediction_failures_total = Counter(
    "prediction_failures_total",
    "Total number of prediction requests that failed",
)

prediction_latency_seconds = Histogram(
    "prediction_latency_seconds",
    "Latency of prediction requests in seconds",
)

up = Gauge(
    "up",
    "Whether the service is up and able to serve requests (1) or not (0)",
)
