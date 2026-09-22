import type { LieuAReprendre } from './lieu-a-reprendre'
import type { Constat, Mention, Reprise } from './reprise'

export type LieuAuReleve = {
  readonly lieuId: string
  readonly nom: string
  readonly commune: string
  readonly codePostal: string
  readonly publie: boolean
  readonly constats: readonly Constat[]
}

export type CompteParMotif = {
  readonly motif: string
  readonly lieux: number
}

export type Releve = {
  readonly lieuxMesures: number
  readonly colonnes: readonly string[]
  readonly lieux: readonly LieuAuReleve[]
}

const constater =
  (reprises: readonly Reprise[]) =>
  (lieu: LieuAReprendre): readonly LieuAuReleve[] => {
    const constats = reprises.flatMap(
      (reprise) => reprise.constater(lieu) ?? [],
    )

    return constats.length === 0
      ? []
      : [
          {
            lieuId: lieu.id,
            nom: lieu.nom,
            commune: lieu.commune,
            codePostal: lieu.codePostal,
            publie: lieu.publie,
            constats,
          },
        ]
  }

export const relever = (
  reprises: readonly Reprise[],
  lieux: readonly LieuAReprendre[],
): Releve => ({
  lieuxMesures: lieux.length,
  colonnes: reprises.flatMap(({ colonnes }) => colonnes),
  lieux: lieux.flatMap(constater(reprises)),
})

export const mentionsDuLieu = ({
  constats,
}: LieuAuReleve): readonly Mention[] =>
  constats.flatMap(({ mentions }) => mentions)

const motifsDuLieu = (lieu: LieuAuReleve): readonly string[] => [
  ...new Set(mentionsDuLieu(lieu).map(({ motif }) => motif)),
]

const deLaPlusLourde = (
  gauche: CompteParMotif,
  droite: CompteParMotif,
): number => droite.lieux - gauche.lieux

export const comptesParMotif = ({
  lieux,
}: Releve): readonly CompteParMotif[] => {
  const motifs = lieux.flatMap(motifsDuLieu)

  return [...new Set(motifs)]
    .map((motif) => ({
      motif,
      lieux: motifs.filter((releve) => releve === motif).length,
    }))
    .sort(deLaPlusLourde)
}
