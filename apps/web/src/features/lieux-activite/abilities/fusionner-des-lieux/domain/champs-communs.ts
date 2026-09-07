import type { ChampsPartageables } from './lieu-a-fusionner'

const communes = <T>(source: readonly T[], cible: readonly T[]): readonly T[] =>
  source.filter((valeur) => cible.includes(valeur))

/**
 * Ce que deux lieux partagent déjà : l'intersection, champ par champ.
 *
 * Écrite explicitement plutôt que dérivée d'une liste de clés. La forme dérivée
 * demandait un `as` pour se convaincre du résultat, et une seconde liste de
 * clés à tenir en phase avec le type — deux occasions de mentir, pour seize
 * lignes économisées.
 */
export const champsCommuns = (
  source: ChampsPartageables,
  cible: ChampsPartageables,
): ChampsPartageables => ({
  employesIds: communes(source.employesIds, cible.employesIds),
  mediateursEnActiviteIds: communes(
    source.mediateursEnActiviteIds,
    cible.mediateursEnActiviteIds,
  ),
  activitesEmployeurIds: communes(
    source.activitesEmployeurIds,
    cible.activitesEmployeurIds,
  ),
  activitesLieuIds: communes(source.activitesLieuIds, cible.activitesLieuIds),
  typologies: communes(source.typologies, cible.typologies),
  services: communes(source.services, cible.services),
  publicsSpecifiquementAdresses: communes(
    source.publicsSpecifiquementAdresses,
    cible.publicsSpecifiquementAdresses,
  ),
  priseEnChargeSpecifique: communes(
    source.priseEnChargeSpecifique,
    cible.priseEnChargeSpecifique,
  ),
  fraisACharge: communes(source.fraisACharge, cible.fraisACharge),
  dispositifProgrammesNationaux: communes(
    source.dispositifProgrammesNationaux,
    cible.dispositifProgrammesNationaux,
  ),
  formationsLabels: communes(source.formationsLabels, cible.formationsLabels),
  autresFormationsLabels: communes(
    source.autresFormationsLabels,
    cible.autresFormationsLabels,
  ),
  itinerance: communes(source.itinerance, cible.itinerance),
  modalitesAcces: communes(source.modalitesAcces, cible.modalitesAcces),
  modalitesAccompagnement: communes(
    source.modalitesAccompagnement,
    cible.modalitesAccompagnement,
  ),
  courriels: communes(source.courriels, cible.courriels),
})
