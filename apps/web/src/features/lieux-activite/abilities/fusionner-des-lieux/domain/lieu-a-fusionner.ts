import type {
  Adresse,
  Courriel,
  Nom,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { IdentifiantCartographie } from '../../../domain/ids-cartographie-nationale'
import type { LieuId } from '../../../domain/lieu-id'
import type { MediateurId } from '../../../domain/mediateur-id'

/**
 * Ce que deux lieux peuvent avoir en commun, et que la fusion réunira.
 *
 * Les listes de vocabulaire restent des chaînes, à dessein : l'aperçu les
 * compare et les compte, il n'en lit jamais une seule. Les traduire vers le
 * schéma national écarterait ce qu'il ne reconnaît pas — et fausserait le
 * décompte que l'écran annonce, qui est tout le propos.
 *
 * Même raison pour les identifiants d'emplois et d'activités : ils désignent
 * des entités d'autres features, que celle-ci n'a pas à connaître pour dire
 * combien de leurs liens deux lieux partagent.
 */
export type ChampsPartageables = {
  readonly employesIds: readonly string[]
  readonly mediateursEnActiviteIds: readonly MediateurId[]
  readonly activitesEmployeurIds: readonly string[]
  readonly activitesLieuIds: readonly string[]
  readonly typologies: readonly string[]
  readonly services: readonly string[]
  readonly publicsSpecifiquementAdresses: readonly string[]
  readonly priseEnChargeSpecifique: readonly string[]
  readonly fraisACharge: readonly string[]
  readonly dispositifProgrammesNationaux: readonly string[]
  readonly formationsLabels: readonly string[]
  readonly autresFormationsLabels: readonly string[]
  readonly itinerance: readonly string[]
  readonly modalitesAcces: readonly string[]
  readonly modalitesAccompagnement: readonly string[]
  readonly courriels: readonly Courriel[]
}

/**
 * Un lieu candidat à la fusion : de quoi le reconnaître à l'écran, et ce qu'il
 * porte.
 *
 * Ce n'est pas un `Lieu` : ce qui intéresse la fusion, ce sont les rattachements
 * et les listes que deux lieux se partagent, que la fiche ne transporte pas.
 *
 * L'adresse peut manquer — 133 lieux actifs n'en ont pas de valide — et un lieu
 * en double est justement le genre de lieu à qui cela arrive.
 */
export type LieuAFusionner = ChampsPartageables & {
  readonly id: LieuId
  readonly nom: Nom
  readonly adresse: Adresse | null
  readonly siret: string | null
  readonly rna: string | null
  readonly structureCartographieNationaleId: IdentifiantCartographie | null
}
