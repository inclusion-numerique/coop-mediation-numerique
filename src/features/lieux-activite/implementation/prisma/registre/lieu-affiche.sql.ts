import { Prisma } from '@app/web/generated/prisma/client'

export const JOINTURE_DE_L_INSCRIPTION = Prisma.sql`
  LEFT JOIN main.lieu_inclusion ri ON ri.structure_coop_id = s.id AND ri.deleted_at IS NULL
  LEFT JOIN main.adresse ra ON ra.id = ri.adresse_id`

export const NOM_AFFICHE = Prisma.sql`COALESCE(ri.nom, s.nom)`

export const VOIE_DU_REGISTRE = Prisma.sql`CONCAT_WS(' ', ra.numero_voie, ra.repetition, ra.nom_voie)`

export const DERNIERE_ECRITURE = Prisma.sql`GREATEST(s.modification, ri.updated_at_carto, ri.updated_at_coop, ri.updated_at_min)`

export const normaliseePourLaRecherche = (colonne: Prisma.Sql): Prisma.Sql =>
  Prisma.sql`NULLIF(regexp_replace(lower(unaccent(${colonne})), '[\\s-]', '', 'g'), '')`
