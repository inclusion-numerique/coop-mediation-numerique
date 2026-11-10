import {
  type ActiviteDeCoordination,
  partenairesDe,
  participantsDe,
} from './activite-de-coordination'
import { ActiviteDeCoordinationId } from './activite-de-coordination-id'
import { CoordinateurId } from './coordinateur-id'
import { DateDActivite } from './date-d-activite'
import { DureeEnMinutes } from './duree-en-minutes'
import { Effectif } from './effectif'
import { NatureDePartenariat } from './nature-de-partenariat'
import { NomDeStructure } from './nom-de-structure'
import { Organisateur } from './organisateur'
import { ThematiqueDAnimation } from './thematique-d-animation'
import { TypeDAnimation } from './type-d-animation'
import { TypeDEvenement } from './type-d-evenement'
import { TypeDeStructurePartenaire } from './type-de-structure-partenaire'

const commun = {
  id: ActiviteDeCoordinationId('0e7c3a52-4d1b-4f6a-8e9d-2c3b4a5d6e7f'),
  date: DateDActivite('2026-06-01'),
  coordinateurId: CoordinateurId('9e7c3a52-4d1b-4f6a-8e9d-2c3b4a5d6e7f'),
  tags: [],
  notes: null,
  creation: new Date('2026-06-01T10:00:00Z'),
  modification: new Date('2026-06-01T10:00:00Z'),
}

const animation: ActiviteDeCoordination = {
  ...commun,
  _tag: 'Animation',
  duree: DureeEnMinutes(60),
  typeDAnimation: { _tag: 'Liste', valeur: TypeDAnimation('Webinaire') },
  thematiques: { valeurs: [ThematiqueDAnimation('Reseau')], autre: null },
  initiative: null,
  intervenants: {
    mediateurs: Effectif(3),
    structures: Effectif(0),
    autresActeurs: Effectif(2),
  },
}

const partenariat: ActiviteDeCoordination = {
  ...commun,
  _tag: 'Partenariat',
  nom: null,
  natures: { valeurs: [NatureDePartenariat('RDVElu')], autre: null },
  structuresPartenaires: [
    {
      nom: NomDeStructure('Mairie'),
      type: { _tag: 'Liste', valeur: TypeDeStructurePartenaire('Commune') },
    },
    {
      nom: NomDeStructure('Hub'),
      type: { _tag: 'Liste', valeur: TypeDeStructurePartenaire('Hub') },
    },
  ],
  echelon: null,
}

describe('activité de coordination', () => {
  it("compte les intervenants d'une animation comme ses participants", () => {
    expect(participantsDe(animation)).toBe(5)
  })

  it("compte les participants déclarés d'un évènement", () => {
    expect(
      participantsDe({
        ...commun,
        _tag: 'Evenement',
        nom: null,
        typeDEvenement: { _tag: 'Liste', valeur: TypeDEvenement('NecLocal') },
        organisateurs: { valeurs: [Organisateur('Commune')], autre: null },
        echelon: null,
        participants: Effectif(40),
      }),
    ).toBe(40)
  })

  it("compte les structures partenaires d'un partenariat", () => {
    expect(partenairesDe(partenariat)).toBe(2)
    expect(partenairesDe(animation)).toBe(0)
    expect(participantsDe(partenariat)).toBe(0)
  })
})
