import type { DescriptionData } from '@app/web/features/structures/DescriptionValidation'
import type { InformationsGeneralesData } from '@app/web/features/structures/InformationsGeneralesValidation'
import type { InformationsPratiquesData } from '@app/web/features/structures/InformationsPratiquesValidation'
import type { ModalitesAccesAuServiceData } from '@app/web/features/structures/ModalitesAccesAuServiceValidation'
import type { ServicesEtAccompagnementData } from '@app/web/features/structures/ServicesEtAccompagnementValidation'
import type { TypesDePublicsAccueillisData } from '@app/web/features/structures/TypesDePublicsAccueillisValidation'
import type { VisiblePourCartographieNationaleData } from '@app/web/features/structures/VisiblePourCartographieNationaleValidation'
import { fixTelephone } from '@app/web/utils/clean-operations'
import { onlyDefinedAndNotNull } from '@app/web/utils/onlyDefinedAndNotNull'
import { Itinerance, ModaliteAcces } from '@prisma/client'
import type { CreerLieuActiviteData } from './CreerLieuActiviteValidation'

/**
 * Projection de la saisie d'un lieu vers ses colonnes, section par section.
 *
 * Ces mappers sont purs et partagés : la création d'un lieu les applique toutes,
 * la modification n'applique que la section éditée. Ils vivaient dans le routeur
 * tRPC de la gestion des lieux ; ils en sont sortis pour que le parcours
 * d'inscription les applique aussi, plutôt que d'en tenir sa propre version.
 */
export const setInformationsGeneralesFields = ({
  nom,
  adresseBan,
  lieuItinerant,
  complementAdresse,
  siret,
  rna,
  nomUsage,
  typologies,
}: Omit<InformationsGeneralesData, 'id'>) => ({
  nom,
  adresse: adresseBan.nom,
  commune: adresseBan.commune,
  codePostal: adresseBan.codePostal,
  codeInsee: adresseBan.codeInsee,
  // Identifiant BAN de la voie : `coop.lieu_inclusion.ban_id` porte l'`id` de la
  // feature (« 80144_0018_00090 »), pas l'uuid `properties.banId` que stocke
  // `main.adresse.code_ban`. Il était perdu à l'écriture alors que la BAN le rend.
  banId: adresseBan.id,
  latitude: adresseBan.latitude,
  longitude: adresseBan.longitude,
  itinerance:
    lieuItinerant == null
      ? []
      : lieuItinerant
        ? [Itinerance.Itinerant]
        : [Itinerance.Fixe],
  complementAdresse,
  siret,
  rna,
  nomUsage: siret ? nomUsage : null,
  typologies,
})

export const setVisiblePourCartographieNationaleFields = ({
  visiblePourCartographieNationale,
}: Omit<VisiblePourCartographieNationaleData, 'id'>) => ({
  visiblePourCartographieNationale,
})

export const setInformationsPratiquesFields = ({
  siteWeb,
  ficheAccesLibre,
  horaires,
  priseRdv,
}: Omit<InformationsPratiquesData, 'id'>) => ({
  siteWeb: siteWeb ?? undefined,
  ficheAccesLibre: ficheAccesLibre ?? undefined,
  horaires: horaires ?? undefined,
  priseRdv: priseRdv ?? undefined,
})

export const setDescriptionFields = ({
  presentationResume,
  presentationDetail,
  formationsLabels,
}: Omit<DescriptionData, 'id'>) => ({
  presentationResume: presentationResume ?? undefined,
  presentationDetail: presentationDetail ?? undefined,
  formationsLabels: formationsLabels ?? undefined,
})

export const setServicesEtAccompagnementFields = ({
  services,
  modalitesAccompagnement,
}: Omit<ServicesEtAccompagnementData, 'id'>) => ({
  services: services ?? undefined,
  modalitesAccompagnement: modalitesAccompagnement ?? undefined,
})

export const setModalitesAccesAuServiceFields = ({
  modalitesAcces,
  fraisACharge,
}: Omit<ModalitesAccesAuServiceData, 'id'>) => ({
  telephone:
    modalitesAcces?.parTelephone && modalitesAcces?.numeroTelephone != null
      ? fixTelephone(modalitesAcces.numeroTelephone)
      : null,
  courriels:
    modalitesAcces?.parMail && modalitesAcces?.adresseMail != null
      ? [modalitesAcces.adresseMail]
      : [],
  modalitesAcces: modalitesAcces
    ? [
        modalitesAcces.surPlace ? ModaliteAcces.SePresenter : undefined,
        modalitesAcces.parTelephone ? ModaliteAcces.Telephoner : undefined,
        modalitesAcces.parMail ? ModaliteAcces.ContacterParMail : undefined,
      ].filter(onlyDefinedAndNotNull)
    : undefined,
  fraisACharge: fraisACharge ?? undefined,
})

export const setTypesDePublicsAccueillisFields = ({
  priseEnChargeSpecifique,
  publicsSpecifiquementAdresses,
}: Omit<TypesDePublicsAccueillisData, 'id'>) => ({
  priseEnChargeSpecifique: priseEnChargeSpecifique ?? undefined,
  publicsSpecifiquementAdresses: publicsSpecifiquementAdresses ?? undefined,
})

/** La saisie complète de création, projetée vers les colonnes du lieu. */
export const lieuInclusionDepuisSaisie = (saisie: CreerLieuActiviteData) => ({
  ...setInformationsGeneralesFields(saisie),
  ...setVisiblePourCartographieNationaleFields(saisie),
  ...setInformationsPratiquesFields(saisie),
  ...setDescriptionFields(saisie),
  ...setServicesEtAccompagnementFields(saisie),
  ...setModalitesAccesAuServiceFields(saisie),
  ...setTypesDePublicsAccueillisFields(saisie),
})
