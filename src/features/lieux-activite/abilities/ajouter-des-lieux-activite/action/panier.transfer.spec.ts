import {
  Adresse,
  Localisation,
  Nom,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import { describe, expect, it } from 'vitest'
import { Siret } from '@/libraries/insee'
import { IdentifiantCartographie } from '../../../domain/cartographie-nationale/ids-cartographie-nationale'
import { BanId } from '../../../domain/identifiants/ban-id'
import { LieuId } from '../../../domain/identifiants/lieu-id'
import type { LieuxAAjouterData } from './ajouter-des-lieux-activite.validation'
import { depuisLePanier } from './panier.transfer'

type LieuDuPanier = LieuxAAjouterData['lieux'][number]

const lieuDuPanier: LieuDuPanier = {
  id: null,
  structureCartographieNationaleId: null,
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

const CONNU = '0927f824-b84d-4840-ae2e-e4a96a7a519b'

const adresse = Adresse({
  voie: '12 quai du Port',
  commune: 'Rochefort',
  code_postal: '17300',
  code_insee: '17299',
})

const localisation = Localisation({ latitude: 45.94, longitude: -0.96 })

const banId = BanId('17299_0123_00012')

const nouveau = {
  _tag: 'LieuACreer',
  nom: Nom('Tiers-lieu du Port'),
  siret: null,
  structureCartographieNationaleId: null,
  adresse,
  localisation,
  banId,
}

describe('le panier soumis devient une liste de lieux soumis', () => {
  it('désigne un lieu que la coop connaît par son id, sans lire son adresse', () => {
    expect(
      depuisLePanier([
        { ...lieuDuPanier, id: CONNU, codeInsee: null, banId: null },
      ]),
    ).toEqual([
      {
        _tag: 'LieuExistant',
        id: LieuId(CONNU),
        nom: Nom('Tiers-lieu du Port'),
        siret: null,
        structureCartographieNationaleId: null,
      },
    ])
  })

  it('emporte l’adresse, la localisation et l’identifiant BAN d’un lieu à créer', () => {
    expect(depuisLePanier([lieuDuPanier])).toEqual([nouveau])
  })

  it.each<{ cas: string; manque: Partial<LieuDuPanier>; attendu: object }>([
    {
      cas: 'laisse au domaine un lieu sans code INSEE, sans adresse ni localisation',
      manque: { codeInsee: null },
      attendu: { ...nouveau, adresse: null, localisation: null },
    },
    {
      cas: 'laisse au domaine un lieu sans identifiant BAN',
      manque: { banId: null },
      attendu: { ...nouveau, banId: null },
    },
    {
      cas: 'laisse au domaine un lieu sans latitude',
      manque: { latitude: null },
      attendu: { ...nouveau, adresse: null, localisation: null },
    },
  ])('$cas', ({ manque, attendu }) => {
    expect(depuisLePanier([{ ...lieuDuPanier, ...manque }])).toEqual([attendu])
  })

  it('retient le SIRET et l’identité de cartographie soumis', () => {
    expect(
      depuisLePanier([
        {
          ...lieuDuPanier,
          siret: '13002603200016',
          structureCartographieNationaleId: 'dora__abc',
        },
      ]),
    ).toEqual([
      {
        ...nouveau,
        siret: Siret('13002603200016'),
        structureCartographieNationaleId: IdentifiantCartographie('dora__abc'),
      },
    ])
  })

  it('rend une liste vide pour un panier vide', () => {
    expect(depuisLePanier([])).toEqual([])
  })
})
