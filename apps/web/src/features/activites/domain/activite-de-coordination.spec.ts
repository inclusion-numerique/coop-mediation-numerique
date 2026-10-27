import {
  type ActiviteDeCoordination,
  partenairesDe,
  participantsDe,
} from './activite-de-coordination'
import { ActiviteDeCoordinationId } from './activite-de-coordination-id'
import { Effectif } from './effectif'
import { NomDeStructure } from './nom-de-structure'

const commun = {
  id: ActiviteDeCoordinationId('0e7c3a52-4d1b-4f6a-8e9d-2c3b4a5d6e7f'),
  date: new Date('2026-06-01'),
  duree: null,
  tags: [],
  notes: null,
  creation: new Date('2026-06-01T10:00:00Z'),
  modification: new Date('2026-06-01T10:00:00Z'),
}

const animation: ActiviteDeCoordination = {
  ...commun,
  _tag: 'Animation',
  typeDAnimation: null,
  thematiques: [],
  initiative: null,
  intervenants: {
    mediateurs: Effectif(3),
    structures: null,
    autresActeurs: Effectif(2),
  },
}

const partenariat: ActiviteDeCoordination = {
  ...commun,
  _tag: 'Partenariat',
  nom: null,
  natures: [],
  structuresPartenaires: [
    { nom: NomDeStructure('Mairie'), type: null },
    { nom: NomDeStructure('Hub'), type: null },
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
        typeDEvenement: null,
        organisateurs: [],
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
