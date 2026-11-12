import { Prisma } from '@app/web/generated/prisma/client'
import { prismaClient } from '@app/web/prismaClient'
import {
  activiteConsulteeDe,
  activiteConsulteeSelect,
  rdvIdsDes,
} from '../../../../db/activite-consultee.transfer'
import {
  type FiltreDesConseillersNumeriques,
  filtreDesActivites,
} from '../../../../db/criteres-des-activites.sql'
import {
  type RendezVousFourni,
  type RendezVousLies,
  rendezVousDeLaChronologie,
  type StatutFourni,
} from '../../../../db/rendez-vous-fournis'
import {
  type ChronologieDesActivites,
  type ContenuDeLaChronologie,
  type CriteresDesActivites,
  Effectif,
  type ElementDeChronologie,
  type MediateurId,
  type OrdreChronologique,
  type Pagination,
  type Periode,
  RdvId,
  type StatutDeRendezVous,
} from '../../../../domain'

export type RendezVousALister = {
  readonly comptes: readonly number[]
  readonly selection: (parametres: {
    readonly comptes: readonly number[]
    readonly periode: Periode | null
    readonly statuts: readonly StatutFourni[]
  }) => Prisma.Sql
  readonly parIds: (
    ids: readonly RdvId[],
  ) => Promise<readonly RendezVousFourni[]>
}

const STATUT_FOURNI: Readonly<
  Record<
    | 'AVenir'
    | 'Passe'
    | 'Honore'
    | 'Annule'
    | 'AnnuleParLeBeneficiaire'
    | 'Absent',
    StatutFourni
  >
> = {
  AVenir: 'unknown',
  Passe: 'passe',
  Honore: 'seen',
  Annule: 'revoked',
  AnnuleParLeBeneficiaire: 'excused',
  Absent: 'noshow',
}

const statutFourni =
  <K extends string>(table: Readonly<Record<K, StatutFourni>>) =>
  (statut: K): StatutFourni =>
    table[statut]

const SENS: Readonly<Record<'PlusRecentes' | 'PlusAnciennes', Prisma.Sql>> = {
  PlusRecentes: Prisma.sql`DESC`,
  PlusAnciennes: Prisma.sql`ASC`,
}

const sensDe =
  <K extends string>(table: Readonly<Record<K, Prisma.Sql>>) =>
  (ordre: K): Prisma.Sql =>
    table[ordre]

const AUCUN_RENDEZ_VOUS = Prisma.sql`SELECT NULL::int AS id, NULL::timestamp AS moment, NULL::timestamp AS creation WHERE FALSE`

const lit = (
  contenu: ContenuDeLaChronologie,
  nature: 'Activites' | 'RendezVous',
): boolean =>
  contenu === 'ActivitesEtRendezVous' ||
  (nature === 'Activites' && contenu === 'ActivitesSeules') ||
  (nature === 'RendezVous' && contenu === 'RendezVousSeuls')

type Element = {
  readonly nature: 'Activite' | 'RendezVous'
  readonly id: string
}

export const listerMesActivites = async ({
  mediateurId,
  criteres,
  pagination: { page, lignesParPage },
  ordre,
  contenu,
  rendezVous,
  rendezVousLies,
  conseillersNumeriques,
}: {
  readonly mediateurId: MediateurId
  readonly criteres: CriteresDesActivites
  readonly pagination: Pagination
  readonly ordre: OrdreChronologique
  readonly contenu: ContenuDeLaChronologie
  readonly rendezVous: RendezVousALister | null
  readonly rendezVousLies: RendezVousLies
  readonly conseillersNumeriques: FiltreDesConseillersNumeriques
}): Promise<ChronologieDesActivites> => {
  const sens = sensDe(SENS)(ordre)
  const activitesRetenues = Prisma.sql`
    SELECT act.id::text AS id, act.date AS moment, act.creation AS creation,
           act.accompagnements_count AS accompagnements
    FROM activites act
      LEFT JOIN lieu_inclusion str ON str.id = act.structure_id
      LEFT JOIN mediateurs med ON med.id = act.mediateur_id
      LEFT JOIN users u ON u.id = med.user_id
    WHERE ${lit(contenu, 'Activites')}
      AND act.mediateur_id = ${mediateurId}::uuid
      AND act.suppression IS NULL
      AND ${filtreDesActivites(criteres, { conseillersNumeriques })}`
  const selectionDesRendezVous =
    rendezVous === null || !lit(contenu, 'RendezVous')
      ? AUCUN_RENDEZ_VOUS
      : rendezVous.selection({
          comptes: rendezVous.comptes,
          periode: criteres.periode,
          statuts: criteres.statutsDeRendezVous.map(
            (statut: StatutDeRendezVous) => statutFourni(STATUT_FOURNI)(statut),
          ),
        })
  const rendezVousRetenus = Prisma.sql`
    SELECT r.id::text AS id, r.moment, r.creation
    FROM (${selectionDesRendezVous}) r
    WHERE NOT EXISTS (SELECT 1 FROM activites a WHERE a.rdv_id = r.id)`

  const [elements, [activites], [rendezVousComptes]] = await Promise.all([
    prismaClient.$queryRaw<Element[]>`
      WITH activites_retenues AS (${activitesRetenues}),
           rendez_vous_retenus AS (${rendezVousRetenus})
      SELECT nature, id FROM (
        SELECT 'Activite' AS nature, id, moment, creation FROM activites_retenues
        UNION ALL
        SELECT 'RendezVous' AS nature, id, moment, creation FROM rendez_vous_retenus
      ) elements
      ORDER BY moment ${sens}, creation ${sens}, id ${sens}
      LIMIT ${lignesParPage} OFFSET ${(page - 1) * lignesParPage}`,
    prismaClient.$queryRaw<{ total: number; accompagnements: number }[]>`
      SELECT COUNT(*)::int AS total,
             COALESCE(SUM(accompagnements), 0)::int AS accompagnements
      FROM (${activitesRetenues}) activites_retenues`,
    prismaClient.$queryRaw<{ total: number }[]>`
      SELECT COUNT(*)::int AS total FROM (${rendezVousRetenus}) rendez_vous_retenus`,
  ])

  const idsDActivites = elements
    .filter(({ nature }) => nature === 'Activite')
    .map(({ id }) => id)
  const idsDeRendezVous = elements
    .filter(({ nature }) => nature === 'RendezVous')
    .map(({ id }) => RdvId(Number(id)))

  const [lignes, rendezVousDeLaPage] = await Promise.all([
    prismaClient.activite.findMany({
      where: { id: { in: idsDActivites } },
      select: activiteConsulteeSelect,
    }),
    rendezVous === null || idsDeRendezVous.length === 0
      ? Promise.resolve([])
      : rendezVous.parIds(idsDeRendezVous),
  ])
  const lies = await rendezVousLies(rdvIdsDes(lignes).map(RdvId))

  const elementDe = ({ nature, id }: Element): ElementDeChronologie[] => {
    const ligne = lignes.find((candidate) => candidate.id === id)
    const rdv = rendezVousDeLaPage.find(
      (candidat) => String(candidat.id) === id,
    )
    if (nature === 'Activite' && ligne !== undefined)
      return [{ _tag: 'Activite', activite: activiteConsulteeDe(ligne, lies) }]
    if (nature === 'RendezVous' && rdv !== undefined)
      return [
        { _tag: 'RendezVous', rendezVous: rendezVousDeLaChronologie(rdv) },
      ]
    return []
  }

  const totalActivites = activites?.total ?? 0
  const totalRendezVous = rendezVousComptes?.total ?? 0

  return {
    elements: elements.flatMap(elementDe),
    total: {
      activites: Effectif(totalActivites),
      rendezVous: Effectif(totalRendezVous),
      accompagnements: Effectif(activites?.accompagnements ?? 0),
    },
    pages: Effectif(
      Math.ceil((totalActivites + totalRendezVous) / lignesParPage),
    ),
  }
}
