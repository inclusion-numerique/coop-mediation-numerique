import {
  appendComment,
  emptyOpeningHours,
} from '@app/web/components/structure/fields/openingHoursHelpers'
import type { AdresseBanData } from '@app/web/external-apis/ban/AdresseBanValidation'
import { CreerLieuActiviteValidation } from '@app/web/features/lieux-activite/CreerLieuActiviteValidation'
import type { OpeningHoursData } from '@app/web/features/structures/OpeningHoursValidation'
import {
  fromTimetableOpeningHours,
  type Schedule,
} from '@gouvfr-anct/timetable-to-osm-opening-hours'
import type {
  FormationLabel,
  FraisACharge,
  ModaliteAccompagnement,
  PriseEnChargeSpecifique,
  PublicSpecifiquementAdresse,
  Service,
  Typologie,
} from '@prisma/client'
import { formOptions } from '@tanstack/react-form'
import z from 'zod'

/**
 * Saisie de création d'un lieu d'activité. Les champs texte sont des chaînes
 * (un input vidé rend `''`, pas `null`) et les cases à cocher uniques rendent
 * `null` quand elles sont décochées : `toCreerLieuData` remet cette saisie dans
 * la forme attendue par la validation et par la persistance.
 */
export type CreerLieuActiviteFormData = {
  nom: string
  adresseBan: AdresseBanData | null
  complementAdresse: string
  lieuItinerant: boolean | null
  typologies: Typologie[]
  visiblePourCartographieNationale: boolean
  presentationResume: string
  presentationDetail: string
  formationsLabels: FormationLabel[]
  siteWeb: string
  ficheAccesLibre: string
  priseRdv: string
  horairesComment: string
  openingHours: OpeningHoursData
  services: Service[]
  modalitesAccompagnement: ModaliteAccompagnement[]
  modalitesAcces: {
    surPlace: boolean | null
    parTelephone: boolean | null
    numeroTelephone: string
    parMail: boolean | null
    adresseMail: string
  }
  fraisACharge: FraisACharge[]
  priseEnChargeSpecifique: PriseEnChargeSpecifique[]
  toutPublic: boolean | null
  publicsSpecifiquementAdresses: PublicSpecifiquementAdresse[]
}

const emptyToNull = (value: string): string | null =>
  value.trim() === '' ? null : value

/** Saisie du formulaire projetée vers le contrat de création d'un lieu. */
export const toCreerLieuData = (value: CreerLieuActiviteFormData) => ({
  ...value,
  complementAdresse: emptyToNull(value.complementAdresse),
  presentationResume: emptyToNull(value.presentationResume),
  presentationDetail: emptyToNull(value.presentationDetail),
  siteWeb: emptyToNull(value.siteWeb),
  ficheAccesLibre: emptyToNull(value.ficheAccesLibre),
  priseRdv: emptyToNull(value.priseRdv),
  horairesComment: emptyToNull(value.horairesComment),
  modalitesAcces: {
    ...value.modalitesAcces,
    numeroTelephone: emptyToNull(value.modalitesAcces.numeroTelephone),
    adresseMail: emptyToNull(value.modalitesAcces.adresseMail),
  },
  horaires: appendComment(
    fromTimetableOpeningHours(value.openingHours as Schedule),
    emptyToNull(value.horairesComment),
  ),
})

/**
 * Le formulaire se valide avec le contrat de création lui-même : une seule
 * source de vérité entre la saisie et ce que la persistance acceptera.
 */
export const CreerLieuActiviteFormValidation = z
  .custom<CreerLieuActiviteFormData>()
  .superRefine((value, context) => {
    const parsed = CreerLieuActiviteValidation.safeParse(toCreerLieuData(value))
    if (parsed.success) return
    for (const issue of parsed.error.issues) context.addIssue(issue)
  })

export const creerLieuActiviteDefaultValues = (
  nom = '',
): CreerLieuActiviteFormData => ({
  nom,
  adresseBan: null,
  complementAdresse: '',
  lieuItinerant: null,
  typologies: [],
  visiblePourCartographieNationale: false,
  presentationResume: '',
  presentationDetail: '',
  formationsLabels: [],
  siteWeb: '',
  ficheAccesLibre: '',
  priseRdv: '',
  horairesComment: '',
  openingHours: emptyOpeningHours as OpeningHoursData,
  services: [],
  modalitesAccompagnement: [],
  modalitesAcces: {
    surPlace: null,
    parTelephone: null,
    numeroTelephone: '',
    parMail: null,
    adresseMail: '',
  },
  fraisACharge: [],
  priseEnChargeSpecifique: [],
  toutPublic: null,
  publicsSpecifiquementAdresses: [],
})

export const creerLieuActiviteFormOptions = formOptions({
  defaultValues: creerLieuActiviteDefaultValues(),
})
