import { Prisma } from '@app/web/generated/prisma/client'
import type { CriteresDesStatistiques, STATUTS_DE_RENDEZ_VOUS } from '../domain'
import {
  conditionsCommunes,
  enBase,
  enConjonction,
  type FiltreDesConseillersNumeriques,
  siDefini,
  siNonVide,
} from './criteres-des-activites.sql'

export type StatutDeRendezVousFourni =
  | 'unknown'
  | 'passe'
  | 'seen'
  | 'revoked'
  | 'excused'
  | 'noshow'

export type RendezVousAuxStatuts = (
  statuts: readonly StatutDeRendezVousFourni[],
) => Prisma.Sql

const STATUT_FOURNI: Readonly<
  Record<(typeof STATUTS_DE_RENDEZ_VOUS)[number], StatutDeRendezVousFourni>
> = {
  AVenir: 'unknown',
  Passe: 'passe',
  Honore: 'seen',
  Annule: 'revoked',
  AnnuleParLeBeneficiaire: 'excused',
  Absent: 'noshow',
}

export const filtreDesStatistiques = (
  criteres: CriteresDesStatistiques,
  dependances: {
    readonly conseillersNumeriques: FiltreDesConseillersNumeriques
    readonly rendezVousAuxStatuts: RendezVousAuxStatuts
  },
): Prisma.Sql =>
  enConjonction([
    ...siDefini(
      criteres.periode.du,
      (du) => Prisma.sql`act.date::date >= ${du}::date`,
    ),
    ...siDefini(
      criteres.periode.au,
      (au) => Prisma.sql`act.date::date <= ${au}::date`,
    ),
    ...conditionsCommunes(criteres, dependances),
    ...siNonVide(
      criteres.statutsDeRendezVous,
      (statuts) =>
        Prisma.sql`act.rdv_id IN (${dependances.rendezVousAuxStatuts(
          statuts.map(enBase(STATUT_FOURNI)),
        )})`,
    ),
  ])
