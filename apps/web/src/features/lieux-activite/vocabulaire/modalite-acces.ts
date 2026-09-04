import { ModaliteAcces } from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { ModaliteAcces as ModaliteAccesCoop } from '@prisma/client'
import { pont } from './pont'

const table: Record<ModaliteAccesCoop, ModaliteAcces> = {
  SePresenter: ModaliteAcces.SePresenter,
  Telephoner: ModaliteAcces.Telephoner,
  ContacterParMail: ModaliteAcces.ContacterParMail,
  PrendreRdvEnLigne: ModaliteAcces.PrendreRdvEnLigne,
  PasDePublic: ModaliteAcces.PasDePublic,
  FicheDePrescription: ModaliteAcces.PrescriptionParMail,
}

export const modaliteAcces = pont(table)
