import {
  Adresse,
  Localisation,
  Nom,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import { describe, expect, it } from 'vitest'
import { IdentifiantCartographie } from '../../../../domain/cartographie-nationale/ids-cartographie-nationale'
import { BanId } from '../../../../domain/identifiants/ban-id'
import { LieuId } from '../../../../domain/identifiants/lieu-id'
import { lieuDemandeDepuisLeLieuDesire } from './lieu-desire.transfer'

const LIEU = '0927f824-b84d-4840-ae2e-e4a96a7a519b'

const aCreer = {
  nom: 'Tiers-lieu du Port',
  siret: null,
  adresse: '12 quai du Port',
  commune: 'Rochefort',
  codePostal: '17300',
  codeInsee: '17299',
  banId: '17299_0123_00012',
  latitude: 45.94,
  longitude: -0.96,
}

describe('le lieu demandé depuis un lieu désiré', () => {
  it('désigne par son identité interne un lieu connu de la coop', () => {
    expect(
      lieuDemandeDepuisLeLieuDesire({
        id: LIEU,
        nom: 'Tiers-lieu du Port',
        structureCartographieNationaleId: 'c-1',
      }),
    ).toEqual({
      id: LieuId(LIEU),
      nom: Nom('Tiers-lieu du Port'),
      structureCartographieNationaleId: IdentifiantCartographie('c-1'),
    })
  })

  it('porte l’adresse, la position et l’identifiant BAN validés d’un lieu à créer', () => {
    expect(lieuDemandeDepuisLeLieuDesire(aCreer)).toEqual({
      nom: Nom('Tiers-lieu du Port'),
      siret: null,
      structureCartographieNationaleId: null,
      adresse: Adresse({
        voie: '12 quai du Port',
        commune: 'Rochefort',
        code_postal: '17300',
        code_insee: '17299',
      }),
      localisation: Localisation({ latitude: 45.94, longitude: -0.96 }),
      banId: BanId('17299_0123_00012'),
    })
  })

  it('refuse un lieu à créer dont l’adresse n’a pas été validée', () => {
    expect(() =>
      lieuDemandeDepuisLeLieuDesire({ ...aCreer, banId: '' }),
    ).toThrow()
  })
})
