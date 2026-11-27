import { describe, expect, test } from 'vitest'
import { communeDuResultat } from '@/features/beneficiaire/abilities/creer-ou-fusionner-depuis-usager-externe/implementations/ban/champs-de-commune-depuis-l-adresse.transfer'
import { CommuneResidence } from '@/features/beneficiaire/domain/commune-residence'
import type { Feature } from '@/libraries/ban'

const evreuxFeature: Feature = {
  type: 'Feature',
  geometry: { type: 'Point', coordinates: [1.15, 49.02] },
  properties: {
    label: '12 Rue de la Paix 27000 Évreux',
    score: 0.9,
    housenumber: '12',
    id: '27229_xxxx_00012',
    type: 'housenumber',
    name: '12 Rue de la Paix',
    postcode: '27000',
    citycode: '27229',
    x: 0,
    y: 0,
    city: 'Évreux',
    context: '27, Eure, Normandie',
    importance: 0.5,
    street: 'Rue de la Paix',
  },
}

describe('communeDuResultat', () => {
  test('maps a BAN feature to the commune trio', () => {
    expect(communeDuResultat(evreuxFeature)).toEqual(
      CommuneResidence({
        commune: 'Évreux',
        codePostal: '27000',
        codeInsee: '27229',
      }),
    )
  })

  test('returns null when the address is not geocoded', () => {
    expect(communeDuResultat(null)).toBeNull()
  })
})
