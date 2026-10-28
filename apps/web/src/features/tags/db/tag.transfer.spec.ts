import { CodeDepartement } from '@app/web/libraries/departement'
import {
  CoordinateurId,
  DescriptionDuTag,
  MediateurId,
  NomDuTag,
  type Portee,
  type Tag,
  TagId,
} from '../domain'
import { tagFromDomain, tagToDomain } from './tag.transfer'

const tag = (portee: Portee, description: string | null = null): Tag => ({
  id: TagId('00000000-0000-4000-8000-000000000001'),
  nom: NomDuTag('Atelier'),
  description: description === null ? null : DescriptionDuTag(description),
  portee,
})

describe('tag transfer', () => {
  it.each<[string, Tag]>([
    [
      'personnel d’un médiateur, sans description',
      tag({
        _tag: 'Personnel',
        proprietaire: {
          _tag: 'Mediateur',
          mediateurId: MediateurId('00000000-0000-4000-8000-000000000002'),
        },
      }),
    ],
    [
      'personnel d’un coordinateur, avec description',
      tag(
        {
          _tag: 'Personnel',
          proprietaire: {
            _tag: 'Coordinateur',
            coordinateurId: CoordinateurId(
              '00000000-0000-4000-8000-000000000003',
            ),
          },
        },
        'Ateliers du mardi',
      ),
    ],
    [
      'd’équipe',
      tag({
        _tag: 'Equipe',
        coordinateurId: CoordinateurId('00000000-0000-4000-8000-000000000003'),
      }),
    ],
    [
      'départemental',
      tag({ _tag: 'Departemental', departement: CodeDepartement('2A') }),
    ],
    ['national', tag({ _tag: 'National' })],
  ])('fait l’aller-retour d’un tag %s', (_, original) => {
    expect(tagToDomain(tagFromDomain(original))).toEqual(original)
  })

  it('écarte une description vide', () => {
    expect(
      tagToDomain({
        ...tagFromDomain(tag({ _tag: 'National' })),
        description: '  ',
      })?.description,
    ).toBeNull()
  })

  it('écarte un tag dont le département est illisible', () => {
    expect(
      tagToDomain({
        ...tagFromDomain(tag({ _tag: 'National' })),
        departement: 'inconnu',
      }),
    ).toBeNull()
  })
})
