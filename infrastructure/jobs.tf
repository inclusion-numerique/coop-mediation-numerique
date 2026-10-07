resource "scaleway_container_cron" "job" {
  for_each = local.jobs

  name         = each.key
  schedule     = each.value
  container_id = scaleway_container.webContainer.id
  args         = jsonencode({ name = each.key })
}
