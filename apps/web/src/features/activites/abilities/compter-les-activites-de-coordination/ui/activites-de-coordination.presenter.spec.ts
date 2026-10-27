import {
  NombreDActivites,
  Trimestre,
  TypeDActiviteDeCoordination,
} from '../domain'
import { activitesDeCoordinationPresentees } from './activites-de-coordination.presenter'

const decompte = (animations: number) => [
  {
    type: TypeDActiviteDeCoordination('Animation'),
    nombre: NombreDActivites(animations),
  },
  {
    type: TypeDActiviteDeCoordination('Evenement'),
    nombre: NombreDActivites(0),
  },
]

describe('présentation des activités de coordination', () => {
  it('propose chaque trimestre puis le cumul, retenu par défaut', () => {
    expect(
      activitesDeCoordinationPresentees({
        cumul: decompte(3),
        trimestres: [
          {
            trimestre: Trimestre({ annee: 2026, rang: 2 }),
            decompte: decompte(2),
          },
          {
            trimestre: Trimestre({ annee: 2026, rang: 1 }),
            decompte: decompte(1),
          },
        ],
      }),
    ).toEqual({
      aucuneActivite: false,
      periodes: [
        {
          cle: '2026-2',
          libelle: '2e trimestre 2026',
          compteurs: [
            { libelle: 'Animation', nombre: 2 },
            { libelle: 'Évènement', nombre: 0 },
          ],
        },
        {
          cle: '2026-1',
          libelle: '1er trimestre 2026',
          compteurs: [
            { libelle: 'Animation', nombre: 1 },
            { libelle: 'Évènement', nombre: 0 },
          ],
        },
        {
          cle: 'cumul',
          libelle: 'En cumulé',
          compteurs: [
            { libelle: 'Animation', nombre: 3 },
            { libelle: 'Évènement', nombre: 0 },
          ],
        },
      ],
      periodeParDefaut: 'cumul',
    })
  })

  it("signale l'absence de toute activité", () => {
    expect(
      activitesDeCoordinationPresentees({ cumul: decompte(0), trimestres: [] })
        .aucuneActivite,
    ).toBe(true)
  })
})
