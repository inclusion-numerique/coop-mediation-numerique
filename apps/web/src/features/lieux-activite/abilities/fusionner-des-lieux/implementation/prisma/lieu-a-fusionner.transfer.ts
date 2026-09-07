import { adresseSaisie } from '@app/web/features/lieux-activite/domain/saisie'
import { Courriel, Nom } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { IdentifiantCartographie } from '../../../../domain/ids-cartographie-nationale'
import { LieuId } from '../../../../domain/lieu-id'
import { MediateurId } from '../../../../domain/mediateur-id'
import type { LieuAFusionner } from '../../domain'
import type { LieuAFusionnerRow } from './lieu-a-fusionner.data'

/**
 * L'adresse du lieu, si la base en porte une exploitable.
 *
 * Les colonnes existent toujours mais peuvent être vides : un lieu en double
 * est justement le genre de lieu à qui cela arrive, et l'aperçu doit rester
 * lisible plutôt que refuser de s'afficher.
 */
const adresseDuLieu = (structure: LieuAFusionnerRow) =>
  adresseSaisie(
    {
      nom: structure.adresse,
      commune: structure.commune,
      codePostal: structure.codePostal,
      codeInsee: structure.codeInsee ?? '',
      latitude: 0,
      longitude: 0,
    },
    structure.complementAdresse,
  )

export const lieuAFusionnerToDomain = (
  structure: LieuAFusionnerRow,
  employeuseRelations: {
    readonly employesIds: readonly string[]
    readonly activitesEmployeurIds: readonly string[]
  },
): LieuAFusionner => ({
  id: LieuId(structure.id),
  nom: Nom(structure.nom),
  adresse: adresseDuLieu(structure),
  siret: structure.siret,
  rna: structure.rna,
  structureCartographieNationaleId:
    structure.structureCartographieNationaleId == null
      ? null
      : IdentifiantCartographie.safe(
          structure.structureCartographieNationaleId,
        ),
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
  courriels: structure.courriels.map(Courriel),
  employesIds: employeuseRelations.employesIds,
  mediateursEnActiviteIds: structure.mediateursEnActivite.map(
    ({ mediateurId }) => MediateurId(mediateurId),
  ),
  activitesEmployeurIds: employeuseRelations.activitesEmployeurIds,
  activitesLieuIds: structure.activites.map(({ id }) => id),
})
