import type { ColonneDeListe, LieuATrier } from './lieu-a-trier'
import { LISTES } from './lieu-a-trier'
import { colonnesATrier } from './listes-a-trier'

export type LieuDuReleve = {
  readonly lieuId: string
  readonly nom: string
  readonly commune: string
  readonly codePostal: string
  readonly publie: boolean
  readonly colonnes: readonly ColonneDeListe[]
}

export type ColonneDuReleve = {
  readonly colonne: ColonneDeListe
  readonly lieux: number
}

export type Releve = {
  readonly lieuxMesures: number
  readonly colonnes: readonly ColonneDuReleve[]
  readonly lieux: readonly LieuDuReleve[]
}

const auReleve = (lieu: LieuATrier): readonly LieuDuReleve[] => {
  const colonnes = colonnesATrier(lieu)

  return colonnes.length === 0
    ? []
    : [
        {
          lieuId: lieu.id,
          nom: lieu.nom,
          commune: lieu.commune,
          codePostal: lieu.codePostal,
          publie: lieu.publie,
          colonnes,
        },
      ]
}

const compter = (
  lieux: readonly LieuDuReleve[],
  colonne: ColonneDeListe,
): ColonneDuReleve => ({
  colonne,
  lieux: lieux.filter(({ colonnes }) => colonnes.includes(colonne)).length,
})

const deLaPlusLourde = (
  gauche: ColonneDuReleve,
  droite: ColonneDuReleve,
): number => droite.lieux - gauche.lieux

export const relever = (lieux: readonly LieuATrier[]): Releve => {
  const aTrier = lieux.flatMap(auReleve)

  return {
    lieuxMesures: lieux.length,
    colonnes: LISTES.map((colonne) => compter(aTrier, colonne))
      .filter(({ lieux: touches }) => touches > 0)
      .sort(deLaPlusLourde),
    lieux: aTrier,
  }
}
