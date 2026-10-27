import { TagScope } from '@app/web/features/activites/use-cases/tags/tagScope'
import {
  DescriptionDuTag,
  Effectif,
  NomDuTag,
  PorteeDuTag,
  TagId,
} from '../domain'
import { tagsDeLaListe } from './usage-des-tags.presenter'

describe('tagsDeLaListe', () => {
  it('présente un tag d’équipe sans description à la liste des tags', () => {
    expect(
      tagsDeLaListe([
        {
          id: TagId('00000000-0000-4000-8000-000000000001'),
          nom: NomDuTag('Atelier'),
          portee: PorteeDuTag('Equipe'),
          description: null,
          utilisations: Effectif(4),
          accompagnements: Effectif(9),
        },
      ]),
    ).toEqual([
      {
        id: '00000000-0000-4000-8000-000000000001',
        nom: 'Atelier',
        scope: TagScope.Equipe,
        description: undefined,
        usageCount: 4,
        accompagnementsCount: 9,
      },
    ])
  })

  it('garde la description quand le tag en a une', () => {
    expect(
      tagsDeLaListe([
        {
          id: TagId('00000000-0000-4000-8000-000000000002'),
          nom: NomDuTag('Démarches'),
          portee: PorteeDuTag('National'),
          description: DescriptionDuTag('Aide aux démarches'),
          utilisations: Effectif(1),
          accompagnements: Effectif(1),
        },
      ]).at(0)?.description,
    ).toBe('Aide aux démarches')
  })
})
