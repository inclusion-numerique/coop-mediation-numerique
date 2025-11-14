type SaveTagModalVariant = {
  checkVariant: (
    isMediateur: boolean,
    isCoordinateur: boolean,
    tagId?: string | null,
  ) => boolean
  title: (nom?: string | null) => string
  content?: string
  selectVisibility?: (isMediateur: boolean, isCoordinateur: boolean) => boolean
  info?: (isCoordinateur: boolean) => string | null
  cancelButtonLabel: string
  submitButtonLabel: string
}

const variants: SaveTagModalVariant[] = [
  {
    checkVariant: (_1: boolean, _2: boolean, tagId?: string | null) =>
      tagId != null,
    title: (nom?: string | null) => `Modifier le tag ‘${nom}’`,
    selectVisibility: (_: boolean, isCoordinateur: boolean) => isCoordinateur,
    cancelButtonLabel: 'Annuler les modifications',
    submitButtonLabel: 'Enregistrer',
  },
  {
    checkVariant: (_: boolean, isCoordinateur: boolean) => isCoordinateur,
    title: () => 'Créer un tag',
    content: 'Créez un tag personnel ou départemental.',
    selectVisibility: () => true,
    cancelButtonLabel: 'Annuler',
    submitButtonLabel: 'Créer',
  },
  {
    checkVariant: (isMediateur: boolean) => isMediateur,
    title: () => 'Créer un tag personnalisé',
    content:
      'Ce tag vous permettra de lier vos comptes rendus d’activité à des thématiques spécifiques / dispositifs locaux que vous avez besoin de suivre dans vos statistiques.',
    cancelButtonLabel: 'Annuler',
    submitButtonLabel: 'Créer',
  },
]

const matchingRole =
  (isMediateur: boolean, isCoordinateur: boolean, tagId?: string | null) =>
  (tagModalVariant: SaveTagModalVariant) =>
    tagModalVariant.checkVariant(isMediateur, isCoordinateur, tagId)

export const saveTagModalVariants = (
  isMediateur: boolean,
  isCoordinateur: boolean,
  tagId?: string | null,
) => {
  const variant = variants.find(
    matchingRole(isMediateur, isCoordinateur, tagId),
  )

  if (variant == null) {
    throw new Error('Combinaison de rôles non supportée')
  }

  return variant
}
