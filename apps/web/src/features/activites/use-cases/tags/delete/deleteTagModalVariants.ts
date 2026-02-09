import { TagScope } from '../tagScope'

type DeleteTagModalVariant = {
  checkScope: (scope: TagScope) => boolean
  title: (nom: string) => string
  description: (nom: string) => string
}

const variants: DeleteTagModalVariant[] = [
  {
    checkScope: (scope: TagScope) => scope === TagScope.Personnel,
    title: (nom: string) => `Supprimer le tag personnel '${nom}'`,
    description: (nom: string) =>
      `Êtes-vous sûr de vouloir supprimer le tag '${nom}' ? Vous ne pourrez plus l’utiliser dans vos compte-rendu d’activités et il ne sera plus disponible pour filtrer vos statistiques.`,
  },
  {
    checkScope: (scope: TagScope) => scope === TagScope.Equipe,
    title: (nom: string) => `Supprimer le tag d'équipe '${nom}'`,
    description: (nom: string) =>
      `Êtes-vous sûr de vouloir supprimer le tag '${nom}' ? Il ne sera plus disponible pour filtrer les statistiques et ne sera plus visible par les membres de votre équipe.`,
  },
  {
    checkScope: (scope: TagScope) => scope === TagScope.Departemental,
    title: (nom: string) => `Supprimer le tag départemental '${nom}'`,
    description: (nom: string) =>
      `Êtes-vous sûr de vouloir supprimer le tag '${nom}' ? Il ne sera plus disponible pour filtrer les statistiques et ne sera plus visible par l'ensemble des médiateurs numériques du département.`,
  },
]

const matchingRole =
  (scope: TagScope) => (tagModalVariant: DeleteTagModalVariant) =>
    tagModalVariant.checkScope(scope)

export const deleteTagModalVariants = (scope: TagScope) => {
  const variant = variants.find(matchingRole(scope))

  if (variant == null) {
    throw new Error('Combinaison de rôles non supportée')
  }
  return variant
}
