import { toTitleCase } from '@/libraries/texte'

export const nomDuLieuAFusionner = (nom: string): string =>
  toTitleCase(nom, { noUpper: true })

export const lieuxAFusionnerAffiches = <
  Lieu extends {
    readonly nom: string
    readonly adresse: string
    readonly commune: string
  },
  Resultat extends { readonly structures: readonly Lieu[] },
>(
  resultat: Resultat,
): Resultat => ({
  ...resultat,
  structures: resultat.structures.map((lieu) => ({
    ...lieu,
    nom: nomDuLieuAFusionner(lieu.nom),
    commune: toTitleCase(lieu.commune),
    adresse: toTitleCase(lieu.adresse, { noUpper: true }),
  })),
})
