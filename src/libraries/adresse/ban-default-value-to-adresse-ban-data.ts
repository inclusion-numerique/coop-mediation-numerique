import type { DefaultValues } from 'react-hook-form'
import type { AdresseBanData } from '@/libraries/adresse/adresse-ban-validation'

// Used to be typesafe in UI form display of default values
export const banDefaultValueToAdresseBanData = ({
  codeInsee,
  codePostal,
  label,
  contexte,
  id,
  longitude,
  latitude,
  nom,
  commune,
}: DefaultValues<AdresseBanData>): AdresseBanData => ({
  id: id ?? codeInsee ?? '',
  codeInsee: codeInsee ?? '',
  codePostal: codePostal ?? '',
  label: label ?? `${commune ?? ''} · ${codePostal}`,
  contexte: contexte ?? '',
  longitude: longitude ?? 0,
  latitude: latitude ?? 0,
  nom: nom ?? '',
  commune: commune ?? '',
})
