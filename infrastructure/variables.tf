variable "branch" {
  type = string
}

variable "namespace" {
  type = string
}

variable "BREVO_USERS_LIST_ID" {
  type = string
}

variable "SCW_DEFAULT_ORGANIZATION_ID" {
  type = string
}

variable "SCW_PROJECT_ID" {
  type = string
}

variable "WEB_CONTAINER_IMAGE" {
  type = string
}

variable "NEXT_PUBLIC_APP_SLUG" {
  type = string
}

variable "NEXT_PUBLIC_APP_NAME" {
  type = string
}

variable "DATABASE_INSTANCE_NAME" {
  type = string
}

variable "CONTAINER_NAMESPACE_NAME" {
  type = string
}

variable "SCW_DEFAULT_REGION" {
  type = string
}

variable "MAIN_ROOT_DOMAIN" {
  type = string
}

variable "MAIN_SUBDOMAIN" {
  type = string
}

variable "PREVIEW_ROOT_DOMAIN" {
  type = string
}

variable "PREVIEW_SUBDOMAIN" {
  type = string
}

variable "SMTP_PORT" {
  type = string
}

variable "BREVO_API_KEY" {
  type      = string
  sensitive = true
}

variable "SCW_ACCESS_KEY" {
  type      = string
  sensitive = true
}

variable "SCW_SECRET_KEY" {
  type      = string
  sensitive = true
}

variable "DATABASE_PASSWORD" {
  type      = string
  sensitive = true
}

variable "PROCONNECT_PREVIEW_CLIENT_SECRET" {
  type      = string
  sensitive = true
}

variable "PROCONNECT_MAIN_CLIENT_SECRET" {
  type      = string
  sensitive = true
}

variable "INTERNAL_API_PRIVATE_KEY" {
  type      = string
  sensitive = true
}

variable "CONSEILLER_NUMERIQUE_MONGODB_URL" {
  type      = string
  sensitive = true
}

variable "HMAC_SECRET_KEY" {
  type      = string
  sensitive = true
}

variable "RDV_SERVICE_PUBLIC_PREVIEW_OAUTH_CLIENT_ID" {
  type      = string
  sensitive = true
}

variable "RDV_SERVICE_PUBLIC_PREVIEW_OAUTH_CLIENT_SECRET" {
  type      = string
  sensitive = true
}

variable "RDV_SERVICE_PUBLIC_MAIN_OAUTH_CLIENT_ID" {
  type      = string
  sensitive = true
}

variable "RDV_SERVICE_PUBLIC_MAIN_OAUTH_CLIENT_SECRET" {
  type      = string
  sensitive = true
}

variable "RDV_SERVICE_PUBLIC_WEBHOOK_SECRET" {
  type      = string
  sensitive = true
}

variable "SMTP_PASSWORD" {
  type      = string
  sensitive = true
}

variable "SMTP_SERVER" {
  type      = string
  sensitive = true
}

variable "SMTP_USERNAME" {
  type      = string
  sensitive = true
}

variable "SMTP_MAILDEV_USERNAME" {
  type      = string
  sensitive = true
}

variable "SMTP_MAILDEV_PASSWORD" {
  type      = string
  sensitive = true
}

variable "ENTREPOT_BASTION_HOST" {
  type    = string
  default = ""
}

variable "ENTREPOT_BASTION_USER" {
  type    = string
  default = ""
}

variable "ENTREPOT_BASTION_PORT" {
  type    = string
  default = ""
}

variable "ENTREPOT_BASTION_SSH_KEY" {
  type      = string
  sensitive = true
  default   = ""
}

variable "ENTREPOT_DATABASE_URL" {
  type      = string
  sensitive = true
  default   = ""
}
