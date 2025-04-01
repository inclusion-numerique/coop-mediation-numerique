import type { LieuStandardMediationNumerique } from '@app/web/data/standard-mediation-numerique/LieuStandardMediationNumerique'
import type {
  DispositifProgrammeNational,
  FormationLabel,
  FraisACharge,
  Itinerance,
  ModaliteAcces,
  ModaliteAccompagnement,
  PriseEnChargeSpecifique,
  Prisma,
  PublicSpecifiquementAdresse,
  Service,
  Typologie,
} from '@prisma/client'

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
  typologies: structure.typologie?.split('|') as Typologie[],
  adresse: structure.adresse,
  autresFormationsLabels: structure.autres_formations_labels?.split('|'),
  codeInsee: structure.code_insee,
  codePostal: structure.code_postal,
  commune: structure.commune,
  complementAdresse: structure.complement_adresse,
  courriels: structure.courriels?.split('|'),
  dispositifProgrammesNationaux:
    structure.dispositif_programmes_nationaux?.split(
      '|',
    ) as DispositifProgrammeNational[],
  ficheAccesLibre: structure.fiche_acces_libre,
  formationsLabels: structure.formations_labels?.split('|') as FormationLabel[],
  fraisACharge: structure.frais_a_charge?.split('|') as FraisACharge[],
  horaires: structure.horaires,
  itinerance: structure.itinerance?.split('|') as Itinerance[],
  modalitesAcces: structure.modalites_acces?.split('|') as ModaliteAcces[],
  modalitesAccompagnement: structure.modalites_accompagnement?.split(
    '|',
  ) as ModaliteAccompagnement[],
  priseEnChargeSpecifique: structure.prise_en_charge_specifique?.split(
    '|',
  ) as PriseEnChargeSpecifique[],
  priseRdv: structure.prise_rdv,
  publicsSpecifiquementAdresses:
    structure.publics_specifiquement_adresses?.split(
      '|',
    ) as PublicSpecifiquementAdresse[],
  services: structure.services?.split('|') as Service[],
  structureParente: structure.structure_parente,
  structureCartographieNationaleId: structure.id === '' ? null : structure.id,
  modification: new Date(structure.date_maj),
})
