import type { AdresseBanData } from '@app/web/external-apis/ban/AdresseBanValidation'
import { CreerLieuActiviteValidation } from '@app/web/features/lieux-activite/domain/creation/creer-lieu-activite.validation'
import type { HorairesSaisis } from '@app/web/features/lieux-activite/domain/horaires.validation'
import type { FormationLabelPropose as FormationLabel } from '@app/web/features/lieux-activite/domain/nomenclatures'
import { emptyOpeningHours } from '@app/web/opening-hours/openingHoursHelpers'
import type {
  Frais as FraisACharge,
  ModaliteAccompagnement,
  PriseEnChargeSpecifique,
  PublicSpecifiquementAdresse,
  Service,
  Typologie,
} from '@gouvfr-anct/lieux-de-mediation-numerique'
import z from 'zod'

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
  openingHours: HorairesSaisis
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
})

export const CreerLieuActiviteFormValidation = z
  .custom<CreerLieuActiviteFormData>()
  .superRefine((value, context) => {
    const parsed = CreerLieuActiviteValidation.safeParse(toCreerLieuData(value))
    if (parsed.success) return
    context.issues.push(
      ...parsed.error.issues.map(({ path, message }) => ({
        code: 'custom' as const,
        path,
        message,
        input: value,
      })),
    )
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
  openingHours: emptyOpeningHours,
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
