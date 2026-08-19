import type { Lieu, LieuId } from '../../../domain/lieu'
import type { Motif } from '../../../domain/motif'
import type { MotifId } from '../../../domain/motif-id'
import type { Rdv } from '../../../domain/rdv'
import type { RdvId } from '../../../domain/rdv-id'
import type { Usager } from '../../../domain/usager'
import type { UsagerId } from '../../../domain/usager-id'
import {
  lieuModifie,
  motifModifie,
  rdvModifie,
  usagerModifie,
} from './changements'
import { type PlanModele, planifierModele } from './plan-modele'

/** Les motifs, lieux et usagers arrivent portés par les rendez-vous eux-mêmes. */
const motifsDe = (rdvs: readonly Rdv[]): readonly Motif[] =>
  rdvs.map((rdv) => rdv.motif).filter((motif) => motif !== null)

const lieuxDe = (rdvs: readonly Rdv[]): readonly Lieu[] =>
  rdvs.map((rdv) => rdv.lieu).filter((lieu) => lieu !== null)

const usagersDe = (rdvs: readonly Rdv[]): readonly Usager[] =>
  rdvs.flatMap((rdv) =>
    rdv.participations.map((participation) => participation.usager),
  )

export type EtatConnu = {
  readonly rdvs: ReadonlyMap<RdvId, Rdv>
  readonly motifs: ReadonlyMap<MotifId, Motif>
  readonly lieux: ReadonlyMap<LieuId, Lieu>
  readonly usagers: ReadonlyMap<UsagerId, Usager>
}

export type DejaTraites = {
  readonly motifs: ReadonlySet<MotifId>
  readonly lieux: ReadonlySet<LieuId>
  readonly usagers: ReadonlySet<UsagerId>
}

export type PlanLot = {
  readonly rdvs: PlanModele<Rdv>
  readonly motifs: PlanModele<Motif>
  readonly lieux: PlanModele<Lieu>
  readonly usagers: PlanModele<Usager>
}

/**
 * Plan d'un lot de rendez-vous. L'ordre d'application est imposé par les clés
 * étrangères — usagers, lieux et motifs avant les rendez-vous qui les désignent —
 * mais la décision, elle, se prend d'un seul coup.
 */
export const planifierLot = ({
  recus,
  connu,
  dejaTraites,
}: {
  recus: readonly Rdv[]
  connu: EtatConnu
  dejaTraites: DejaTraites
}): PlanLot => ({
  rdvs: planifierModele({
    recus,
    connus: connu.rdvs,
    cle: (rdv) => rdv.id,
    modifie: rdvModifie,
  }),
  motifs: planifierModele({
    recus: motifsDe(recus),
    connus: connu.motifs,
    cle: (motif) => motif.id,
    modifie: motifModifie,
    dejaTraites: dejaTraites.motifs,
  }),
  lieux: planifierModele({
    recus: lieuxDe(recus),
    connus: connu.lieux,
    cle: (lieu) => lieu.id,
    modifie: lieuModifie,
    dejaTraites: dejaTraites.lieux,
  }),
  usagers: planifierModele({
    recus: usagersDe(recus),
    connus: connu.usagers,
    cle: (usager) => usager.id,
    modifie: usagerModifie,
    dejaTraites: dejaTraites.usagers,
  }),
})

/**
 * Rendez-vous que La Coop détient et que RDV Service Public ne renvoie plus.
 *
 * Ils sont supprimés, et non conservés : un rendez-vous disparu de chez eux n'a
 * pas été annulé — l'annulation, elle, arrive avec un `cancelled_at` — il a été
 * effacé, et le garder afficherait un rendez-vous qui n'existe pour personne.
 */
export const rdvsASupprimer = ({
  enBase,
  recus,
}: {
  enBase: readonly RdvId[]
  recus: readonly Rdv[]
}): readonly RdvId[] => {
  const idsRecus = new Set(recus.map((rdv) => rdv.id))

  return enBase.filter((id) => !idsRecus.has(id))
}
