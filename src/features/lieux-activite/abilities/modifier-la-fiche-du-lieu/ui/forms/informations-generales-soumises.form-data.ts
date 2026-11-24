import type { AdresseBanData } from '@/libraries/adresse/adresse-ban-validation'
import type { SaisieDeSection } from '../../action/modifier-la-fiche-du-lieu.validation'
import type { InformationsGeneralesFormData } from './informations-generales.form-data'

type Saisie = Extract<SaisieDeSection, { section: 'InformationsGenerales' }>

export const informationsGeneralesSoumises = ({
  noSiret,
  siretSearch,
  adresseBan,
  nom,
  nomUsage,
  lieuItinerant,
  complementAdresse,
  typologies,
}: Omit<InformationsGeneralesFormData, 'confirmationDuPartage'> & {
  readonly adresseBan: AdresseBanData
}): Saisie => ({
  section: 'InformationsGenerales',
  nom,
  adresseBan,
  complementAdresse,
  lieuItinerant: noSiret ? lieuItinerant : null,
  typologies,
  siret: noSiret ? null : (siretSearch?.siret ?? null),
  nomUsage: noSiret ? null : nomUsage,
})
