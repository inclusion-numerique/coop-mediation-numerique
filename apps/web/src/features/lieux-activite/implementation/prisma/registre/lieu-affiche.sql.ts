import { Prisma } from '@prisma/client'

/**
 * De quoi CHERCHER et TRIER sur ce qu'un écran AFFICHE.
 *
 * Les listes montrent le lieu tel que le registre le décrit, mais filtraient et
 * ordonnaient sur les colonnes de la coop : on cherchait dans un nom qu'on
 * n'affichait pas, et la liste alphabétique suivait un ordre invisible.
 *
 * Contrat d'alias : la table coop est `s`, la jointure nomme l'inscription `ri`
 * et son adresse `ra`.
 */
export const JOINTURE_DE_L_INSCRIPTION = Prisma.sql`
  LEFT JOIN main.lieu_inclusion ri ON ri.structure_coop_id = s.id AND ri.deleted_at IS NULL
  LEFT JOIN main.adresse ra ON ra.id = ri.adresse_id`

export const NOM_AFFICHE = Prisma.sql`COALESCE(ri.nom, s.nom)`

/**
 * La ligne de voie du registre, recomposée comme `voieDuRegistre` la recompose
 * pour l'affichage : leur pipeline découpe ce que la coop garde entier.
 */
export const VOIE_DU_REGISTRE = Prisma.sql`CONCAT_WS(' ', ra.numero_voie, ra.repetition, ra.nom_voie)`

/**
 * La dernière écriture, toutes sources confondues.
 *
 * `main.lieu_inclusion.updated_at` porte déjà ce `GREATEST` en prod, mais c'est
 * une colonne GÉNÉRÉE que notre migration de bootstrap ne crée pas : s'en servir
 * ici marcherait en local sur un dump restauré et casserait en CI. On refait
 * donc le calcul, comme `derniereEcriture` le fait en TypeScript.
 *
 * `GREATEST` de PostgreSQL ignore les `NULL`, et `s.modification` ne l'est
 * jamais : le résultat est toujours daté.
 */
export const DERNIERE_ECRITURE = Prisma.sql`GREATEST(s.modification, ri.updated_at_carto, ri.updated_at_coop, ri.updated_at_min)`

/**
 * Le texte cherché est comparé aux DEUX côtés, et non au seul côté affiché.
 *
 * C'est délibérément plus large : quelqu'un qui cherche un lieu le connaît
 * peut-être sous le nom que la coop lui donnait avant qu'une autre source ne le
 * renomme. Ne chercher que dans la valeur affichée le lui ferait disparaître.
 */
export const normaliseePourLaRecherche = (colonne: Prisma.Sql): Prisma.Sql =>
  Prisma.sql`NULLIF(regexp_replace(lower(unaccent(${colonne})), '[\\s-]', '', 'g'), '')`
