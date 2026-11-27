import type { MotifId } from '../../../domain/identifiants/motif-id'
import type { RdvId } from '../../../domain/identifiants/rdv-id'
import type { UsagerId } from '../../../domain/identifiants/usager-id'
import type { Lieu, LieuId } from '../../../domain/rdv/lieu'
import type { Motif } from '../../../domain/rdv/motif'
import type { Rdv } from '../../../domain/rdv/rdv'
import type { Usager } from '../../../domain/usager'
import {
  lieuModifie,
  motifModifie,
  rdvModifie,
  usagerModifie,
} from './changements'
import { type PlanModele, planifierModele } from './plan-modele'

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
    dejaTraites: new Set(),
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
