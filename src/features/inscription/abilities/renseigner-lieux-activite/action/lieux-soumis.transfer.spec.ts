import { Nom } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { describe, expect, it } from 'vitest'
import { LieuId } from '@/features/inscription/domain'
import { Siret } from '@/libraries/insee'
import { IdentifiantCartographie } from '../domain'
import { lieuxSoumis, type SaisieDuLieu } from './lieux-soumis.transfer'

const saisie: SaisieDuLieu = {
  nom: 'Tiers-lieu du Port',
  adresse: '12 quai du Port',
  commune: 'Rochefort',
  codePostal: '17300',
  codeInsee: '17299',
}

const adresseValidee = ({ adresse }: SaisieDuLieu) => ({ adresse })

const adresseRefusee = () => null

const CONNU = '0927f824-b84d-4840-ae2e-e4a96a7a519b'

describe('la saisie des lieux devient une liste de lieux soumis', () => {
  it('désigne un lieu connu par son identifiant', () => {
    expect(
      lieuxSoumis(adresseValidee)([
        { ...saisie, id: CONNU, structureCartographieNationaleId: 'carto-1' },
      ]),
    ).toEqual([
      {
        _tag: 'LieuExistant',
        id: LieuId(CONNU),
        nom: Nom('Tiers-lieu du Port'),
        siret: null,
        structureCartographieNationaleId: IdentifiantCartographie('carto-1'),
      },
    ])
  })

  it('emporte l’adresse validée d’un nouveau lieu', () => {
    expect(
      lieuxSoumis(adresseValidee)([{ ...saisie, siret: '12345678900011' }]),
    ).toEqual([
      {
        _tag: 'LieuACreer',
        nom: Nom('Tiers-lieu du Port'),
        siret: Siret('12345678900011'),
        structureCartographieNationaleId: null,
        adresseValidee: { adresse: '12 quai du Port' },
      },
    ])
  })

  it('laisse au domaine un nouveau lieu dont l’adresse est refusée', () => {
    expect(lieuxSoumis(adresseRefusee)([saisie])).toEqual([
      {
        _tag: 'LieuACreer',
        nom: Nom('Tiers-lieu du Port'),
        siret: null,
        structureCartographieNationaleId: null,
        adresseValidee: null,
      },
    ])
  })

  it('ignore un identifiant de cartographie vide', () => {
    expect(
      lieuxSoumis(adresseValidee)([
        { ...saisie, structureCartographieNationaleId: ' ' },
      ]),
    ).toEqual([
      {
        _tag: 'LieuACreer',
        nom: Nom('Tiers-lieu du Port'),
        siret: null,
        structureCartographieNationaleId: null,
        adresseValidee: { adresse: '12 quai du Port' },
      },
    ])
  })
})
