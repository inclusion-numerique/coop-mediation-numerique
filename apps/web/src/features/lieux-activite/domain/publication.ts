import { Service } from '@gouvfr-anct/lieux-de-mediation-numerique'
/**
 * La règle de publication sur la cartographie nationale : un lieu visible
 * annonce au moins un service.
 *
 * Une fiche publiée sans rien à offrir n'apprend rien à qui la trouve, et
 * l'annuaire national n'a pas de raison de la porter. La règle vaut donc des
 * deux côtés — on ne crée pas un lieu visible sans service, et on ne rend pas
 * visible un lieu qui n'en a pas, pas plus qu'on ne retire le dernier service
 * d'un lieu visible.
 *
 * Elle est dite ici sur des valeurs nues plutôt que sur un `Lieu` : le
 * formulaire de création la mesure sur sa saisie, la modification sur le lieu
 * qu'elle vient de composer. Une seule règle, deux façons de la rencontrer.
 */
export const PUBLICATION_SANS_SERVICE =
  'Au moins un service doit être renseigné pour que le lieu d’activité soit visible sur la cartographie.'

export const publicationSansService = (
  publie: boolean,
  services: readonly unknown[] | null | undefined,
): boolean => publie && (services?.length ?? 0) === 0

/**
 * Ce qu'un lieu annonce par défaut lorsqu'il devient visible sans avoir déclaré
 * le moindre service.
 *
 * Les deux que presque tous les lieux déclarent déjà : sur les 8 677 lieux
 * visibles de la coop, 96 % annoncent la maîtrise des outils du quotidien et
 * 93 % la compréhension du monde numérique. C'est aussi, à 458 lieux, la
 * deuxième combinaison exacte la plus répandue — autrement dit le socle minimal
 * réellement pratiqué, et donc le moins susceptible d'être faux.
 *
 * Ils ne valent que comme point de départ : la section « Services » reste
 * ouverte, et le médiateur les corrige ou les remplace.
 *
 * Sans eux, la règle « un lieu visible annonce au moins un service » enfermait :
 * elle refusait l'enregistrement de toutes les sections tant qu'aucun service
 * n'était déclaré, alors que celle qui les porte vient en avant-dernier.
 */
export const SERVICES_PAR_DEFAUT = [
  Service.MaitriseDesOutilsNumeriquesDuQuotidien,
  Service.ComprehensionDuMondeNumerique,
] as const

/** Les services du lieu, complétés d'un socle s'il n'en annonçait aucun. */
export const servicesALaPublication = (
  services: readonly Service[],
): readonly Service[] =>
  services.length === 0 ? SERVICES_PAR_DEFAUT : services
