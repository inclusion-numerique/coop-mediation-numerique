import { conseillerNumeriqueSql } from '@app/web/features/employeuse/server'
import { Prisma } from '@app/web/generated/prisma/client'
import { subDays } from 'date-fns'
import {
  type CoordinateurId,
  type CriteresEquipe,
  SEUIL_INACTIVITE_EN_JOURS,
  type TypeDeStatut,
} from '../domain'

export type LigneEquipeRow = {
  readonly statut: string
  readonly email: string
  readonly mediateur_id: string | null
  readonly user_id: string | null
  readonly first_name: string | null
  readonly last_name: string | null
  readonly name: string | null
  readonly phone: string | null
  readonly is_conseiller_numerique: boolean | null
  readonly depuis: Date
  readonly archivee_le: Date | null
  readonly supprime_le: Date | null
  readonly derniere_activite: Date | null
  readonly structure_employeuse: string | null
  readonly structure_employeuse_adresse: string | null
  readonly structure_employeuse_commune: string | null
  readonly structure_employeuse_code_postal: string | null
  readonly structure_employeuse_code_insee: string | null
}

export type StatistiquesEquipeRow = {
  readonly total: number
  readonly actifs: number
  readonly inactifs: number
  readonly invitations: number
  readonly archives: number
  readonly conseillers_numeriques: number
}

const EMPLOYEUSE_MAIN: Readonly<Record<string, string>> = {
  structure_employeuse:
    'COALESCE(sa.denomination_antenne, sa.denomination_sirene)',
  structure_employeuse_adresse:
    "TRIM(CONCAT_WS(' ', ad.numero_voie, ad.repetition, ad.nom_voie))",
  structure_employeuse_commune: 'ad.nom_commune',
  structure_employeuse_code_postal: 'ad.code_postal',
  structure_employeuse_code_insee: 'ad.code_insee',
}

const colonnesEmployeuse = (userIdSource: string) =>
  Prisma.raw(
    Object.entries(EMPLOYEUSE_MAIN)
      .map(
        ([alias, expression]) => `
  (SELECT ${expression}
   FROM main.personne p
   JOIN main.personne_affectations_emploi a
     ON a.personne_id = p.id AND a.est_active AND a.structure_administrative_id IS NOT NULL
   JOIN main.structure_administrative sa ON sa.id = a.structure_administrative_id
   LEFT JOIN main.adresse ad ON ad.id = sa.adresse_id
   WHERE p.coop_id = ${userIdSource}
   ORDER BY CASE a.source WHEN 'idposte' THEN 0 WHEN 'coop' THEN 1 ELSE 2 END,
            a.created_at DESC
   LIMIT 1) AS ${alias}`,
      )
      .join(','),
  )

const colonnesUtilisateur = Prisma.sql`
  users.id AS user_id,
  users.first_name AS first_name,
  users.last_name AS last_name,
  users.name AS name,
  users.phone AS phone,
  ${conseillerNumeriqueSql('users.id', true)} AS is_conseiller_numerique`

export const lignesEquipeCte = ({
  coordinateurId,
  maintenant,
}: {
  coordinateurId: CoordinateurId
  maintenant: Date
}) => Prisma.sql`
WITH invitations AS (
  SELECT
    'Invitation'::text AS statut,
    invitations.email AS email,
    invitations.mediateur_id AS mediateur_id,
    ${colonnesUtilisateur},
    invitations.creation AS depuis,
    NULL::timestamp AS archivee_le,
    NULL::timestamp AS supprime_le,
    NULL::timestamp AS derniere_activite,
    ${colonnesEmployeuse('mediateurs.user_id')}
  FROM invitations_equipes AS invitations
    LEFT JOIN mediateurs ON mediateurs.id = invitations.mediateur_id
    LEFT JOIN users ON users.id = mediateurs.user_id
  WHERE invitations.coordinateur_id = ${coordinateurId}::uuid
    AND invitations.acceptee IS NULL
    AND invitations.refusee IS NULL
),
adhesions AS (
  SELECT DISTINCT ON (mc.mediateur_id) mc.mediateur_id, mc.creation, mc.suppression
  FROM mediateurs_coordonnes AS mc
  WHERE mc.coordinateur_id = ${coordinateurId}::uuid
  ORDER BY mc.mediateur_id, (mc.suppression IS NULL) DESC, mc.creation DESC
),
membres AS (
  SELECT
    CASE
      WHEN users.deleted IS NOT NULL THEN 'ProfilSupprime'
      WHEN adhesions.suppression IS NOT NULL THEN 'AncienMembre'
      WHEN mediateurs.derniere_creation_activite >= ${subDays(maintenant, SEUIL_INACTIVITE_EN_JOURS)} THEN 'Actif'
      ELSE 'Inactif'
    END AS statut,
    users.email AS email,
    mediateurs.id AS mediateur_id,
    ${colonnesUtilisateur},
    adhesions.creation AS depuis,
    adhesions.suppression AS archivee_le,
    users.deleted AS supprime_le,
    mediateurs.derniere_creation_activite AS derniere_activite,
    ${colonnesEmployeuse('users.id')}
  FROM adhesions
    JOIN mediateurs ON mediateurs.id = adhesions.mediateur_id
    JOIN users ON users.id = mediateurs.user_id
),
lignes AS (
  SELECT * FROM invitations
  UNION ALL
  SELECT * FROM membres
)`

const statutsDuFiltre = new Map<string, readonly TypeDeStatut[]>([
  ['actifs', ['Actif']],
  ['inactifs', ['Inactif']],
  ['invitations', ['Invitation']],
  ['archives', ['AncienMembre', 'ProfilSupprime']],
])

const conditionDeRole = new Map<string, Prisma.Sql>([
  ['conseiller-numerique', Prisma.sql`AND is_conseiller_numerique = TRUE`],
  ['mediateur-numerique', Prisma.sql`AND is_conseiller_numerique = FALSE`],
])

const motifDeRecherche = (recherche: string): string =>
  `%${recherche.replace(/[\\%_]/g, (caractere) => `\\${caractere}`)}%`

export const filtresEquipe = ({
  recherche,
  statuts,
  role,
}: CriteresEquipe): Prisma.Sql => {
  const parRecherche =
    recherche === null
      ? Prisma.empty
      : Prisma.sql`AND (email ILIKE ${motifDeRecherche(recherche)} OR first_name ILIKE ${motifDeRecherche(recherche)} OR last_name ILIKE ${motifDeRecherche(recherche)})`

  const parStatut =
    statuts.length === 0
      ? Prisma.empty
      : Prisma.sql`AND statut = ANY(${statuts.flatMap((statut) => statutsDuFiltre.get(statut) ?? [])}::text[])`

  const parRole =
    role === null ? Prisma.empty : (conditionDeRole.get(role) ?? Prisma.empty)

  return Prisma.sql`WHERE TRUE ${parRecherche} ${parStatut} ${parRole}`
}

const rangDuStatut = `CASE statut WHEN 'Invitation' THEN 1 WHEN 'Actif' THEN 2 WHEN 'Inactif' THEN 3 WHEN 'AncienMembre' THEN 4 ELSE 5 END`
const nomDuMembre = `LOWER(COALESCE(name, ''))`
const nomDeLEmployeuse = `LOWER(COALESCE(structure_employeuse, ''))`

const ordreDeTri = new Map<string, string>([
  ['membre', `${nomDuMembre} %s, ${rangDuStatut} ASC`],
  ['structureEmployeuse', `${nomDeLEmployeuse} %s, ${nomDuMembre} ASC`],
  ['statut', `${rangDuStatut} %s, ${nomDuMembre} ASC`],
])

export const triEquipe = ({ tri, ordre }: CriteresEquipe): Prisma.Sql =>
  Prisma.raw(
    `ORDER BY ${(ordreDeTri.get(tri) ?? `${rangDuStatut} %s, ${nomDuMembre} ASC`).replace('%s', ordre === 'desc' ? 'DESC' : 'ASC')}`,
  )

export const statistiquesEquipeSql = Prisma.sql`
SELECT
  COUNT(*) FILTER (WHERE statut IN ('Actif', 'Inactif'))::int AS total,
  COUNT(*) FILTER (WHERE statut = 'Actif')::int AS actifs,
  COUNT(*) FILTER (WHERE statut = 'Inactif')::int AS inactifs,
  COUNT(*) FILTER (WHERE statut = 'Invitation')::int AS invitations,
  COUNT(*) FILTER (WHERE statut IN ('AncienMembre', 'ProfilSupprime'))::int AS archives,
  COUNT(*) FILTER (WHERE statut IN ('Actif', 'Inactif') AND is_conseiller_numerique)::int AS conseillers_numeriques
FROM lignes`
