import { thematiqueApiValues } from '@app/web/features/activites/use-cases/cra/fields/thematique'
import { isDefinedAndNotNull } from '@app/web/utils/isDefinedAndNotNull'
import { onlyDefinedAndNotNull } from '@app/web/utils/onlyDefinedAndNotNull'
import { Prisma, Thematique } from '@prisma/client'
import type { Sql } from '@prisma/client/runtime/library'
import type {
  ActivitesFilters,
  RdvStatusFilterValue,
} from '../validation/ActivitesFilters'

export type ActivitesFiltersWhereConditions = {
  [key in keyof ActivitesFilters]: Sql | null
}

export const getActiviteFiltersSqlFragment = (
  conditions: ActivitesFiltersWhereConditions,
) => {
  const parts = Object.values(conditions).filter(onlyDefinedAndNotNull)

  if (parts.length === 0) return Prisma.raw('1=1')

  return Prisma.join(parts, ' AND ')
}

export type RdvFiltersWhereConditions = {
  [key in keyof ActivitesFilters]: Sql | null
}

export const getRdvFiltersSqlFragment = (
  conditions: RdvFiltersWhereConditions,
) => {
  const parts = Object.values(conditions).filter(onlyDefinedAndNotNull)

  if (parts.length === 0) return Prisma.raw('1=1')

  return Prisma.join(parts, ' AND ')
}

/**
 * Conditions for a query on the 3 tables of the CRA models
 */

export const activiteAccompagnementsCountSelect = Prisma.raw(
  '(SELECT COUNT(*) FROM accompagnements acc WHERE acc.activite_id = act.id)',
)

/**
 * Used to scope an activite query to a specific beneficiaire.
 * NOT USED FOR FILTERS but before, to reduce the set for a specific beneficiaire view.
 */
export const activitesBeneficiaireInnerJoin = (
  beneficiaireIds: string[] | null | undefined,
) => {
  if (!beneficiaireIds || beneficiaireIds.length === 0) return Prisma.sql``

  return Prisma.sql`
    INNER JOIN accompagnements acc 
    ON acc.activite_id = act.id 
    AND acc.beneficiaire_id = ANY(ARRAY[${Prisma.join(
      beneficiaireIds,
    )}]::UUID[])
  `
}

export const crasTypeOrderSelect = Prisma.raw(
  `CASE
                 WHEN type = 'individuel' THEN 1
                 ELSE 2
                 END`,
)

export const crasLieuLabelSelect = Prisma.raw(
  `COALESCE(str.nom, act.lieu_commune, 'À distance')`,
)

export const crasNotDeletedCondition = Prisma.raw(`(
          (cra_individuel.suppression IS NULL AND cra_individuel.id IS NOT NULL)
              OR (cra_collectif.suppression IS NULL AND cra_collectif.id IS NOT NULL)
              OR (cra_demarche_administrative.suppression IS NULL AND cra_demarche_administrative.id IS NOT NULL)
          )`)

export const activiteLieuCodeInseeSelect = Prisma.raw(`COALESCE(
                str.code_insee, 
                act.lieu_code_insee)`)

export const getActivitesFiltersWhereConditions = ({
  du,
  au,
  mediateurs,
  beneficiaires,
  communes,
  departements,
  lieux,
  types,
  conseiller_numerique,
  thematiqueNonAdministratives,
  thematiqueAdministratives,
  tags,
  rdv,
  source,
}: ActivitesFilters): {
  du: any
  au: any
  types: any
  lieux: any
  communes: any
  departements: any
  beneficiaires: any
  mediateurs: any
  conseiller_numerique: any
  thematiques: any
  tags: any
  rdv: any
  source: any
} => {
  const thematiques = (
    [
      ...(thematiqueNonAdministratives ? thematiqueNonAdministratives : []),
      ...(thematiqueAdministratives ? thematiqueAdministratives : []),
    ] as Thematique[]
  ).map((thematique: Thematique) => thematiqueApiValues[thematique])

  return {
    du: du ? Prisma.raw(`act.date::date >= '${du}'::date`) : null,
    au: au ? Prisma.raw(`act.date::date <= '${au}'::date`) : null,
    types:
      types && types.length > 0
        ? Prisma.raw(
            `act.type IN (${types.map((type) => `'${type}'`).join(', ')})`,
          )
        : null,
    lieux:
      lieux && lieux.length > 0
        ? Prisma.raw(
            `act.structure_id IN (${lieux
              .map((id) => `'${id}'::UUID`)
              .join(', ')})`,
          )
        : null,
    communes:
      communes && communes.length > 0
        ? Prisma.raw(
            `${activiteLieuCodeInseeSelect.text} IN (${communes
              .map((c) => `'${c}'`)
              .join(', ')})`,
          )
        : null,
    departements:
      departements && departements.length > 0
        ? Prisma.raw(
            `${activiteLieuCodeInseeSelect.text} LIKE ANY (ARRAY[${departements
              .map((d) => `'${d}%'`)
              .join(', ')}])`,
          )
        : null,

    beneficiaires: beneficiaires
      ? Prisma.raw(`EXISTS (
              SELECT 1
              FROM accompagnements acc
              WHERE acc.beneficiaire_id IN (${beneficiaires
                .map((id) => `'${id}'::UUID`)
                .join(', ')})
                AND acc.activite_id = act.id
            ) `)
      : null,
    mediateurs:
      mediateurs && mediateurs.length > 0
        ? Prisma.raw(
            `act.mediateur_id IN (${mediateurs
              .map((id) => `'${id}'::UUID`)
              .join(', ')})`,
          )
        : null,
    conseiller_numerique: conseiller_numerique
      ? conseiller_numerique === '1'
        ? Prisma.raw(`cn.id IS NOT NULL`)
        : Prisma.raw(`cn.id IS NULL`)
      : null,
    rdv: rdv
      ? rdv === '1'
        ? Prisma.raw(`act.rdv_service_public_id IS NOT NULL`)
        : Prisma.raw(`act.rdv_service_public_id IS NULL`)
      : null,
    thematiques:
      thematiques && thematiques.length > 0
        ? Prisma.raw(
            `act.thematiques && ARRAY[${thematiques
              .map((t) => `'${t}'`)
              .join(', ')}]::thematique[]`,
          )
        : null,
    tags:
      tags && tags.length > 0
        ? Prisma.raw(
            `EXISTS (
          SELECT 1
          FROM activite_tags at
          WHERE at.activite_id = act.id
            AND at.tag_id IN (${tags.map((id) => `'${id}'::UUID`).join(', ')})
        )`,
          )
        : null,
    source:
      source === 'v1'
        ? Prisma.raw(`act.v1_cra_id IS NOT NULL`)
        : source === 'v2'
          ? Prisma.raw(`act.v1_cra_id IS NULL`)
          : null,
  }
}

const buildStatusClause = (statuses: RdvStatusFilterValue[]): Sql | null => {
  if (statuses.includes('tous')) {
    // include all values
    return null
  }

  const conditions: Sql[] = [
    statuses.includes('past')
      ? Prisma.raw(`(rdv.status = 'unknown' AND rdv.starts_at < NOW())`)
      : null,
    statuses.includes('seen') ? Prisma.raw(`rdv.status = 'seen'`) : null,
    statuses.includes('noshow') ? Prisma.raw(`rdv.status = 'noshow'`) : null,
    statuses.includes('excused') ? Prisma.raw(`rdv.status = 'excused'`) : null,
    statuses.includes('revoked') ? Prisma.raw(`rdv.status = 'revoked'`) : null,
    statuses.includes('unknown')
      ? Prisma.raw(`(rdv.status = 'unknown' AND rdv.starts_at >= NOW())`)
      : null,
  ].filter(isDefinedAndNotNull)

  return Prisma.join(conditions, ' OR ')
}

export const getRdvFiltersWhereConditions = ({
  du,
  au,
  rdvs,
  beneficiaires,
}: Pick<ActivitesFilters, 'du' | 'au' | 'rdvs' | 'beneficiaires'>): {
  du: any
  au: any
  rdvs: any
  beneficiaires: any
} => {
  const statusClause = rdvs && rdvs.length > 0 ? buildStatusClause(rdvs) : null

  console.log('statusClause', statusClause)
  return {
    du: du ? Prisma.raw(`rdv.starts_at::date >= '${du}'::date`) : null,
    au: au ? Prisma.raw(`rdv.starts_at::date <= '${au}'::date`) : null,
    rdvs: statusClause,
    beneficiaires: beneficiaires
      ? null // TODO implement with RdvAccompagnements and beneficiaires mappings
      : null,
  }
}
