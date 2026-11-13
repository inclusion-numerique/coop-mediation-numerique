import {
  type ActiviteDeCoordination,
  ActiviteDeCoordinationId,
  type Animation,
  CoordinateurId,
  DateDActivite,
  DureeEnMinutes,
  EchelonTerritorial,
  Effectif,
  type Evenement,
  Initiative,
  NatureDePartenariat,
  NomDeLActivite,
  NomDeStructure,
  NomDeTag,
  Notes,
  Organisateur,
  type Partenariat,
  Precision,
  TagId,
  ThematiqueDAnimation,
  TypeDAnimation,
  TypeDEvenement,
  TypeDeStructurePartenaire,
} from '../domain'
import {
  ActiviteDeCoordinationIllisible,
  type ActiviteDeCoordinationRow,
  activiteDeCoordinationDe,
  activiteDeCoordinationVersLaBase,
} from './activite-de-coordination.transfer'

const instant = new Date('2026-11-10T09:00:00.000Z')

const commun = {
  id: ActiviteDeCoordinationId('b0000000-0000-4000-8000-000000000001'),
  coordinateurId: CoordinateurId('c0000000-0000-4000-8000-000000000001'),
  date: DateDActivite('2026-11-10'),
  tags: [],
  notes: null,
  creation: instant,
  modification: instant,
}

const animation: Animation = {
  ...commun,
  _tag: 'Animation',
  duree: DureeEnMinutes(120),
  typeDAnimation: { _tag: 'Liste', valeur: TypeDAnimation('Webinaire') },
  thematiques: { valeurs: [ThematiqueDAnimation('Reseau')], autre: null },
  initiative: null,
  intervenants: {
    mediateurs: Effectif(3),
    structures: Effectif(0),
    autresActeurs: Effectif(0),
  },
}

const evenement: Evenement = {
  ...commun,
  _tag: 'Evenement',
  nom: null,
  typeDEvenement: { _tag: 'Liste', valeur: TypeDEvenement('NecLocal') },
  organisateurs: { valeurs: [Organisateur('Commune')], autre: null },
  echelon: null,
  participants: Effectif(0),
}

const partenariat: Partenariat = {
  ...commun,
  _tag: 'Partenariat',
  nom: null,
  natures: { valeurs: [NatureDePartenariat('RDVElu')], autre: null },
  structuresPartenaires: [
    {
      nom: NomDeStructure('Mairie'),
      type: { _tag: 'Liste', valeur: TypeDeStructurePartenaire('Commune') },
    },
  ],
  echelon: null,
}

const allerRetour = (activite: ActiviteDeCoordination) =>
  activiteDeCoordinationDe(activiteDeCoordinationVersLaBase(activite))

describe('transfer de l’activité de coordination', () => {
  it.each<[string, ActiviteDeCoordination]>([
    ['une animation minimale', animation],
    [
      'une animation complète',
      {
        ...animation,
        tags: [
          {
            id: TagId('f0000000-0000-4000-8000-000000000001'),
            nom: NomDeTag('Réseau'),
          },
        ],
        notes: Notes('<p>Bilan du trimestre</p>'),
        typeDAnimation: {
          _tag: 'Autre',
          precision: Precision('Séminaire'),
        },
        thematiques: {
          valeurs: [
            ThematiqueDAnimation('Partage'),
            ThematiqueDAnimation('RH'),
          ],
          autre: Precision('Achats groupés'),
        },
        initiative: Initiative('Demande'),
        intervenants: {
          mediateurs: Effectif(3),
          structures: Effectif(2),
          autresActeurs: Effectif(1),
        },
      },
    ],
    ['un évènement minimal', evenement],
    [
      'un évènement complet',
      {
        ...evenement,
        nom: NomDeLActivite('Forum'),
        typeDEvenement: { _tag: 'Autre', precision: Precision('Salon') },
        organisateurs: {
          valeurs: [Organisateur('Commune'), Organisateur('Hub')],
          autre: Precision('Médiathèque'),
        },
        echelon: EchelonTerritorial('Departemental'),
        participants: Effectif(40),
      },
    ],
    [
      'un évènement organisé seulement par un « autre »',
      {
        ...evenement,
        organisateurs: { valeurs: [], autre: Precision('Médiathèque') },
      },
    ],
    ['un partenariat minimal', partenariat],
    [
      'un partenariat complet',
      {
        ...partenariat,
        nom: NomDeLActivite('Convention'),
        natures: {
          valeurs: [NatureDePartenariat('Subvention')],
          autre: Precision('Mutualisation'),
        },
        structuresPartenaires: [
          ...partenariat.structuresPartenaires,
          {
            nom: NomDeStructure('Collectif'),
            type: { _tag: 'Autre', precision: Precision('Collectif citoyen') },
          },
        ],
        echelon: EchelonTerritorial('Communal'),
      },
    ],
  ])('relit %s à l’identique', (_, activite) => {
    expect(allerRetour(activite)).toEqual(activite)
  })

  it('efface les colonnes des autres types', () => {
    expect(activiteDeCoordinationVersLaBase(evenement)).toMatchObject({
      duree: null,
      typeAnimation: null,
      thematiquesAnimation: [],
      naturePartenariat: [],
      structuresPartenaires: null,
    })
  })

  describe('lecture stricte', () => {
    const ligne = (
      activite: ActiviteDeCoordination,
      modification: Partial<ActiviteDeCoordinationRow>,
    ): ActiviteDeCoordinationRow => ({
      ...activiteDeCoordinationVersLaBase(activite),
      ...modification,
    })

    it('relit une animation historique sans thématique', () => {
      expect(
        activiteDeCoordinationDe(
          ligne(animation, { thematiquesAnimation: [] }),
        ),
      ).toMatchObject({ thematiques: { valeurs: [], autre: null } })
    })

    it('lit une note vide en texte riche comme une absence', () => {
      expect(
        activiteDeCoordinationDe(ligne(animation, { notes: '<p></p>' })).notes,
      ).toBeNull()
    })

    it.each<[string, ActiviteDeCoordinationRow]>([
      ['une animation sans type', ligne(animation, { typeAnimation: null })],
      [
        'une animation sans intervenant',
        ligne(animation, {
          mediateurs: 0,
          structures: null,
          autresActeurs: null,
        }),
      ],
      ['une animation sans durée', ligne(animation, { duree: null })],
      [
        'un « autre » sans précision',
        ligne(animation, { typeAnimation: 'Autre', typeAnimationAutre: ' ' }),
      ],
      [
        'une précision sans « autre »',
        ligne(animation, { thematiqueAnimationAutre: 'Achats' }),
      ],
      [
        'un champ d’évènement sur une animation',
        ligne(animation, { participants: 12 }),
      ],
      ['une durée sur un évènement', ligne(evenement, { duree: 60 })],
      [
        'un évènement sans participants renseignés',
        ligne(evenement, { participants: null }),
      ],
      [
        'un évènement sans organisateur',
        ligne(evenement, { organisateurs: [] }),
      ],
      [
        'un partenariat sans structure partenaire',
        ligne(partenariat, { structuresPartenaires: [] }),
      ],
      [
        'une structure partenaire sans type',
        ligne(partenariat, { structuresPartenaires: [{ nom: 'Mairie' }] }),
      ],
    ])('refuse %s', (_, row) => {
      expect(() => activiteDeCoordinationDe(row)).toThrow()
    })

    it('signale l’activité illisible', () => {
      expect(() =>
        activiteDeCoordinationDe(ligne(animation, { typeAnimation: null })),
      ).toThrow(ActiviteDeCoordinationIllisible)
    })
  })
})
