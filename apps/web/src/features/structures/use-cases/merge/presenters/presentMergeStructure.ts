import { toTitleCase } from '@app/web/utils/toTitleCase'
import type { MergeStructure, MergeStructureInfo } from '../types'

export const presentMergeStructure = (
  structure: MergeStructure,
): MergeStructureInfo => ({
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
  employesIds:
    structure.structureAdministrative?.emplois.map((e) => e.userId) ?? [],
  mediateursEnActiviteIds: structure.mediateursEnActivite.map(
    (m) => m.mediateurId,
  ),
  activitesEmployeurIds:
    structure.structureAdministrative?.activites.map((a) => a.id) ?? [],
  activitesLieuIds: structure.activites.map((a) => a.id),
})
