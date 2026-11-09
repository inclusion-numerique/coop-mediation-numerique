import * as vocabulaire from './vocabulaire'

type Pont<Coop extends string, Standard extends string> = {
  readonly table: Record<Coop, Standard>
  versCoop: (valeur: Standard) => Coop | null
}

const exerceLaCorrespondance = <Coop extends string, Standard extends string>(
  pont: Pont<Coop, Standard>,
) => {
  it('revient au nom stocké de départ, pour chacun', () => {
    const perdus = Object.entries<Standard>(pont.table).filter(
      ([stocke, standard]) => pont.versCoop(standard) !== stocke,
    )

    expect(perdus).toEqual([])
  })
}

describe('pont de vocabulaire', () => {
  describe('service', () => exerceLaCorrespondance(vocabulaire.service))

  describe('frais à charge', () =>
    exerceLaCorrespondance(vocabulaire.fraisACharge))

  describe('itinérance', () => exerceLaCorrespondance(vocabulaire.itinerance))

  describe('modalité d’accès', () =>
    exerceLaCorrespondance(vocabulaire.modaliteAcces))

  describe('modalité d’accompagnement', () =>
    exerceLaCorrespondance(vocabulaire.modaliteAccompagnement))

  describe('public spécifiquement adressé', () =>
    exerceLaCorrespondance(vocabulaire.publicSpecifiquementAdresse))

  describe('prise en charge spécifique', () =>
    exerceLaCorrespondance(vocabulaire.priseEnChargeSpecifique))

  describe('formation et label', () =>
    exerceLaCorrespondance(vocabulaire.formationLabel))

  describe('dispositif ou programme national', () =>
    exerceLaCorrespondance(vocabulaire.dispositifProgrammeNational))
})
