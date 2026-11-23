import type { AdresseBanData } from '@/libraries/adresse/AdresseBanValidation'
import type { Feature } from '@/libraries/ban/apiAdresse'

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
