import { labelsToOptions } from '@app/ui/components/Form/utils/options'
import { InternetIcon } from '@app/web/features/pictograms/digital/InternetIcon'
import { SittingAtATableIcon } from '@app/web/features/pictograms/user/SittingAtATableIcon'
import { TeacherIcon } from '@app/web/features/pictograms/user/TeacherIcon'
import { PairIcon } from '@app/web/features/pictograms/work/PairIcon'
import { ModaliteAccompagnement } from '@gouvfr-anct/lieux-de-mediation-numerique'
import type { ModaliteAccompagnement as PrismaModaliteAccompagnement } from '@prisma/client'
import type { ComponentType } from 'react'

export const modaliteAccompagnementLabels: Record<
  PrismaModaliteAccompagnement,
  ModaliteAccompagnement
> = {
  EnAutonomie: ModaliteAccompagnement.EnAutonomie,
  AccompagnementIndividuel: ModaliteAccompagnement.AccompagnementIndividuel,
  DansUnAtelierCollectif: ModaliteAccompagnement.DansUnAtelier,
  ADistance: ModaliteAccompagnement.ADistance,
}

export const modaliteAccompagnementKeys: Record<
  ModaliteAccompagnement,
  PrismaModaliteAccompagnement
> = Object.fromEntries(
  Object.entries(modaliteAccompagnementLabels).map(([key, value]) => [
    value,
    key,
  ]),
) as Record<ModaliteAccompagnement, PrismaModaliteAccompagnement>

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

export const modaliteAccompagnementIcons: Record<
  PrismaModaliteAccompagnement,
  ComponentType<{ width?: number; height?: number }>
> = {
  EnAutonomie: PairIcon,
  AccompagnementIndividuel: SittingAtATableIcon,
  DansUnAtelierCollectif: TeacherIcon,
  ADistance: InternetIcon,
}
