import { getCartographieNationaleSourceLabel } from '@app/web/libraries/cartographie-nationale'
import { type ChampCompare, differences } from '../../domain/differences'
import type { FicheDuLieu } from '../../implementation'
import { affichee, type ValeurAffichee } from './valeur-affichee'

export type DifferenceAffichee = {
  readonly champ: ChampCompare
  readonly libelle: string
  readonly coop: ValeurAffichee
  readonly registre: ValeurAffichee
}

export type RepriseExterne = {
  readonly source: string
  readonly le: Date
  readonly votreDerniereModificationLe: Date
  readonly differences: readonly DifferenceAffichee[]
}

export const repriseExterne = ({
  lieu,
  ficheCoop,
  derniereModificationCoop,
}: FicheDuLieu): RepriseExterne | null => {
  const { derniereModification } = lieu.tracabilite

  if (derniereModification._tag !== 'ParSource') return null

  return {
    source: getCartographieNationaleSourceLabel(derniereModification.source),
    le: derniereModification.date,
    votreDerniereModificationLe: derniereModificationCoop,
    differences: differences(ficheCoop, lieu.fiche).map(
      ({ champ, libelle, coop, registre }) => ({
        champ,
        libelle,
        coop: affichee(champ, coop),
        registre: affichee(champ, registre),
      }),
    ),
  }
}
