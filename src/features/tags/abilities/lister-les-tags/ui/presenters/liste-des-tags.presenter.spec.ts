import { Page, PageSize } from '@arckit/resultset'
import { describe, expect, it } from 'vitest'
import {
  type Acteur,
  Effectif,
  MediateurId,
  NomDuTag,
  role,
  TagId,
} from '../../../../domain'
import { lignesDeLaListe } from './liste-des-tags.presenter'

const mediateurId = MediateurId('00000000-0000-4000-8000-000000000001')

const acteur: Acteur = {
  ...role(mediateurId, null),
  equipes: [],
  departement: null,
}

describe('lignesDeLaListe', () => {
  it('rend gérable le tag personnel du médiateur, pas un tag national', () => {
    expect(
      lignesDeLaListe(acteur, {
        totalItems: 2,
        currentPage: Page(1),
        pageSize: PageSize(50),
        items: [
          {
            tag: {
              id: TagId('00000000-0000-4000-8000-000000000002'),
              nom: NomDuTag('Atelier'),
              description: null,
              portee: {
                _tag: 'Personnel',
                proprietaire: { _tag: 'Mediateur', mediateurId },
              },
            },
            accompagnements: Effectif(4),
          },
          {
            tag: {
              id: TagId('00000000-0000-4000-8000-000000000003'),
              nom: NomDuTag('National'),
              description: null,
              portee: { _tag: 'National' },
            },
            accompagnements: Effectif(0),
          },
        ],
      }).map(({ gerable }) => gerable),
    ).toEqual([true, false])
  })
})
