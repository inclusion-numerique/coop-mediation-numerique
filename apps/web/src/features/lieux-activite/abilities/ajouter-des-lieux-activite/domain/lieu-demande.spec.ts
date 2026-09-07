import {
  Adresse,
  Localisation,
  Nom,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import { BanId } from '../../../domain/ban-id'
import { LieuId } from '../../../domain/lieu-id'
import { estExistant } from './lieu-demande'

const identite = { nom: Nom('Tiers-lieu du Port') }

describe('la nature d’un lieu demandé', () => {
  /** La seule chose qui les sépare : sait-on de quel lieu de la coop il s'agit ? */
  it('est existante quand la demande porte une identité interne', () => {
    expect(
      estExistant({
        ...identite,
        id: LieuId('0927f824-b84d-4840-ae2e-e4a96a7a519b'),
      }),
    ).toBe(true)
  })

  it('est à créer quand elle porte une adresse validée et pas d’identité', () => {
    expect(
      estExistant({
        ...identite,
        adresse: Adresse({
          voie: '12 quai du Port',
          commune: 'Rochefort',
          code_postal: '17300',
          code_insee: '17299',
        }),
        localisation: Localisation({ latitude: 45.94, longitude: -0.96 }),
        banId: BanId('17299_0123_00012'),
      }),
    ).toBe(false)
  })
})
