export const nomAffiche = ({
  prenom,
  nom,
  nomComplet,
  courriel,
}: {
  readonly prenom: string | null
  readonly nom: string | null
  readonly nomComplet: string | null
  readonly courriel: string
}): string => `${prenom ?? ''} ${nom ?? ''}`.trim() || nomComplet || courriel
