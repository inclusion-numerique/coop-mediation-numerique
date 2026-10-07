data "scaleway_container_namespace" "containerNamespace" {
  name = var.CONTAINER_NAMESPACE_NAME
}

resource "scaleway_container" "webContainer" {
  name           = local.container_name
  namespace_id   = data.scaleway_container_namespace.containerNamespace.namespace_id
  registry_image = var.WEB_CONTAINER_IMAGE
  min_scale      = local.is_main ? 2 : 0
  max_scale      = local.is_main ? 3 : 1
  cpu_limit      = local.is_main ? 1120 : 560
  memory_limit   = local.is_main ? 2048 : 1024
  deploy         = true

  environment_variables = {
    BREVO_USERS_LIST_ID   = var.BREVO_USERS_LIST_ID
    EMAIL_FROM_ADDRESS    = local.email_from_address
    EMAIL_FROM_NAME       = local.email_from_name
    STACK_WEB_IMAGE       = var.WEB_CONTAINER_IMAGE
    UPLOADS_BUCKET        = scaleway_object_bucket.uploads.name
    BASE_URL              = local.hostname
    NEXTAUTH_URL          = local.hostname
    BRANCH                = var.branch
    NAMESPACE             = var.namespace
    SCW_DEFAULT_REGION    = var.SCW_DEFAULT_REGION
    SMTP_PORT             = local.is_main ? var.SMTP_PORT : "1025"
    ENTREPOT_BASTION_HOST = var.ENTREPOT_BASTION_HOST
    ENTREPOT_BASTION_USER = var.ENTREPOT_BASTION_USER
    ENTREPOT_BASTION_PORT = var.ENTREPOT_BASTION_PORT
    ENTREPOT_DB_HOST      = "172.16.20.14"
    ENTREPOT_DB_PORT      = "5432"
    ENTREPOT_TUNNEL_PORT  = "5433"
  }

  secret_environment_variables = {
    BREVO_API_KEY                          = local.is_main ? var.BREVO_API_KEY : ""
    DATABASE_URL                           = local.database_url
    PROCONNECT_CLIENT_SECRET               = local.is_main ? var.PROCONNECT_MAIN_CLIENT_SECRET : var.PROCONNECT_PREVIEW_CLIENT_SECRET
    RDV_SERVICE_PUBLIC_OAUTH_CLIENT_ID     = local.is_main ? var.RDV_SERVICE_PUBLIC_MAIN_OAUTH_CLIENT_ID : var.RDV_SERVICE_PUBLIC_PREVIEW_OAUTH_CLIENT_ID
    RDV_SERVICE_PUBLIC_OAUTH_CLIENT_SECRET = local.is_main ? var.RDV_SERVICE_PUBLIC_MAIN_OAUTH_CLIENT_SECRET : var.RDV_SERVICE_PUBLIC_PREVIEW_OAUTH_CLIENT_SECRET
    RDV_SERVICE_PUBLIC_WEBHOOK_SECRET      = var.RDV_SERVICE_PUBLIC_WEBHOOK_SECRET
    RDV_SERVICE_PUBLIC_WEBHOOK_DEBUG       = local.is_main ? "0" : "1"
    INTERNAL_API_PRIVATE_KEY               = var.INTERNAL_API_PRIVATE_KEY
    CONSEILLER_NUMERIQUE_MONGODB_URL       = var.CONSEILLER_NUMERIQUE_MONGODB_URL
    HMAC_SECRET_KEY                        = var.HMAC_SECRET_KEY
    SMTP_USERNAME                          = local.is_main ? var.SMTP_USERNAME : var.SMTP_MAILDEV_USERNAME
    SMTP_PASSWORD                          = local.is_main ? var.SMTP_PASSWORD : var.SMTP_MAILDEV_PASSWORD
    SMTP_SERVER                            = local.is_main ? var.SMTP_SERVER : "maildev.coop-numerique.anct.gouv.fr"
    ENTREPOT_BASTION_SSH_KEY               = var.ENTREPOT_BASTION_SSH_KEY
    ENTREPOT_DATABASE_URL                  = var.ENTREPOT_DATABASE_URL
  }
}
