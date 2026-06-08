# Image Postgres locale réunissant les deux familles d'extensions nécessaires à la cohabitation
# Coop <-> MIN/Dataspace dans une seule base :
#   - vector / pgvector (Coop : embeddings)
#   - postgis (DDL Dataspace : colonnes geometry/geography)
# citext, pg_trgm, unaccent sont déjà fournis par les contrib de l'image de base.
#
# On part de pgvector/pgvector:pg17 (Debian bookworm, glibc 2.36) — la MÊME base que l'image
# d'origine — et on ajoute postgis. Important : conserver bookworm/glibc 2.36 évite un
# « collation version mismatch » (et un risque de corruption d'index texte) sur le volume
# existant. Ne PAS repartir de postgis/postgis:17 (bullseye, glibc 2.31) : ce serait une
# régression de collation.
FROM pgvector/pgvector:pg17

RUN apt-get update \
 && apt-get install -y --no-install-recommends postgresql-17-postgis-3 \
 && rm -rf /var/lib/apt/lists/*
