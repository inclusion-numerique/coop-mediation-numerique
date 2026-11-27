import {
  Adresse,
  Localisation,
  Nom,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import { describe, expect, it } from 'vitest'
import { BanId } from '../../../domain/identifiants/ban-id'
import { LieuId } from '../../../domain/identifiants/lieu-id'
import { lieuDemande } from './lieu-desire.transfer'

const CONNU = '0927f824-b84d-4840-ae2e-e4a96a7a519b'

const adresse = {
  adresse: Adresse({
    voie: '12 quai du Port',
    commune: 'Rochefort',
    code_postal: '17300',
    code_insee: '17299',
  }),
  localisation: Localisation({ latitude: 45.94, longitude: -0.96 }),
  banId: BanId('17299_0123_00012'),
}

describe('un lieu désiré devient une demande de lieu', () => {
  it('désigne un lieu connu par son identifiant', () => {
    expect(
      lieuDemande({
        _tag: 'LieuConnu',
        id: LieuId(CONNU),
        nom: 'Tiers-lieu du Port',
        siret: null,
        structureCartographieNationaleId: null,
      }),
    ).toEqual({
      id: CONNU,
      nom: Nom('Tiers-lieu du Port'),
      siret: null,
      structureCartographieNationaleId: null,
    })
  })

  it('emporte l’adresse validée d’un nouveau lieu', () => {
    expect(
      lieuDemande({
        _tag: 'LieuNouveau',
        nom: 'Tiers-lieu du Port',
        siret: null,
        structureCartographieNationaleId: null,
        adresse,
      }),
    ).toEqual({
      nom: Nom('Tiers-lieu du Port'),
      siret: null,
      structureCartographieNationaleId: null,
      ...adresse,
    })
  })
})
