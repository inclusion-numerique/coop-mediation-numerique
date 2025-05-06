import { ModaliteAcces } from '@gouvfr-anct/lieux-de-mediation-numerique'
import { ModaliteAcces as PrismaModaliteAcces } from '@prisma/client'

export const modaliteAccesLabels: Record<PrismaModaliteAcces, ModaliteAcces> = {
  SePresenter: ModaliteAcces.SePresenter,
  Telephoner: ModaliteAcces.Telephoner,
  ContacterParMail: ModaliteAcces.ContacterParMail,
  PrendreRdvEnLigne: ModaliteAcces.PrendreRdvEnLigne,
  PasDePublic: ModaliteAcces.PasDePublic,
  FicheDePrescription: ModaliteAcces.PrescriptionParMail,
}

export const modaliteAccesKeys: Record<ModaliteAcces, PrismaModaliteAcces> =
  Object.fromEntries(
    Object.entries(modaliteAccesLabels).map(([key, value]) => [value, key]),
  ) as Record<ModaliteAcces, PrismaModaliteAcces>
