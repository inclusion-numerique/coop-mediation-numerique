import { ReactNode } from 'react'

type SaveTagModalVariant = {
  checkVariant: (
    isMediateur: boolean,
    isCoordinateur: boolean,
    tagId?: string | null,
  ) => boolean
  title: (nom?: string | null) => string
  content?: ReactNode
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
    content: (
      <>
        Créez un tag personnel ou partagé.{' '}
        <a
          className="fr-link"
          href="https://docs.numerique.gouv.fr/docs/dcade515-17b9-4298-a2e5-bdf3ed22bf96/"
          target="_blank"
          rel="noreferrer"
          title="En savoir à propos des tags (nouvelle fenêtre)"
        >
          En savoir plus
        </a>
      </>
    ),
    selectVisibility: () => true,
    cancelButtonLabel: 'Annuler',
    submitButtonLabel: 'Créer',
  },
  {
    checkVariant: (isMediateur: boolean) => isMediateur,
    title: () => 'Créer un tag',
    content: (
      <>
        Créez un tag personnel ou partagé.{' '}
        <a
          className="fr-link"
          href="https://docs.numerique.gouv.fr/docs/dcade515-17b9-4298-a2e5-bdf3ed22bf96/"
          target="_blank"
          rel="noreferrer"
          title="En savoir à propos des tags (nouvelle fenêtre)"
        >
          En savoir plus
        </a>
      </>
    ),
    selectVisibility: () => true,
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
