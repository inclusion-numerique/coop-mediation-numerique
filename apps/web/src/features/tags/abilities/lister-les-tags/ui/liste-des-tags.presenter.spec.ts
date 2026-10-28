import {
  type Acteur,
  Effectif,
  MediateurId,
  NomDuTag,
  TagId,
} from '../../../domain'
import { lignesDeLaListe, nombreDePages } from './liste-des-tags.presenter'

const mediateurId = MediateurId('00000000-0000-4000-8000-000000000001')

const acteur: Acteur = {
  mediateurId,
  coordinateurId: null,
  equipes: [],
  departement: null,
}

describe('lignesDeLaListe', () => {
  it('rend gérable le tag personnel du médiateur, pas un tag national', () => {
    expect(
      lignesDeLaListe(acteur, {
        total: Effectif(2),
        tags: [
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

describe('nombreDePages', () => {
  it('arrondit au nombre de pages supérieur', () => {
    expect(nombreDePages(101, 50)).toBe(3)
  })
})
