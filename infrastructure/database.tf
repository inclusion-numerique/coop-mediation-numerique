data "scaleway_rdb_instance" "dbInstance" {
  name = var.DATABASE_INSTANCE_NAME
}

resource "scaleway_rdb_user" "databaseUser" {
  count = local.is_main ? 0 : 1

  instance_id = data.scaleway_rdb_instance.dbInstance.instance_id
  name        = local.database_user
  password    = var.DATABASE_PASSWORD
}

resource "scaleway_rdb_database" "database" {
  count = local.is_main ? 0 : 1

  instance_id = data.scaleway_rdb_instance.dbInstance.instance_id
  name        = local.database_name
}

resource "scaleway_rdb_privilege" "databasePrivilege" {
  count = local.is_main ? 0 : 1

  instance_id   = data.scaleway_rdb_instance.dbInstance.instance_id
  database_name = local.database_name
  user_name     = local.database_user
  permission    = "all"

  depends_on = [
    scaleway_rdb_database.database,
    scaleway_rdb_user.databaseUser,
  ]
}

moved {
  from = scaleway_rdb_user.databaseUser
  to   = scaleway_rdb_user.databaseUser[0]
}

moved {
  from = scaleway_rdb_database.database
  to   = scaleway_rdb_database.database[0]
}

moved {
  from = scaleway_rdb_privilege.databasePrivilege
  to   = scaleway_rdb_privilege.databasePrivilege[0]
}
