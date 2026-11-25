import {
  Adresse,
  Courriel,
  Nom,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import {
  adresseSaisie,
  complementAdresseSaisi,
} from '@/features/lieux-activite/domain/saisie/saisie'
import { IdentifiantCartographie } from '../../../../domain/cartographie-nationale/ids-cartographie-nationale'
import { LieuId } from '../../../../domain/identifiants/lieu-id'
import { MediateurId } from '../../../../domain/identifiants/mediateur-id'
import type { LieuAFusionner } from '../../domain'
import type { LieuAFusionnerRow } from './lieu-a-fusionner.select'

const adresseSansCodeInsee = (structure: LieuAFusionnerRow) => {
  const complement = complementAdresseSaisi(structure.complementAdresse)
  return Adresse.safe({
    voie: structure.adresse,
    commune: structure.commune,
    code_postal: structure.codePostal,
    ...(complement == null ? {} : { complement_adresse: complement }),
  })
}

const adresseDuLieu = (structure: LieuAFusionnerRow) =>
  structure.codeInsee === null
    ? adresseSansCodeInsee(structure)
    : adresseSaisie(
        {
          nom: structure.adresse,
          commune: structure.commune,
          codePostal: structure.codePostal,
          codeInsee: structure.codeInsee,
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
  structureCartographieNationaleId: IdentifiantCartographie.safe(
    structure.inscriptionRegistre?.structureCartographieNationaleId ?? '',
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
