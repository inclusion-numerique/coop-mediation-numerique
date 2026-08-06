# Image Postgres pour la CI : réunit les deux familles d'extensions nécessaires à la cohabitation
# Coop <-> MIN/Dataspace dans une seule base, comme `docker/postgres/Dockerfile` (docker local) :
#   - vector / pgvector (Coop : embeddings)
#   - postgis (DDL Dataspace : colonnes `geometry`, dont `main.adresse.geom` créé par la migration
#     baseline `20260722155232_baseline_main_external`)
#
# L'image CI précédente (`huguesm/circleci-postgres:14.13-vector`) n'avait QUE pgvector, d'où l'échec
# `could not open extension control file ".../postgis.control"` au `migrate deploy`.
#
# Version pg17 : ALIGNÉE sur la prod (Entrepôt) et le docker local, contrairement à l'ancienne CI en
# pg14. Base `pgvector/pgvector:pg17` + postgis-3 — identique à `docker/postgres/Dockerfile`.
# `POSTGRES_HOST_AUTH_METHOD=trust` : base CI jetable, connexion sans mot de passe (comme l'usage
# `postgresql://postgres@localhost` de `.circleci/config.yml`).
FROM pgvector/pgvector:pg17

RUN apt-get update \
 && apt-get install -y --no-install-recommends postgresql-17-postgis-3 \
 && rm -rf /var/lib/apt/lists/*

# La suite d'intégration parallèle (jest workers x pool Prisma) ouvre beaucoup de connexions : on
# aligne max_connections sur l'ancienne image CI (200) au lieu du défaut Postgres (100), sinon
# "FATAL: sorry, too many clients already".
RUN echo "max_connections = 200" >> /usr/share/postgresql/postgresql.conf.sample

ENV POSTGRES_HOST_AUTH_METHOD=trust
