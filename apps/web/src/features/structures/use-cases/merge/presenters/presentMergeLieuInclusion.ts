import { toTitleCase } from '@app/web/utils/toTitleCase'
import type { MergeLieuInclusion, MergeLieuInclusionInfo } from '../types'

export const presentMergeLieuInclusion = (
  structure: MergeLieuInclusion,
  employeuseRelations: {
    employesIds: string[]
    activitesEmployeurIds: string[]
  },
): MergeLieuInclusionInfo => ({
  id: structure.id,
  nom: toTitleCase(structure.nom, { noUpper: true }),
  adresse: toTitleCase(structure.adresse, { noUpper: true }),
  commune: toTitleCase(structure.commune),
  codePostal: structure.codePostal,
  siret: structure.siret,
  rna: structure.rna,
  structureCartographieNationaleId: structure.structureCartographieNationaleId,
  typologies: structure.typologies,
  services: structure.services,
  publicsSpecifiquementAdresses: structure.publicsSpecifiquementAdresses,
  priseEnChargeSpecifique: structure.priseEnChargeSpecifique,
  fraisACharge: structure.fraisACharge,
  dispositifProgrammesNationaux: structure.dispositifProgrammesNationaux,
  formationsLabels: structure.formationsLabels,
  autresFormationsLabels: structure.autresFormationsLabels,
  itinerance: structure.itinerance,
  modalitesAcces: structure.modalitesAcces,
  modalitesAccompagnement: structure.modalitesAccompagnement,
  courriels: structure.courriels,
  employesIds: employeuseRelations.employesIds,
  mediateursEnActiviteIds: structure.mediateursEnActivite.map(
    (m) => m.mediateurId,
  ),
  activitesEmployeurIds: employeuseRelations.activitesEmployeurIds,
  activitesLieuIds: structure.activites.map((a) => a.id),
})
