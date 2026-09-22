import type { ColonneDeListe, LieuAReprendre } from './lieu-a-reprendre'
import { LISTES } from './lieu-a-reprendre'
import { colonnesATrier } from './listes-a-trier'

export type LieuAuxListesATrier = {
  readonly lieuId: string
  readonly nom: string
  readonly commune: string
  readonly codePostal: string
  readonly publie: boolean
  readonly colonnes: readonly ColonneDeListe[]
}

export type ColonneATrier = {
  readonly colonne: ColonneDeListe
  readonly lieux: number
}

export type ListesATrier = {
  readonly colonnes: readonly ColonneATrier[]
  readonly lieux: readonly LieuAuxListesATrier[]
}

export type Releve = {
  readonly lieuxMesures: number
  readonly listesATrier: ListesATrier
}

const auReleve = (lieu: LieuAReprendre): readonly LieuAuxListesATrier[] => {
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
  lieux: readonly LieuAuxListesATrier[],
  colonne: ColonneDeListe,
): ColonneATrier => ({
  colonne,
  lieux: lieux.filter(({ colonnes }) => colonnes.includes(colonne)).length,
})

const deLaPlusLourde = (gauche: ColonneATrier, droite: ColonneATrier): number =>
  droite.lieux - gauche.lieux

const listesATrier = (lieux: readonly LieuAReprendre[]): ListesATrier => {
  const aTrier = lieux.flatMap(auReleve)

  return {
    colonnes: LISTES.map((colonne) => compter(aTrier, colonne))
      .filter(({ lieux: touches }) => touches > 0)
      .sort(deLaPlusLourde),
    lieux: aTrier,
  }
}

export const relever = (lieux: readonly LieuAReprendre[]): Releve => ({
  lieuxMesures: lieux.length,
  listesATrier: listesATrier(lieux),
})
