import { ModaliteAcces } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { pont } from './pont'

const table = {
  SePresenter: ModaliteAcces.SePresenter,
  Telephoner: ModaliteAcces.Telephoner,
  ContacterParMail: ModaliteAcces.ContacterParMail,
  PrendreRdvEnLigne: ModaliteAcces.PrendreRdvEnLigne,
  PasDePublic: ModaliteAcces.PasDePublic,
  FicheDePrescription: ModaliteAcces.PrescriptionParMail,
} satisfies Record<string, ModaliteAcces>

export type ModaliteAccesCoop = keyof typeof table

export const modaliteAcces = pont(ModaliteAcces, table)
