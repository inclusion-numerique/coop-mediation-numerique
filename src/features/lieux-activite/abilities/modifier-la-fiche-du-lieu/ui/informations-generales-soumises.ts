import type { AdresseBanData } from '@/features/adresse/domain/AdresseBanValidation'
import type { SaisieDeSection } from '../action/modifier-la-fiche-du-lieu.validation'
import type { InformationsGeneralesFormData } from './components/informationsGeneralesFormData'

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
