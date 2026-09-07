import * as vocabulaire from './index'

type Pont<Coop extends string, Standard extends string> = {
  readonly valeurs: readonly Coop[]
  versStandard: (valeur: Coop) => Standard | null
  versCoop: (valeur: Standard) => Coop | null
}

/**
 * Le pont traduit par nom de membre et écarte en silence ce qu'il ne sait pas
 * traduire : sans ce test, une divergence de nommage introduite en amont — par
 * une montée du paquet standard — ferait disparaître des valeurs en production
 * sans qu'aucun test ne tombe. On exerce donc chaque nomenclature entière.
 *
 * L'accord avec les énumérations de la base ne se joue plus ici : le
 * vocabulaire déclare ses noms lui-même, et `db/ligne-du-lieu.ts` fait tenir
 * l'égalité des deux ensembles au compilateur.
 */
const exerceToutLeVocabulaire = <Coop extends string, Standard extends string>(
  pont: Pont<Coop, Standard>,
) => {
  it('traduit tous les noms de la coop vers le standard', () => {
    expect(
      pont.valeurs.filter((valeur) => pont.versStandard(valeur) == null),
    ).toEqual([])
  })

  it('revient au nom de la coop de départ', () => {
    const allerRetour = pont.valeurs.map((valeur) => {
      const standard = pont.versStandard(valeur)

      return standard == null ? null : pont.versCoop(standard)
    })

    expect(allerRetour).toEqual([...pont.valeurs])
  })
}

describe('pont de vocabulaire', () => {
  describe('service', () => exerceToutLeVocabulaire(vocabulaire.service))

  describe('typologie', () => exerceToutLeVocabulaire(vocabulaire.typologie))

  describe('frais à charge', () =>
    exerceToutLeVocabulaire(vocabulaire.fraisACharge))

  describe('itinérance', () => exerceToutLeVocabulaire(vocabulaire.itinerance))

  describe('modalité d’accès', () =>
    exerceToutLeVocabulaire(vocabulaire.modaliteAcces))

  describe('modalité d’accompagnement', () =>
    exerceToutLeVocabulaire(vocabulaire.modaliteAccompagnement))

  describe('public spécifiquement adressé', () =>
    exerceToutLeVocabulaire(vocabulaire.publicSpecifiquementAdresse))

  describe('prise en charge spécifique', () =>
    exerceToutLeVocabulaire(vocabulaire.priseEnChargeSpecifique))

  describe('formation et label', () =>
    exerceToutLeVocabulaire(vocabulaire.formationLabel))

  describe('dispositif ou programme national', () =>
    exerceToutLeVocabulaire(vocabulaire.dispositifProgrammeNational))
})
