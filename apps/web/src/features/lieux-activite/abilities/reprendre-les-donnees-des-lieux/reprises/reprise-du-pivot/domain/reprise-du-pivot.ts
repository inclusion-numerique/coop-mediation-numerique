import {
  type LieuAReprendre,
  nonVide,
  type Reprise,
  reprise,
} from '../../../domain'

const COLONNE = 'rna'

const A_EFFACER = 'à effacer'

export type EffacerLeRna = (lieuId: string) => Promise<void>

const rnaDevenuOrphelin = (lieu: LieuAReprendre): string | null =>
  nonVide(lieu.rna)

export const repriseDuPivot = (effacerLeRna: EffacerLeRna): Reprise =>
  reprise<string>({
    colonnes: [COLONNE],
    constater: rnaDevenuOrphelin,
    mentions: (rna) => [
      {
        colonne: COLONNE,
        cellule: rna,
        motif: `${COLONNE} : ${A_EFFACER}`,
      },
    ],
    appliquer: (lieuId) => effacerLeRna(lieuId),
  })
