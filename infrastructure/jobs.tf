resource "scaleway_container_trigger" "job" {
  for_each = local.jobs

  name         = each.key
  container_id = scaleway_container.webContainer.id

  cron {
    schedule = each.value
    timezone = "Etc/UTC"
    body     = jsonencode({ name = each.key })
  }

  destination_config {
    http_path   = "/"
    http_method = "post"
  }
}
