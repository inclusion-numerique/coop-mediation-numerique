import { labelsToOptions } from '@app/ui/components/Form/utils/options'
import { ModaliteAccompagnement } from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { ModaliteAccompagnement as PrismaModaliteAccompagnement } from '@prisma/client'

export const modaliteAccompagnementLabels: Record<
  PrismaModaliteAccompagnement,
  ModaliteAccompagnement
> = {
  EnAutonomie: ModaliteAccompagnement.EnAutonomie,
  AccompagnementIndividuel: ModaliteAccompagnement.AccompagnementIndividuel,
  DansUnAtelierCollectif: ModaliteAccompagnement.DansUnAtelier,
  ADistance: ModaliteAccompagnement.ADistance,
}

export type ModaliteAccompagnementLabel =
  keyof typeof modaliteAccompagnementLabels

export const modaliteAccompagnementValues = Object.keys(
  modaliteAccompagnementLabels,
) as [ModaliteAccompagnementLabel, ...ModaliteAccompagnementLabel[]]

export const modalitesAccompagnementHints: {
  [key in ModaliteAccompagnementLabel]?: string
} = {
  ADistance: 'par téléphone ou en visioconférence',
}

export const modaliteAccompagnementOptions = labelsToOptions(
  modaliteAccompagnementLabels,
  { hints: modalitesAccompagnementHints },
)
