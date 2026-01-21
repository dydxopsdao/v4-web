module "test_datadog_monitor" {
  source = "app.terraform.io/dydxopsdao/dos_datadog_monitor/datadog"

  monitor_name      = "terraform test for v4-web"
  service_name      = "v4-web"
  query             = "sum(last_12h):sum:cloudflare.pageviews.all{*}.as_count() == 0"
  custom_tags       = ["lorem:ipsum"]
  renotify_interval = 24 * 60 # 24 hours
  message           = <<EOT
    Lorem ipsum
  EOT
}

