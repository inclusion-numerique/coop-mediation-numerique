import { dispositifProgrammeNationalKeys } from '@app/web/app/structure/dispositifProgrammesNationaux'
import { formationLabelKeys } from '@app/web/app/structure/formationLabel'
import { fraisAChargeKeys } from '@app/web/app/structure/fraisACharge'
import { itineranceKeys } from '@app/web/app/structure/itinerance'
import { modaliteAccompagnementKeys } from '@app/web/app/structure/modaliteAccompagnement'
import { modaliteAccesKeys } from '@app/web/app/structure/modalitesAcces'
import { priseEnChargeSpecifiqueKeys } from '@app/web/app/structure/priseEnChargeSpecifique'
import { publicSpecifiquementAdresseKeys } from '@app/web/app/structure/publicSpecifiquementAdresse'
import { serviceKeys } from '@app/web/app/structure/service'
import type { LieuStandardMediationNumerique } from '@app/web/data/standard-mediation-numerique/LieuStandardMediationNumerique'
import {
  DispositifProgrammeNational,
  FormationLabel,
  Frais,
  Itinerance,
  ModaliteAcces,
  ModaliteAccompagnement,
  PriseEnChargeSpecifique,
  PublicSpecifiquementAdresse,
  Service,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import { Prisma, Typologie } from '@prisma/client'

export const structureToPrismaModel = (
  structure: LieuStandardMediationNumerique,
): Prisma.StructureCreateManyInput => ({
  nom: structure.nom,
  latitude: structure.latitude,
  longitude: structure.longitude,
  presentationDetail: structure.presentation_detail,
  presentationResume: structure.presentation_resume,
  siteWeb: structure.site_web,
  telephone: structure.telephone,
  typologies: structure.typologie?.split('|') as Typologie[] | undefined,
  adresse: structure.adresse,
  autresFormationsLabels: structure.autres_formations_labels?.split('|'),
  codeInsee: structure.code_insee,
  codePostal: structure.code_postal,
  commune: structure.commune,
  complementAdresse: structure.complement_adresse,
  courriels: structure.courriels?.split('|'),
  dispositifProgrammesNationaux: structure.dispositif_programmes_nationaux
    ?.split('|')
    .map(
      (dispositif) =>
        dispositifProgrammeNationalKeys[
          dispositif as DispositifProgrammeNational
        ],
    ),
  ficheAccesLibre: structure.fiche_acces_libre,
  formationsLabels: structure.formations_labels
    ?.split('|')
    .map(
      (formationLabel) => formationLabelKeys[formationLabel as FormationLabel],
    ),
  fraisACharge: structure.frais_a_charge
    ?.split('|')
    .map((frais) => fraisAChargeKeys[frais as Frais]),
  horaires: structure.horaires,
  itinerance: structure.itinerance
    ?.split('|')
    .map((itineranceLabel) => itineranceKeys[itineranceLabel as Itinerance]),
  modalitesAcces: structure.modalites_acces
    ?.split('|')
    .map((modaliteAcces) => modaliteAccesKeys[modaliteAcces as ModaliteAcces]),
  modalitesAccompagnement: structure.modalites_accompagnement
    ?.split('|')
    .map(
      (modaliteAccompagnement) =>
        modaliteAccompagnementKeys[
          modaliteAccompagnement as ModaliteAccompagnement
        ],
    ),
  priseEnChargeSpecifique: structure.prise_en_charge_specifique
    ?.split('|')
    .map(
      (priseEnCharge) =>
        priseEnChargeSpecifiqueKeys[priseEnCharge as PriseEnChargeSpecifique],
    ),
  priseRdv: structure.prise_rdv,
  publicsSpecifiquementAdresses: structure.publics_specifiquement_adresses
    ?.split('|')
    .map(
      (publicSpecifiquementAdresse) =>
        publicSpecifiquementAdresseKeys[
          publicSpecifiquementAdresse as PublicSpecifiquementAdresse
        ],
    ),
  services: structure.services
    ?.split('|')
    .map((serviceLabel) => serviceKeys[serviceLabel as Service]),
  structureParente: structure.structure_parente,
  structureCartographieNationaleId: structure.id === '' ? null : structure.id,
  modification: new Date(structure.date_maj),
})
