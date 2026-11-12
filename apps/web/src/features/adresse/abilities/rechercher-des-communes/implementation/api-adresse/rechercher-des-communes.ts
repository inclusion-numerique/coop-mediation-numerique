'use client'

import {
  searchAdresses,
  siIndisponible,
} from '@app/web/external-apis/apiAdresse'
import { premierCodePostal } from './premier-code-postal'

export type Commune = {
  readonly id: string
  readonly label: string
  readonly commune: string
  readonly codePostal: string
  readonly codeInsee: string
  readonly nom: string
  readonly contexte: string
  readonly latitude: number
  readonly longitude: number
}

export const rechercherDesCommunes = async (
  texte: string,
): Promise<readonly Commune[]> => {
  const adresses = await searchAdresses(texte, {
    limit: 10,
    autocomplete: true,
    type: 'municipality',
  }).catch(siIndisponible([]))

  return adresses.map((adresse) => ({
    id: adresse.properties.id,
    label: `${adresse.properties.label} · ${adresse.properties.postcode}`,
    commune: adresse.properties.city,
    codePostal: premierCodePostal(adresse.properties.postcode),
    codeInsee: adresse.properties.citycode,
    nom: adresse.properties.name,
    contexte: adresse.properties.context,
    latitude: adresse.geometry.coordinates[1],
    longitude: adresse.geometry.coordinates[0],
  }))
}
