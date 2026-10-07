moved {
  from = scaleway_container_cron.trigger-appliquer-dispositif-conum
  to   = scaleway_container_cron.job["appliquer-dispositif-conum"]
}

moved {
  from = scaleway_container_cron.trigger-fix-users-roles
  to   = scaleway_container_cron.job["fix-users-roles"]
}

moved {
  from = scaleway_container_cron.trigger-inactive-users-reminders
  to   = scaleway_container_cron.job["inactive-users-reminders"]
}

moved {
  from = scaleway_container_cron.trigger-remove-orphan-brevo-contacts
  to   = scaleway_container_cron.job["remove-orphan-brevo-contacts"]
}

moved {
  from = scaleway_container_cron.trigger-sync-rdvsp-data
  to   = scaleway_container_cron.job["sync-rdvsp-data"]
}
