import { describe, expect, it } from 'vitest'
import {
  type Acteur,
  CoordinateurId,
  Effectif,
  MediateurId,
  NomDuCoordinateur,
  NomDuTag,
  role,
  type Tag,
  TagId,
} from '../../../domain'
import type { DestinationDeFusion } from './destination-de-fusion'
import { rechercherDesDestinations } from './rechercher-des-destinations'

const mediateurId = MediateurId('00000000-0000-4000-8000-000000000001')
const coordinateurId = CoordinateurId('00000000-0000-4000-8000-000000000002')

const mediateur: Acteur = {
  ...role(mediateurId, null),
  equipes: [{ coordinateurId, coordonneePar: NomDuCoordinateur('Ada') }],
  departement: null,
}

const tagPersonnel: Tag = {
  id: TagId('0b3c4f62-2d6a-4f6e-9a39-3a4c8f1d2e01'),
  nom: NomDuTag('Parentalité'),
  description: null,
  portee: {
    _tag: 'Personnel',
    proprietaire: { _tag: 'Mediateur', mediateurId },
  },
}

const tagDUnAutre: Tag = {
  id: TagId('0b3c4f62-2d6a-4f6e-9a39-3a4c8f1d2e03'),
  nom: NomDuTag('Parentalité'),
  description: null,
  portee: {
    _tag: 'Personnel',
    proprietaire: {
      _tag: 'Mediateur',
      mediateurId: MediateurId('00000000-0000-4000-8000-000000000003'),
    },
  },
}

const versLEquipe: DestinationDeFusion = {
  tag: {
    id: TagId('0b3c4f62-2d6a-4f6e-9a39-3a4c8f1d2e02'),
    nom: NomDuTag('Soutien à la parentalité'),
    description: null,
    portee: { _tag: 'Equipe', coordinateurId },
  },
  utilisations: Effectif(4),
}

const versUnAutre: DestinationDeFusion = {
  tag: tagDUnAutre,
  utilisations: Effectif(2),
}

const rechercher = (source: Tag | null) =>
  rechercherDesDestinations({
    lireUnTagActif: async () => source,
    lireLesCandidates: async () => [versUnAutre, versLEquipe],
  })({
    acteur: mediateur,
    sourceId: tagPersonnel.id,
    recherche: 'parent',
    limite: 10,
  })

describe('rechercher des destinations de fusion', () => {
  it('ne propose que les candidates vers lesquelles l’acteur peut fusionner', async () => {
    expect(await rechercher(tagPersonnel)).toEqual({
      success: true,
      data: [versLEquipe],
    })
  })

  it('ne propose rien pour une source que l’acteur ne gère pas', async () => {
    expect(await rechercher(tagDUnAutre)).toEqual({ success: true, data: [] })
  })

  it('ne propose rien pour une source introuvable', async () => {
    expect(await rechercher(null)).toEqual({ success: true, data: [] })
  })
})
