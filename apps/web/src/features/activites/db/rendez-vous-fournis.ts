import { NomAffiche } from '@app/web/libraries/nom-affiche'
import {
  Effectif,
  LienAgent,
  NomDuMotif,
  RdvId,
  type RendezVousAffiche,
  type RendezVousDeLaChronologie,
  StatutDeRendezVous,
  TitreDuRendezVous,
} from '../domain'

export type StatutFourni =
  | 'unknown'
  | 'passe'
  | 'seen'
  | 'revoked'
  | 'excused'
  | 'noshow'

export type RendezVousLieFourni = {
  readonly id: number
  readonly statut: StatutFourni
  readonly lienAgent: string
}

export type RendezVousLies = (
  ids: readonly RdvId[],
) => Promise<readonly RendezVousLieFourni[]>

export type RendezVousFourni = RendezVousLieFourni & {
  readonly debut: Date
  readonly fin: Date
  readonly motif: { readonly nom: string; readonly collectif: boolean } | null
  readonly titre: string | null
  readonly places: number | null
  readonly participants: readonly {
    readonly prenom: string | null
    readonly nom: string | null
  }[]
}

const STATUT: Readonly<Record<StatutFourni, StatutDeRendezVous>> = {
  unknown: StatutDeRendezVous('AVenir'),
  passe: StatutDeRendezVous('Passe'),
  seen: StatutDeRendezVous('Honore'),
  revoked: StatutDeRendezVous('Annule'),
  excused: StatutDeRendezVous('AnnuleParLeBeneficiaire'),
  noshow: StatutDeRendezVous('Absent'),
}

const statutDe = (statut: StatutFourni): StatutDeRendezVous => STATUT[statut]

export const rendezVousAffiche = ({
  statut,
  lienAgent,
}: RendezVousLieFourni): RendezVousAffiche => ({
  statut: statutDe(statut),
  lienAgent: LienAgent(lienAgent),
})

export const rendezVousDeLaChronologie = (
  fourni: RendezVousFourni,
): RendezVousDeLaChronologie => ({
  id: RdvId(fourni.id),
  debut: fourni.debut,
  fin: fourni.fin,
  statut: statutDe(fourni.statut),
  motif:
    fourni.motif === null
      ? null
      : {
          nom: NomDuMotif(fourni.motif.nom),
          collectif: fourni.motif.collectif,
        },
  titre: TitreDuRendezVous.safe(fourni.titre ?? ''),
  places: fourni.places === null ? null : Effectif(fourni.places),
  participants: fourni.participants.flatMap(({ prenom, nom }) => {
    const affiche = NomAffiche.safe([prenom, nom].filter(Boolean).join(' '))
    return affiche === null ? [] : [affiche]
  }),
  lienAgent: LienAgent(fourni.lienAgent),
})
