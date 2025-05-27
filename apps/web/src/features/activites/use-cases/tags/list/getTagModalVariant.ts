type TagModalVariant = {
  checkRole: (isMediateur: boolean, isCoordinateur: boolean) => boolean
  title: string
  description: string
  selectVisibility?: boolean
}

const tagModalVariants: TagModalVariant[] = [
  {
    checkRole: (isMediateur: boolean, isCoordinateur: boolean) =>
      isMediateur && isCoordinateur,
    title: 'Créer un tag',
    description: 'Créez un tag personnel ou départemental.',
    selectVisibility: true,
  },
  {
    checkRole: (isMediateur: boolean) => isMediateur,
    title: 'Créer un tag personnalisé',
    description:
      'Ce tag vous permettra de lier vos compte-rendus d’activités à des thématiques spécifiques / dispositifs locaux que vous avez besoin de suivre dans vos statistiques.',
  },
  {
    checkRole: (_: boolean, isCoordinateur: boolean) => isCoordinateur,
    title: 'Créer un tag départemental',
    description:
      'Ce tag sera visible par l’ensemble des médiateurs numériques du département pour leur permettre de lier leurs compte-rendus d’activités à des thématiques spécifiques / dispositifs locaux que vous avez besoin de suivre dans vos statistiques.',
  },
]

const matchingRole =
  (isMediateur: boolean, isCoordinateur: boolean) =>
  (tagModalVariant: TagModalVariant) =>
    tagModalVariant.checkRole(isMediateur, isCoordinateur)

export const getTagModalVariant = (
  isMediateur: boolean,
  isCoordinateur: boolean,
) => {
  const variant = tagModalVariants.find(
    matchingRole(isMediateur, isCoordinateur),
  )

  if (!variant) throw new Error('Unhandled role combination')

  return variant
}
