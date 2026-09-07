import type { AdresseBanData } from '@app/web/external-apis/ban/AdresseBanValidation'
import type { SaisieDeSection } from '../action/modifier-la-fiche-du-lieu.validation'
import type { InformationsGeneralesFormData } from './components/informationsGeneralesFormData'

type Saisie = Extract<SaisieDeSection, { section: 'InformationsGenerales' }>

/**
 * Ce que le formulaire soumet, depuis ce qu'il porte à l'écran.
 *
 * Deux natures de lieu, que le SIRET sépare. Avec SIRET : il vient de l'Annuaire
 * des entreprises, seul à pouvoir l'attester, et il emporte le nom et l'adresse
 * de l'établissement — le médiateur qui veut paraître sous un autre nom dispose
 * du nom d'usage. Sans SIRET : le nom se saisit librement, l'adresse aussi, et
 * le nom d'usage n'a plus d'objet.
 *
 * Dans les deux cas l'adresse a été reconnue par la Base Adresse Nationale :
 * celle de l'Annuaire y est géocodée au moment de choisir l'établissement,
 * exactement comme celle que l'on cherche soi-même.
 *
 * Le RNA repart tel qu'il est venu. Aucun champ ne l'édite — il vient des
 * imports cartographiques — et ne pas le renvoyer l'effacerait.
 */
export const informationsGeneralesSoumises = ({
  noSiret,
  siretSearch,
  adresseBan,
  nom,
  nomUsage,
  rna,
  lieuItinerant,
  complementAdresse,
  typologies,
}: InformationsGeneralesFormData & {
  readonly adresseBan: AdresseBanData
}): Saisie => ({
  section: 'InformationsGenerales',
  nom,
  adresseBan,
  complementAdresse,
  // L'itinérance ne se déclare que pour un lieu sans immatriculation.
  lieuItinerant: noSiret ? lieuItinerant : null,
  typologies,
  siret: noSiret ? null : (siretSearch?.siret ?? null),
  rna,
  nomUsage: noSiret ? null : nomUsage,
})
