terraform {
  cloud {
    organization = "dydxopsdao"

    workspaces {
      name = "v4-web"
    }
  }

  required_providers {
    datadog = {
      source  = "datadog/datadog"
      version = ">= 3.0"
    }
  }

  required_version = "~> 1.14.3"
}

provider "datadog" {
  api_key = var.datadog_api_key
  app_key = var.datadog_app_key
  api_url = "https://${var.datadog_site}/"
}

