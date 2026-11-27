import type { EchecDeAjouterDesLieuxActivite } from '../domain'

export const AJOUTER_DES_LIEUX_ACTIVITE_ERRORS: Record<
  EchecDeAjouterDesLieuxActivite['_tag'],
  string
> = {
  MediateurRequis:
    'Seul un médiateur peut ajouter des lieux d’activité à son profil.',
  PanierVide: 'Veuillez sélectionner au moins un lieu d’activité.',
  AdresseNonValidee:
    'L’adresse de ce lieu est introuvable dans la Base Adresse Nationale. Créez-le en saisissant son adresse.',
  LieuIntrouvable:
    'L’un des lieux choisis n’existe plus. Recherchez-le à nouveau avant de l’ajouter.',
}
