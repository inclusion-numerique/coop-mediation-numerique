import type { TypeDePortee } from '../../../domain'

type TexteDeSuppression = {
  readonly titre: string
  readonly description: string
}

const TEXTES: Record<
  Exclude<TypeDePortee, 'National'>,
  (nom: string) => TexteDeSuppression
> = {
  Personnel: (nom) => ({
    titre: `Supprimer le tag personnel '${nom}'`,
    description: `Êtes-vous sûr de vouloir supprimer le tag '${nom}' ? Vous ne pourrez plus l’utiliser dans vos compte-rendu d’activités et il ne sera plus disponible pour filtrer vos statistiques.`,
  }),
  Equipe: (nom) => ({
    titre: `Supprimer le tag d'équipe '${nom}'`,
    description: `Êtes-vous sûr de vouloir supprimer le tag '${nom}' ? Il ne sera plus disponible pour filtrer les statistiques et ne sera plus visible par les membres de votre équipe.`,
  }),
  Departemental: (nom) => ({
    titre: `Supprimer le tag départemental '${nom}'`,
    description: `Êtes-vous sûr de vouloir supprimer le tag '${nom}' ? Il ne sera plus disponible pour filtrer les statistiques et ne sera plus visible par l'ensemble des médiateurs numériques du département.`,
  }),
}

export const texteDeSuppression = (
  portee: TypeDePortee,
  nom: string,
): TexteDeSuppression | null =>
  portee === 'National' ? null : TEXTES[portee](nom)
