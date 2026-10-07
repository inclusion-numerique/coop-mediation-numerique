locals {
  is_main = var.namespace == "main"

  main_domain    = var.MAIN_SUBDOMAIN == "" ? var.MAIN_ROOT_DOMAIN : "${var.MAIN_SUBDOMAIN}.${var.MAIN_ROOT_DOMAIN}"
  preview_domain = var.PREVIEW_SUBDOMAIN == "" ? var.PREVIEW_ROOT_DOMAIN : "${var.PREVIEW_SUBDOMAIN}.${var.PREVIEW_ROOT_DOMAIN}"

  preview_subdomain = trimsuffix(
    trimsuffix(substr(var.namespace, 0, 63 - 1 - length(local.preview_domain)), "-"),
    "_",
  )

  subdomain = local.is_main ? "" : local.preview_subdomain
  hostname  = local.is_main ? local.main_domain : "${local.preview_subdomain}.${local.preview_domain}"

  database_name = "${var.NEXT_PUBLIC_APP_SLUG}-${var.namespace}"
  database_user = "${var.NEXT_PUBLIC_APP_SLUG}-${var.namespace}"

  container_name = substr(var.namespace, 0, 34)

  email_from_address = local.is_main ? "bot@${local.main_domain}" : "bot+${var.namespace}@${local.main_domain}"
  email_from_name    = local.is_main ? var.NEXT_PUBLIC_APP_NAME : "[${var.namespace}] ${var.NEXT_PUBLIC_APP_NAME}"

  database_url = local.is_main ? var.ENTREPOT_DATABASE_URL : format(
    "postgres://%s:%s@%s:%s/%s?sslmode=require&uselibpqcompat=true&options=-c%%20search_path%%3Dcoop,public",
    local.database_user,
    var.DATABASE_PASSWORD,
    data.scaleway_rdb_instance.dbInstance.endpoint_ip,
    data.scaleway_rdb_instance.dbInstance.endpoint_port,
    local.database_name,
  )

  jobs = local.is_main ? {
    "appliquer-dispositif-conum"   = "0 2 * * *"
    "fix-users-roles"              = "0 0 * * *"
    "inactive-users-reminders"     = "0 0 * * *"
    "remove-orphan-brevo-contacts" = "0 3 * * *"
    "sync-rdvsp-data"              = "0 2 * * *"
    } : var.namespace == "dev" ? {
    "sync-rdvsp-data" = "0 2 * * *"
  } : {}
}
