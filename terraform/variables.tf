variable "datadog_api_key" {
  description = "Datadog API key"
  type        = string
}

variable "datadog_app_key" {
  description = "Datadog application key"
  type        = string
}

variable "datadog_site" {
  description = "Datadog site"
  type        = string
  default     = "ap1.datadoghq.com"
}

