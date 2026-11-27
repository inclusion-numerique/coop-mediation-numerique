import { describe, expect, it } from 'vitest'
import {
  type Acteur,
  CoordinateurId,
  MediateurId,
  NomDuTag,
  role,
  type Tag,
  TagId,
} from '../../../domain'
import { supprimerUnTag } from './supprimer-un-tag'

const tagId = TagId('0b3c4f62-2d6a-4f6e-9a39-3a4c8f1d2e01')
const coordinateurId = CoordinateurId('00000000-0000-4000-8000-000000000002')

const tagDEquipe: Tag = {
  id: tagId,
  nom: NomDuTag('Parentalité'),
  description: null,
  portee: { _tag: 'Equipe', coordinateurId },
}

const coordinateur: Acteur = {
  ...role(null, coordinateurId),
  equipes: [],
  departement: null,
}

const mediateurHorsEquipe: Acteur = {
  ...role(MediateurId('00000000-0000-4000-8000-000000000001'), null),
  equipes: [],
  departement: null,
}

const supprimer = (tagLu: Tag | null, acteur: Acteur) =>
  supprimerUnTag({
    lireUnTagActif: async () => tagLu,
    effacer: async () => undefined,
  })({ tagId, acteur })

describe('supprimer un tag', () => {
  it('supprime un tag que l’acteur gère', async () => {
    expect(await supprimer(tagDEquipe, coordinateur)).toEqual({
      success: true,
      data: tagDEquipe,
    })
  })

  it('refuse la suppression d’un tag qu’il ne gère pas', async () => {
    expect(await supprimer(tagDEquipe, mediateurHorsEquipe)).toEqual({
      success: false,
      error: { _tag: 'ActionNonAutorisee' },
    })
  })

  it('signale un tag introuvable', async () => {
    expect(await supprimer(null, coordinateur)).toEqual({
      success: false,
      error: { _tag: 'TagIntrouvable' },
    })
  })
})
