/**
 * Le pont entre le vocabulaire de la coop et celui du schéma national.
 *
 * La coop a ses propres noms ; le standard `@gouvfr-anct` a les siens. Une
 * table par nomenclature dit la correspondance, et c'est la seule source : tout
 * le reste — la liste des valeurs pour Zod, la traduction dans un sens comme
 * dans l'autre, les libellés — en découle.
 *
 * Ces noms sont déclarés ici, et non empruntés au client Prisma : le
 * vocabulaire d'une feature n'a pas à dépendre de la façon dont elle se
 * stocke. Qu'ils soient exactement les valeurs des énumérations de la base
 * reste une obligation, tenue au compilateur par `db/ligne-du-lieu.ts` — le
 * seul endroit qui regarde le schéma.
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
export {
  libelles as typologieLibelles,
  type TypologieCoop,
  typologie,
} from './typologie'

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

/**
 * Les valeurs d'une énumération du schéma national reconnues parmi des libellés
 * bruts.
 *
 * Une source externe rend des chaînes ; les traiter d'emblée comme des valeurs
 * du standard demanderait un `as`, c'est-à-dire une affirmation qu'on ne vérifie
 * pas. Ce qu'on ne reconnaît pas est écarté, comme le fait `traduites` de ce
 * qu'elle ne sait pas traduire.
 */
export const reconnues = <Valeur extends string>(
  enumeration: Record<string, Valeur>,
  libelles: readonly string[],
): readonly Valeur[] => {
  const connues = new Set<string>(Object.values(enumeration))

  return libelles.filter((libelle): libelle is Valeur => connues.has(libelle))
}
