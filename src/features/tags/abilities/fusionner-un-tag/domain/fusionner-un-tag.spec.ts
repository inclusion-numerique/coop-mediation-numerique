import { describe, expect, it } from 'vitest'
import {
  type Acteur,
  CoordinateurId,
  MediateurId,
  NomDuCoordinateur,
  NomDuTag,
  role,
  type Tag,
  TagId,
} from '../../../domain'
import { fusionnerUnTag } from './fusionner-un-tag'

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

const tagDEquipe: Tag = {
  id: TagId('0b3c4f62-2d6a-4f6e-9a39-3a4c8f1d2e02'),
  nom: NomDuTag('Soutien à la parentalité'),
  description: null,
  portee: { _tag: 'Equipe', coordinateurId },
}

const tagDUnAutre: Tag = {
  ...tagPersonnel,
  portee: {
    _tag: 'Personnel',
    proprietaire: {
      _tag: 'Mediateur',
      mediateurId: MediateurId('00000000-0000-4000-8000-000000000003'),
    },
  },
}

const fusionner = (source: Tag | null, destination: Tag | null) =>
  fusionnerUnTag({
    lireLesTags: async () => ({ source, destination }),
    reporter: async () => undefined,
  })({
    acteur: mediateur,
    sourceId: tagPersonnel.id,
    destinationId: tagDEquipe.id,
  })

describe('fusionner un tag', () => {
  it('reporte un tag qu’il gère sur un tag au moins aussi large', async () => {
    expect(await fusionner(tagPersonnel, tagDEquipe)).toEqual({
      success: true,
      data: { source: tagPersonnel, destination: tagDEquipe },
    })
  })

  it.each<{ cas: string; source: Tag | null; destination: Tag | null }>([
    { cas: 'la source', source: null, destination: tagDEquipe },
    { cas: 'la destination', source: tagPersonnel, destination: null },
  ])(
    'signale un tag introuvable quand $cas manque',
    async ({ source, destination }) => {
      expect(await fusionner(source, destination)).toEqual({
        success: false,
        error: { _tag: 'TagIntrouvable' },
      })
    },
  )

  it('refuse de fusionner un tag qu’il ne gère pas', async () => {
    expect(await fusionner(tagDUnAutre, tagDEquipe)).toEqual({
      success: false,
      error: { _tag: 'ActionNonAutorisee' },
    })
  })

  it('refuse de fusionner vers un tag moins large', async () => {
    expect(await fusionner(tagDEquipe, tagPersonnel)).toEqual({
      success: false,
      error: { _tag: 'DestinationNonAutorisee' },
    })
  })
})
