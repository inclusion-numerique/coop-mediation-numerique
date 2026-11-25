export const CONFIRMATION_DU_PARTAGE_MANQUANTE =
  'Confirmez que cette modification vaut pour toutes les personnes qui travaillent sur ce lieu, ou créez un nouveau lieu.'

export const confirmationDuPartageManquante = ({
  partage,
  confirmation,
}: {
  readonly partage: boolean
  readonly confirmation: boolean | null
}): boolean => partage && confirmation !== true
