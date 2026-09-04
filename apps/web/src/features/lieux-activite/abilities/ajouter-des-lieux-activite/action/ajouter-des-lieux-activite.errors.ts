import type { EchecDAjout } from '../domain'

/** Ce que l'utilisateur lit quand l'ajout n'a pas lieu. */
export const AJOUTER_DES_LIEUX_ACTIVITE_ERRORS: Record<
  EchecDAjout['_tag'],
  string
> = {
  MediateurRequis:
    'Seul un médiateur peut ajouter des lieux d’activité à son profil.',
  PanierVide: 'Veuillez sélectionner au moins un lieu d’activité.',
  AdresseNonValidee:
    'L’adresse de ce lieu est introuvable dans la Base Adresse Nationale. Créez-le en saisissant son adresse.',
}
