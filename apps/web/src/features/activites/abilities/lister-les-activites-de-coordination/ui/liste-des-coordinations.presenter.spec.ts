import {
  type ActiviteDeCoordination,
  ActiviteDeCoordinationId,
  CoordinateurId,
  DateDActivite,
  DureeEnMinutes,
  EchelonTerritorial,
  Effectif,
  NomDeLActivite,
  NomDeStructure,
  Precision,
  ThematiqueDAnimation,
  TypeDAnimation,
  TypeDEvenement,
  TypeDeStructurePartenaire,
} from '../../../domain'
import {
  dureeLisible,
  listeDesCoordinations,
} from './liste-des-coordinations.presenter'

const commun = {
  coordinateurId: CoordinateurId('9e7c3a52-4d1b-4f6a-8e9d-2c3b4a5d6e7f'),
  tags: [],
  notes: null,
  creation: new Date('2026-06-02T08:00:00Z'),
  modification: new Date('2026-06-02T08:00:00Z'),
}

const evenement: ActiviteDeCoordination = {
  ...commun,
  id: ActiviteDeCoordinationId('1e7c3a52-4d1b-4f6a-8e9d-2c3b4a5d6e7f'),
  date: DateDActivite('2026-06-02'),
  _tag: 'Evenement',
  nom: NomDeLActivite('Forum'),
  typeDEvenement: { _tag: 'Liste', valeur: TypeDEvenement('NecLocal') },
  organisateurs: { valeurs: [], autre: Precision('La médiathèque') },
  echelon: null,
  participants: Effectif(1),
}

const partenariat: ActiviteDeCoordination = {
  ...commun,
  id: ActiviteDeCoordinationId('2e7c3a52-4d1b-4f6a-8e9d-2c3b4a5d6e7f'),
  date: DateDActivite('2026-06-02'),
  modification: new Date('2026-06-03T08:00:00Z'),
  _tag: 'Partenariat',
  nom: null,
  natures: { valeurs: [], autre: Precision('Mutualisation') },
  structuresPartenaires: [
    {
      nom: NomDeStructure('Mairie'),
      type: { _tag: 'Liste', valeur: TypeDeStructurePartenaire('Commune') },
    },
    {
      nom: NomDeStructure('Collectif'),
      type: { _tag: 'Autre', precision: Precision('Collectif citoyen') },
    },
  ],
  echelon: null,
}

const animation: ActiviteDeCoordination = {
  ...commun,
  id: ActiviteDeCoordinationId('3e7c3a52-4d1b-4f6a-8e9d-2c3b4a5d6e7f'),
  date: DateDActivite('2026-05-28'),
  _tag: 'Animation',
  duree: DureeEnMinutes(90),
  typeDAnimation: { _tag: 'Liste', valeur: TypeDAnimation('Webinaire') },
  thematiques: { valeurs: [ThematiqueDAnimation('Reseau')], autre: null },
  initiative: null,
  intervenants: {
    mediateurs: Effectif(1),
    structures: Effectif(0),
    autresActeurs: Effectif(0),
  },
}

const liste = listeDesCoordinations({
  listees: {
    activites: [evenement, partenariat, animation],
    total: Effectif(3),
    pages: Effectif(1),
  },
  filtre: false,
  timezone: 'Europe/Paris',
})

describe('liste des activités de coordination', () => {
  it('regroupe les activités par jour, dans leur ordre', () => {
    expect(liste.titre).toBe('3 activités enregistrées')
    expect(liste.jours.map(({ cle, cartes }) => [cle, cartes.length])).toEqual([
      ['2026-06-02', 2],
      ['2026-05-28', 1],
    ])
  })

  it('présente une carte avec son nom, ses comptes et son objet', () => {
    const [carte] = liste.jours[0].cartes

    expect(carte).toMatchObject({
      titre: 'Évènement · Forum',
      infos: ['1 participant'],
      objets: ['NEC local'],
      enregistreeLe: '02.06.2026 à 10:00',
    })
    expect(carte.detail.rubriques).toEqual([
      { titre: 'Organisé par', elements: ['La médiathèque'] },
    ])
    expect(carte.detail.modifieeLe).toBeNull()
  })

  it('détaille les partenaires et la modification', () => {
    const { detail, objets, infos } = liste.jours[0].cartes[1]

    expect(objets).toEqual(['Mutualisation'])
    expect(infos).toEqual(['2 partenaires'])
    expect(detail.duree).toBeNull()
    expect(detail.modifieeLe).toBe('03.06.2026 à 10h00')
    expect(detail.rubriques).toEqual([
      {
        titre: 'Partenaires',
        elements: ['Mairie · Commune', 'Collectif · Collectif citoyen'],
      },
    ])
  })

  it('titre l’échelon selon le type de l’activité', () => {
    const avecEchelon = listeDesCoordinations({
      listees: {
        activites: [
          { ...partenariat, echelon: EchelonTerritorial('Departemental') },
        ],
        total: Effectif(1),
        pages: Effectif(1),
      },
      filtre: false,
      timezone: 'Europe/Paris',
    })

    expect(avecEchelon.jours[0].cartes[0].detail.rubriques).toContainEqual({
      titre: 'Échelon territorial du partenariat',
      elements: ['Départemental'],
    })
  })

  it('accorde le titre d’une recherche', () => {
    expect(
      listeDesCoordinations({
        listees: { activites: [], total: Effectif(1), pages: Effectif(1) },
        filtre: true,
        timezone: 'Europe/Paris',
      }).titre,
    ).toBe('1 activité correspond à votre recherche')
  })
})

describe('durée lisible', () => {
  it('écrit les minutes, les heures, ou les deux', () => {
    expect(dureeLisible(DureeEnMinutes(45))).toBe('45min')
    expect(dureeLisible(DureeEnMinutes(120))).toBe('2h')
    expect(dureeLisible(DureeEnMinutes(75))).toBe('1h15')
  })
})
