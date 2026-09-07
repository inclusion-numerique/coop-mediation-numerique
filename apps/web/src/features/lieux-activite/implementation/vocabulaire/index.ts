/**
 * Le pont entre les noms sous lesquels la base stocke les nomenclatures et les
 * valeurs du schéma national.
 *
 * C'est la seule traduction qui subsiste : partout ailleurs — domaine,
 * formulaires, écrans — le vocabulaire est celui du standard. Une table par
 * nomenclature dit la correspondance, et déclare ses noms plutôt que de les
 * emprunter au client Prisma.
 *
 * Que ces noms soient exactement les valeurs des énumérations de la base reste
 * une obligation, tenue au compilateur par `ligne-du-lieu.ts` — le seul fichier
 * de la feature qui regarde le schéma.
 */
export {
  type DispositifProgrammeNationalCoop,
  dispositifProgrammeNational,
} from './dispositif-programme-national'
export { type FormationLabelCoop, formationLabel } from './formation-label'
export { type FraisAChargeCoop, fraisACharge } from './frais-a-charge'
export { type ItineranceCoop, itinerance } from './itinerance'
export { type ModaliteAccesCoop, modaliteAcces } from './modalite-acces'
export {
  type ModaliteAccompagnementCoop,
  modaliteAccompagnement,
} from './modalite-accompagnement'
export {
  type PriseEnChargeSpecifiqueCoop,
  priseEnChargeSpecifique,
} from './prise-en-charge-specifique'
export {
  type PublicSpecifiquementAdresseCoop,
  publicSpecifiquementAdresse,
} from './public-specifiquement-adresse'
export { type ServiceCoop, service } from './service'
export { type TypologieCoop, typologie } from './typologie'

/**
 * Une valeur que le pont ne sait pas traduire est écartée plutôt que portée
 * telle quelle : le domaine ne doit contenir que du vocabulaire du standard.
 */
export const traduites = <Depuis, Vers>(
  valeurs: readonly Depuis[],
  traduction: (valeur: Depuis) => Vers | null,
): readonly Vers[] =>
  valeurs
    .map(traduction)
    .filter((valeur): valeur is NonNullable<Vers> => valeur != null)
