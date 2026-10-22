locals {
  secrets_jobs = length(local.jobs) == 0 ? {} : {
    for nom in keys(local.secrets_web) : nom => nom
    if nonsensitive(local.secrets_web[nom] != "")
  }
}

resource "scaleway_secret" "job" {
  for_each = local.secrets_jobs

  name = lower(replace(each.key, "_", "-"))
  path = "/jobs/${var.namespace}"
}

resource "scaleway_secret_version" "job" {
  for_each = local.secrets_jobs

  secret_id = scaleway_secret.job[each.key].id
  data      = local.secrets_web[each.key]
}

resource "scaleway_job_definition" "job" {
  for_each = local.jobs

  name                   = "${local.container_name}-${each.key}"
  image_uri              = var.WEB_CONTAINER_IMAGE
  cpu_limit              = 1120
  memory_limit           = 2048
  local_storage_capacity = 1024
  args                   = ["node", "./apps/web/run-job.js", each.key]
  timeout                = "3h"
  env                    = local.environnement_web

  cron {
    schedule = each.value
    timezone = "Etc/UTC"
  }

  dynamic "secret_reference" {
    for_each = local.secrets_jobs

    content {
      secret_id      = scaleway_secret.job[secret_reference.key].id
      secret_version = scaleway_secret_version.job[secret_reference.key].revision
      environment    = secret_reference.key
    }
  }
}
