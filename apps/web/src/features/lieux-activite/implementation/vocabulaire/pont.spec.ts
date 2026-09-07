import * as vocabulaire from './index'

type Pont<Coop extends string, Standard extends string> = {
  readonly table: Record<Coop, Standard>
  versCoop: (valeur: Standard) => Coop | null
}

/**
 * Traduire vers le standard ne peut pas échouer : la table est totale, et
 * `satisfies` vérifie à la compilation que chaque valeur citée existe bien dans
 * l'énumération du paquet. Le retour, lui, passe par la table inversée — et
 * deux noms stockés qui désigneraient la même valeur du standard en feraient
 * disparaître un, sans que rien ne le signale.
 *
 * C'est donc la bijection qu'on exerce ici, entrée par entrée.
 *
 * L'accord avec les énumérations de la base ne s'y joue pas : le vocabulaire
 * déclare ses noms lui-même, et `ligne-du-lieu.ts` fait tenir l'égalité des
 * deux ensembles au compilateur. La typologie n'y figure pas non plus : ses
 * noms stockés se déduisent des valeurs du standard, il n'y a rien à exercer.
 */
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
