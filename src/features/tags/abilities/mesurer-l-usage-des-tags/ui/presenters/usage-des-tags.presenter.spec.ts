import { describe, expect, it } from 'vitest'
import { DescriptionDuTag, Effectif, NomDuTag, TagId } from '../../../../domain'
import { tagsDeLaListe } from './usage-des-tags.presenter'

describe('tagsDeLaListe', () => {
  it('présente un tag d’équipe sans description à la liste des tags', () => {
    expect(
      tagsDeLaListe([
        {
          id: TagId('00000000-0000-4000-8000-000000000001'),
          nom: NomDuTag('Atelier'),
          portee: 'Equipe',
          description: null,
          utilisations: Effectif(4),
          accompagnements: Effectif(9),
        },
      ]),
    ).toEqual([
      {
        tag: {
          id: '00000000-0000-4000-8000-000000000001',
          nom: 'Atelier',
          description: null,
          portee: 'Equipe',
          equipe: null,
          badge: {
            libelle: 'Tag d’équipe',
            classe: 'fr-badge--brown-caramel',
            infobulle: null,
          },
        },
        utilisations: 4,
        accompagnements: 9,
      },
    ])
  })

  it('garde la description quand le tag en a une', () => {
    expect(
      tagsDeLaListe([
        {
          id: TagId('00000000-0000-4000-8000-000000000002'),
          nom: NomDuTag('Démarches'),
          portee: 'National',
          description: DescriptionDuTag('Aide aux démarches'),
          utilisations: Effectif(1),
          accompagnements: Effectif(1),
        },
      ]).at(0)?.tag.description,
    ).toBe('Aide aux démarches')
  })
})
