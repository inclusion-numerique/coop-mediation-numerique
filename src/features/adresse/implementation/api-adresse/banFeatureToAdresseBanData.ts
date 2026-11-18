import type { Feature } from '@/configuration/ban/apiAdresse'
import type { AdresseBanData } from '@/features/adresse/domain/AdresseBanValidation'

export const banFeatureToAdresseBanData = ({
  properties: { label, id, city, citycode, context, name, postcode },
  geometry: {
    coordinates: [longitude, latitude],
  },
}: Feature): AdresseBanData => ({
  id,
  label,
  codePostal: postcode,
  codeInsee: citycode,
  commune: city,
  nom: name,
  contexte: context,
  longitude,
  latitude,
})
