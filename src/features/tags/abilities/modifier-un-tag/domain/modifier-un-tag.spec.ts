import { describe, expect, it } from 'vitest'
import {
  type Acteur,
  DescriptionDuTag,
  MediateurId,
  NomDuTag,
  role,
  type Tag,
  TagId,
} from '../../../domain'
import { modifierUnTag } from './modifier-un-tag'

const tagId = TagId('0b3c4f62-2d6a-4f6e-9a39-3a4c8f1d2e01')
const mediateurId = MediateurId('00000000-0000-4000-8000-000000000001')

const tag: Tag = {
  id: tagId,
  nom: NomDuTag('Parentalité'),
  description: null,
  portee: {
    _tag: 'Personnel',
    proprietaire: { _tag: 'Mediateur', mediateurId },
  },
}

const proprietaire: Acteur = {
  ...role(mediateurId, null),
  equipes: [],
  departement: null,
}

const autreMediateur: Acteur = {
  ...role(MediateurId('00000000-0000-4000-8000-000000000002'), null),
  equipes: [],
  departement: null,
}

const modifier = (tagLu: Tag | null, acteur: Acteur) =>
  modifierUnTag({
    lireUnTagActif: async () => tagLu,
    enregistrer: async () => undefined,
  })({
    tagId,
    acteur,
    nom: NomDuTag('Soutien à la parentalité'),
    description: DescriptionDuTag('Accompagnement des parents'),
  })

describe('modifier un tag', () => {
  it('renomme et décrit le tag de son propriétaire', async () => {
    expect(await modifier(tag, proprietaire)).toEqual({
      success: true,
      data: {
        ...tag,
        nom: 'Soutien à la parentalité',
        description: 'Accompagnement des parents',
      },
    })
  })

  it('refuse la modification d’un tag qu’il ne gère pas', async () => {
    expect(await modifier(tag, autreMediateur)).toEqual({
      success: false,
      error: { _tag: 'ActionNonAutorisee' },
    })
  })

  it('signale un tag introuvable', async () => {
    expect(await modifier(null, proprietaire)).toEqual({
      success: false,
      error: { _tag: 'TagIntrouvable' },
    })
  })
})
